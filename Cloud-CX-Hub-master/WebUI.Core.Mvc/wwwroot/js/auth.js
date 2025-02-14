// Browser check variables
// If you support IE, our recommendation is that you sign-in using Redirect APIs
// If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
console.log("auth.js in loading...")
const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;
let signInType;
let accountId = "";
const mockAccounts = [
    {
        homeAccountId: "1",
        username: "mockAccount1@example.com",
        name: "Mock 1"
    },
    {
        homeAccountId: "2",
        username: "mockAccount2@example.com",
        name: "Mock 2"
    }
];

// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js

if (myMSALObj !== undefined) {
    myMSALObj.handleRedirectPromise()
        .then(handleResponse)
        .catch(err => {
            console.error(err);
        });
} else {
    myMSALObj = new msal.PublicClientApplication(msalConfig);

}

// Redirect: once login is successful and redirects with tokens, call Graph API


function handleResponse(resp) {
    console.log("Handling response...");
    if (resp !== null) {
        accountId = resp.account.homeAccountId;
        showWelcomeMessage(resp.account);
    } else {
        // need to call getAccount here?
        const currentAccounts = myMSALObj.getAllAccounts();
        if (!currentAccounts || currentAccounts.length < 1) {
            return;
        } else if (currentAccounts.length > 1) {
            showAccounts(currentAccounts);
        } else if (currentAccounts.length === 1) {
            accountId = currentAccounts[0].homeAccountId;
            showWelcomeMessage(currentAccounts[0]);
        }
    }
}

async function signIn(method) {
    signInType = isIE ? "loginRedirect" : method;
    if (signInType === "loginPopup") {
        return myMSALObj.loginPopup(loginRequest).then(handleResponse).catch(function (error) {
            console.log(error);
        });
    } else if (signInType === "loginRedirect") {
        return myMSALObj.loginRedirect(loginRequest)
    }
}

function signOut() {
    const logoutRequest = {
        account: myMSALObj.getAccountByHomeId(accountId)
    };

    myMSALObj.logout(logoutRequest);
}

async function getTokenPopup(request, account) {
    request.account = account;
    return await myMSALObj.acquireTokenSilent(request).catch(async (error) => {
        console.log("silent token acquisition fails.");
        if (error instanceof msal.InteractionRequiredAuthError) {
            console.log("acquiring token using popup");
            return myMSALObj.acquireTokenPopup(request).catch(error => {
                console.error(error);
            });
        } else {
            console.error(error);
        }
    });
}

// This function can be removed if you do not need to support IE
async function getTokenRedirect(request, account) {
    request.account = account;
    return await myMSALObj.acquireTokenSilent(request).catch(async (error) => {
        console.log("silent token acquisition fails.");
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            console.log("acquiring token using redirect");
            myMSALObj.acquireTokenRedirect(request);
        } else {
            console.error(error);
        }
    });
}
