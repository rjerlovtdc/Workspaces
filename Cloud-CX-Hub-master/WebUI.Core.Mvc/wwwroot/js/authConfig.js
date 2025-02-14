// Config object to be passed to Msal on creation
console.log("authconfig is loading...")
console.log("msal: ", msal)

const msalConfig = {
    auth: {
        clientId: "aac91e08-a40e-45c2-a204-51339371d299",
        authority: "https://login.microsoftonline.com/84adce5c-2f55-4a74-bb37-3f1609020ba2",
        redirectURI: 'https://rjvm.northeurope.cloudapp.azure.com/AdminPortal/'
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
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
                        console.error(message);	
                        return;	
                    case msal.LogLevel.Info:	
                        console.info(message);	
                        return;	
                    case msal.LogLevel.Verbose:	
                        console.debug(message);	
                        return;	
                    case msal.LogLevel.Warning:	
                        console.warn(message);	
                        return;	
                }
            }
        }
    }
};
console.log("Creating MSAL object")
const myMSALObj = new msal.PublicClientApplication(msalConfig);

// Add here scopes for id token to be used at MS Identity Platform endpoints.
const loginRequest = {
    scopes: ["User.Read"]
};

// Add here the endpoints for MS Graph API services you would like to use.
const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages"
};

// Add here scopes for access token to be used at MS Graph API endpoints.
const tokenRequest = {
    scopes: ["Mail.Read", "User.Read"],
    forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
};

const accounts = myMSALObj.getAllAccounts();
if (accounts.length > 0) {
    const silentRequest = {
        scopes: ["openid", "profile", "User.Read", "Mail.Read"],
        account: accounts[0]
    };

    myMSALObj.acquireTokenSilent(silentRequest)
        .then(response => {
            const accessToken = response.accessToken
            console.log("Token: ", accessToken);
        })
        .catch(error => {
            if (error instanceof msal.InteractionRequiredAuthError) {
                console.log("Token Acquistion Failed.")
            } else {
                console.error("Token acquisition error: ", error)
            }
        })
}