// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js


var msalUsername = "";

function selectAccount() {
    console.debug("(selectAccount In");
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();
    console.info("(selectAccount) currentAccounts", currentAccounts);

    if (currentAccounts.length === 0) {
        console.warn("(selectAccount) No accounts detected.");
        return;
    } else if (currentAccounts.length > 1) {
        // Add choose account code here
        console.warn("(selectAccount) Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        msalUsername = currentAccounts[0].username;
        console.info("(selectAccount) msalUsername", msalUsername);

        $("#infoMsUsername").val(msalUsername);

    }
    console.debug("(selectAccount Out");
}

function handleResponse(response) {
    console.debug("(handleResponse) In");
    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    if (response !== null) {
        console.info("(handleResponse) response", response)
        msalUsername = response.account.username;
        console.info("(handleResponse) msalUsername", msalUsername)

        $("#infoMsUsername").removeClass("ndColorLightRed").addClass("ndColorGreen");
        $("#infoMsUsername").val(msalUsername);
        $("#infoMsSignInBtn").hide();
        $("#infoMsSignOutBtn").show();

    }
    else {
        selectAccount();
    }

    console.debug("(handleResponse) Out");
}

function signIn() {
    console.debug("(signIn) In");
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.error("(signIn) error", { error });

            if (error.errorCode === "user_cancelled") {
                $("#infoMsUsername").val("<login afbrudt>");
                return;
            }

            let errorTextObj = teamsLoginErrorTexts["DA"][error.errorCode] || "";
            let titleText = errorTextObj?.Title || "MS Teams - ukendt fejl";
            let errorText = errorTextObj?.ErrorText || error.errorMessage;

            if (error.errorCode === "popup_window_error") {
                titleText = "MS Teams - Ingen popup";
                errorText = `Det var ikke muligt at åbne popup vindue for login<br />
                    Dette skyldes ofte en popup blocker i din browser<br /><br />
                    Tillad popup i Chrome:<br />
                    <img class="tdcBorder" src="Res/Screenshots/chrome_popup.png" width="302" height="265" /><br /><br />
                    Tillad popup i Edge:<br />
                    <img class="tdcBorder" src="Res/Screenshots/edge_popup.png" width="381" height="265" />
                    `;
            }

            $("#infoMsSignInBtn").show();
            $("#infoMsSignOutBtn").hide();

            $("#tdcModal_ID").modal('show', { title: titleText, bodyText: errorText });
        });
    console.debug("(signIn) Out");
}

function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */
    console.debug("(signOut) In");
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(msalUsername),
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
        mainWindowRedirectUri: msalConfig.auth.redirectUri
    };

    myMSALObj.logoutPopup(logoutRequest)
        .then(() => {
            let errorB = $("#infoMsUsername").attr("error");
            if (errorB !== "true") {
                console.info("(ndloggerCallback) Info Logout");
                $("#infoMsSignOutBtn").hide();
                $("#infoMsSignInBtn").show();

                $("#infoMsUsername").val("<ikke logget på>");
                $("#infoMsUsername").removeClass("ndColorGreen").addClass("ndColorRed");
            }
            $("#infoMsUsername").attr("error", "");
        })
        .catch(error => {
            console.error("(signOut) error", error);
        });

    console.debug("(signOut) Out");
}

async function getTokenPopup(request) {
    /* See here for more info on account retrieval: 
    * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
    */
    console.info("(getTokenPopup) myMSALObj", myMSALObj);
    if (Object.keys(myMSALObj).length === 0) {
        console.info("(getTokenPopup) Not Initialized");
        return;
    }

    request.account = myMSALObj.getAccountByUsername(msalUsername);

    return myMSALObj.acquireTokenSilent(request)
        .catch(error => {
            console.warn("(getTokenPopup) silent token acquisition fails. acquiring token using popup");
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenPopup(request)
                    .then(tokenResponse => {
                        console.info("(getTokenPopup) tokenResponse", tokenResponse);
                        return tokenResponse;
                    }).catch(error => {
                        console.error("(getTokenPopup) error", error);
                    });
            } else {
                console.warn("(getTokenPopup) warning", error);
            }
        });
}

function seeProfile() {
    console.debug("(seeProfile) In");

    getTokenPopup(loginRequest)
        .then(response => {
            getFromMSGraph(graphEndpointsMe.info, response.accessToken, updateUI);
        })
        .catch(error => {
            console.error(error);
        });
    console.debug("(seeProfile) Out");
}

function readMail() {
    getTokenPopup(tokenRequest)
        .then(response => {
            getFromMSGraph(graphEndpointsMe.email, response.accessToken, updateUI);
        })
        .catch(error => {
            console.error(error);
        });
}

function getPresence() {
    console.debug("(getPresence) In");

    getTokenPopup(tokenRequest)
        .then(response => {
            getFromMSGraph(graphEndpointsMe.mePresence, response.accessToken, updateUI);
        }).catch(error => {
            console.error(error);
        });
    console.debug("(getPresence) Out");
}

function setPresence(availability, activity) {
    getTokenPopup(tokenRequest)
        .then(response => {
            postMSGraph(graphEndpointsMe.mePresenceSet, response.accessToken, availability, activity);
        }).catch(error => {
            console.error(error);
        });
    setTimeout(getPresence, 500);
}

function setPresenceUser(availability, activity) {
    getTokenPopup(tokenRequest)
        .then(response => {
            postMSGraph(graphEndpointsMe.graphUserPresenceSet, response.accessToken, availability, activity);
        }).catch(error => {
            console.error(error);
        });
    setTimeout(getPresence, 500);
}
