(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mousetrap')) :
	typeof define === 'function' && define.amd ? define(['exports', 'mousetrap'], factory) :
	(global = global || self, factory(global.widgetApiLib = {}, global.Mousetrap));
}(this, (function (exports, Mousetrap) { 'use strict';

	Mousetrap = Mousetrap && Object.prototype.hasOwnProperty.call(Mousetrap, 'default') ? Mousetrap['default'] : Mousetrap;

	function promiseTimeout(promise, ms) {
		let id;

		// Create a promise that rejects in <ms> milliseconds
		const timeout = new Promise((resolve, reject) => {
			id = setTimeout(() => reject(new Error('Promise timeout')), ms);
		});

		// Returns a race between our timeout and the passed in promise
		return Promise.race([promise, timeout])
			.then(ret => {
				id && clearTimeout(id);
				return ret;
			}).catch(err => {
				id && clearTimeout(id);
				throw err;
			});
	}

	// Parses a string URL into URL components.
	function getLocation(href) {
		const match = href.match(/^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
		if (match) {
			return {
				href: href,
				protocol: match[1],
				host: match[2],
				hostname: match[3],
				port: match[4],
				pathname: match[5],
				search: match[6],
				hash: match[7]
			};
		}
		return {};
	}

	// Checks if two (or more) hosts are the same. Supports the '*' wildcard.
	function isMatchingHost(...hosts) {
		const tokenizedHosts = hosts
			// Tokenize the hostnames.
			.map(host => (host || '').split('.'))
			// Reverse the order of the tokens so the matching begins with the most significant domain first.
			.map(host => host.reverse())
			// Sort them by length so the longest domain is the base to match against.
			.sort((a, b) => b.length - a.length);

		const [baseHost, ...matchingHosts] = tokenizedHosts;

		return baseHost.every((token, i) => matchingHosts.every(host => {
			// If there is not a corresponding token in the matching host, check if the last token is a wildcard.
			if (host.length < i + 1) return (host[host.length - 1] === '*');
			// Otherwise check for an exact match or a wildcard.
			return host[i] === token || host[i] === '*' || token === '*';
		}));
	}

	// Checks if two URLs belong to the same origin.
	function isSameOrigin(urlA, urlB) {
		const locationA = getLocation(urlA);
		const locationB = getLocation(urlB);
		return (
			isMatchingHost(locationA.hostname, locationB.hostname) &&
			locationA.port === locationB.port &&
			locationA.protocol === locationB.protocol
		);
	}

	const WIDGET_API_PROTOCOL_VERSION = 'WIDGET_API_PROTOCOL_1';

	const DEFAULT_ORIGINS = [
		'https://*.puzzel.com'
	];

	const CALL_TIMEOUT = 20000;

	class Api {
		constructor(port, config, {receiver: customReceiver}, origin) {
			this._id = 1000;
			this._calls = new Map();
			this._port = port;
			this._config = config;
			this._origin = origin;
			this._subscriptions = {};
			this._observers = {};
			this._callbacks = {};
			this._mt = new Mousetrap();
			port.onmessage = message => {
				// Process the message.
				this._receiver(message);
				// If there is a custom receiver, call it.
				customReceiver && customReceiver(message, port);
			};

			// Implement the current keyboard policy.
			this._applyKeyboardPolicy(config.keyboardPolicy || {});

			// Enable the keyboard shortcuts integration.
			this.on('SYSTEM_APPLY_KEYBOARD_POLICY', policy => this._applyKeyboardPolicy(policy));
		}

		get options() {
			return this._config;
		}

		get port() {
			return this._port;
		}

		get origin() {
			return this._origin;
		}

		// Applies a keyboard policy map
		_applyKeyboardPolicy(policy) {
			this._mt.reset();

			Object.keys(policy).forEach(key => {
				const shortcut = policy[key];
				const {command, target} = shortcut;
				const combo = String(shortcut.combo).toLowerCase();

				this._mt.bind(combo, event => {
					if (event.preventDefault) {
						event.preventDefault();
					} else {
						event.returnValue = false; // IE
					}

					this.call('events.publish', command, {target});
				});
			});
		}

		// A handler for the messages of the Widget API
		_receiver(message) {
			const {type} = message.data;

			type === 'event' && this._handleEvent(message.data);
			type === 'changed' && this._handlePropertyChange(message.data);
			type === 'result' && this._handleResult(message.data);
			type === 'error' && this._handleError(message.data);
			type === 'call' && this._handleCallbackCall(message.data);
		}

		_handleResult({value, id}) {
			if (this._calls.has(id)) {
				const {resolve} = this._calls.get(id);
				this._calls.delete(id);
				resolve(value);
			}
		}

		_handleError({value, id}) {
			if (this._calls.has(id)) {
				const {reject} = this._calls.get(id);
				this._calls.delete(id);
				reject(value);
			}
		}

		_handleEvent({name, value}) {
			this._subscriptions[name] && this._subscriptions[name].forEach(handler => handler(value));
		}

		_handlePropertyChange({name, old: oldValue, new: newValue}) {
			this._observers[name] && this._observers[name].forEach(handler => handler(newValue, oldValue));
		}

		_handleCallbackCall({name, value, id}) {
			if (!this._callbacks[name]) {
				this._port.postMessage({error: 'Callback not found.', id});
				return;
			}

			new Promise(resolve => resolve(this._callbacks[name](...value)))
				.then(result => {
					this._port.postMessage({result, id});
				})
				.catch(error => {
					this._port.postMessage({error, id});
				});
		}

		// Attaches a handler to an event
		on(event, handler) {
			const alreadySubscribed = Array.isArray(this._subscriptions[event]);

			// Add the handler to the list of handlers handling the event.
			this._subscriptions[event] = alreadySubscribed ? this._subscriptions[event].concat(handler) : [handler];

			// Subscribe to the event if not already subscribed.
			if (!alreadySubscribed) {
				this._port.postMessage({subscribe: event});
			}

			return () => {
				const subscriptions = this._subscriptions[event];
				if (subscriptions) {
					this._subscriptions[event] = subscriptions.filter(subscription => subscription !== handler);
				}
			};
		}

		// Calls a method
		call(method, ...args) {
			const result = new Promise((resolve, reject) => {
				this._calls.set(this._id, {resolve, reject});
				this._port.postMessage({call: method, args, id: this._id});
				this._id += 1;
			});

			return promiseTimeout(result, CALL_TIMEOUT);
		}

		// Returns the value of a property
		get(property) {
			return this.call(property);
		}

		// Listens for property changes
		watch(property, handler) {
			const alreadyObserving = Array.isArray(this._observers[property]);

			// Add the handler to the list of handlers handling the property changes.
			this._observers[property] = alreadyObserving ? this._observers[property].concat(handler) : [handler];

			// Observe to the property if not already observing.
			if (!alreadyObserving) {
				this._port.postMessage({watch: property});
			}

			return () => {
				const observers = this._observers[property];
				if (observers) {
					this._observers[property] = observers.filter(observer => observer !== handler);
				}
			};
		}

		ready() {
			this._port.postMessage({ready: true});
		}

		// Registers a callback function on the given name.
		callback(name, func) {
			this._callbacks[name] = func;

			return () => {
				delete this._callbacks[name];
			};
		}
	}

	// Returns a channel to the widget API and the configuration data
	function connect(origins = DEFAULT_ORIGINS, options = {}) {
		return new Promise((resolve, reject) => {
			// Make sure that "origins" is an array.
			if (!Array.isArray(origins)) {
				origins = [origins];
			}

			const handshake = message => {
				// Ignore messages that are not initiated by the widget API.
				if (!message.data || message.data.type !== WIDGET_API_PROTOCOL_VERSION) {
					return;
				}

				// Remove the event listener once initiated.
				window.removeEventListener('message', handshake);

				// Check if the host is allowed.
				if (origins.some(origin => isSameOrigin(origin, message.origin))) {
					resolve(new Api(message.ports[0], message.data, options, message.origin));
				} else {
					reject(new Error(`Connection to host rejected: The origin ${message.origin} doesn't match.`));
				}
			};

			window.addEventListener('message', handshake);
			window.parent.postMessage(WIDGET_API_PROTOCOL_VERSION, '*');
		});
	}

	exports.DEFAULT_ORIGINS = DEFAULT_ORIGINS;
	exports.WIDGET_API_PROTOCOL_VERSION = WIDGET_API_PROTOCOL_VERSION;
	exports.connect = connect;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
