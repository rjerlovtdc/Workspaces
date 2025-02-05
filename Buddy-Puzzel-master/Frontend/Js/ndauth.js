/**
 * @module ndAuth
*/


/** @function
 * @name auth
 * @async
 * @description Puzzel authentication
 * @since 1.0.0.0
*/
const auth = async () => {
    console.debug("(auth) In");

    let apiRequest = await fetch('https://auth.puzzel.com/api/Authenticate/LogIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(custObj)
    });

    let apiResponse = await apiRequest.json();
    console.info("(auth) apiResponse", apiResponse);

    custObj.accessToken = apiResponse.accessToken;
    appDataObj.tokenSessionId = apiResponse.refreshToken.sessionId;
    appDataObj.tokenCustomerKey = apiResponse.refreshToken.customerKey;

    console.info("(auth) accessTokenAuth", custObj.accessToken);
    console.info("(auth) appDataObj", appDataObj);

    console.debug("(auth) Out");
}


/** @function
 * @name refreshAuth
 * @async
 * @description Puzzel authentication refresh
 * @since 1.0.0.0
*/
const refreshAuth = async () => {
    console.debug("(refreshAuth) In");

    let bodyData = {
        "customerKey": appDataObj.tokenCustomerKey,
        "sessionId": appDataObj.tokenSessionId
    }
    console.debug("(refreshAuth) bodyData", bodyData);
    let apiRequest = await fetch('https://auth.puzzel.com/api/Authenticate/GetAccessToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })

    let apiResponse = await apiRequest.json();
    custObj.accessToken = apiResponse;

    console.debug("(refreshAuth) In");
}