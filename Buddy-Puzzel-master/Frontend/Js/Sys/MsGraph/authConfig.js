/**
 * @module authConfig
*/


// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
var myMSALObj = {};


/** @function 
 * @name setMsalConfig
 * @returns {object} - myMSALObj
 * @description Set MSAL config for MS auth
 * @since 1.0.0.0
*/
function setMsalConfig() {
    let _msalCustomerConfig = msalCustomerConfig[custObj.customerKey][agentObj.msalConfig];
    msalConfig.auth = {
        clientId: _msalCustomerConfig.clientId, //App id
        authority: "https://login.microsoftonline.com/" + _msalCustomerConfig.tenantId,  //Tenant Id
        redirectUri: ""  //https://localhost
    }
    console.info("(setMsalConfig) msalConfig", msalConfig);
    myMSALObj = new msal.PublicClientApplication(msalConfig);
}

var msalConfig = {
    auth: {
        clientId: "", //App id
        authority: "",  //Tenant Id
        redirectUri: ""  //https://localhost
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }

                switch (level) {
                    case msal.LogLevel.Error:
                        console.error("(ndloggerCallback) Error", { message });
                        if (message.includes("PopupHandler.waitForLogoutPopup - window closed")) {
                            $("#infoMsUsername").attr("error", "true");
                        }
                        return;
                    case msal.LogLevel.Info:
                        console.info("(ndloggerCallback) Info", { message });
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug("(ndloggerCallback) Debug", message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn("(ndloggerCallback) Warn", message);
                        return;
                }
            }
        }
    }
};


//https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
const loginRequest = {
    //scopes: ["Presence.Read.All", "Presence.ReadWrite"]
    scopes: ["Presence.Read.All"]
};


//https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
const tokenRequest = {
    scopes: ["Presence.Read.All"],
    forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
};
