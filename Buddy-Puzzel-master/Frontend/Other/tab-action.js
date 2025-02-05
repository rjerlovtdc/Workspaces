const DOMready = async () => {
  return new Promise(resolve => { window.addEventListener('load', resolve) })
}

const main = async () => {

  // Wait until DOM is Ready
  await DOMready()
  // Connect to the postMessage API using the Widget API Lib.
  const api = await widgetApiLib.connect()

  // Subscribe to contact centre requests/states/statuses and add a state
  // Calls
  api.on('SYSTEM_INCOMING_CALL', onIncomingCall)
  api.on('FOCUS_TAB', onFocusTab)

  // Flag that your page is ready to receive events
  api.ready()

  // Add Logic here
  sendEvent = async ({call}) => {
    await api.call('events.publish', 'FOCUS_TAB', {"data": {"tab": {"focus": true}}})
    await api.call('tab.setTitle', `Caller: ${call.caller}`)
    await api.call('tab.setDescription', `Queue: ${call.queueKey}`)
  }
  
  // Do something on contact centre requests
  // Calls
  function onIncomingCall({call}) {
    console.log(call)
    sendEvent({call})
  }

  function onFocusTab(data) {
    console.log(data)
  }
}

// Start the Async Function
main()