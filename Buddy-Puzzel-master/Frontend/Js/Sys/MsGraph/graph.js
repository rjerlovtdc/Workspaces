/**
 * @module Sys-Graph
*/


/** @function
 * @name getFromMSGraph
 * @param {string} endpoint - Endpoint string
 * @param {string} token - Token
 * @description Call MS Endpoint
 * @since 1.0.0.0
*/
async function getFromMSGraph(endpoint, token) {
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    let tdcJson = { "availability": "PresenceUnknown", "activity": "PresenceUnknown" };
    let tcdResponse = await fetch(endpoint, options);
    console.info("(getFromMSGraph) tcdResponse", tcdResponse);

    if (!tcdResponse.ok) {
        return tdcJson;
    }

    tdcJson = await tcdResponse.json();
    console.info("(getFromMSGraph) tdcJson", tdcJson);

    return tdcJson;
}


function postMSGraph(endpoint, token, stateObj) {
    console.debug("(postMSGraph) In");
    console.info("(postMSGraph) endpoint", endpoint);

    let _msalCustomerConfig = msalCustomerConfig[custObj.customerKey][agentObj.msalConfig];
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Content-Type", "application/json");
    headers.append("Authorization", bearer);

    let _body = {
        "sessionId": _msalCustomerConfig.clientId,
        "availability": stateObj.availability,
        "activity": stateObj.activity,
        "expirationDuration": "PT1H"
    };

    console.info("(postMSGraph) _body", _body);

    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(_body)
    };

    fetch(endpoint, options)
        .then(response => console.info("(postMSGraph) reponse", response))
        .catch(error => console.error("(postMSGraph) error", error));
}

function updateUI(data, endpoint) {
    console.info("(updateUI) data", data);
    console.info("(updateUI) endpoint", endpoint);
}