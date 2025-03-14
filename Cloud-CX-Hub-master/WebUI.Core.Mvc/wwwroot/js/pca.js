const msalConfig = {
    auth: {
        clientId: "aac91e08-a40e-45c2-a204-51339371d299",
        authority: "https://login.microsoftonline.com/84adce5c-2f55-4a74-bb37-3f1609020ba2",
        redirectUri: "https://localhost:7249/Account/MsalRedirect"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ["User.Read", "User.Read.All"],
};

const graphMeEndpoints = {
    "justme": ["https://graph.microsoft.com/v1.0/me"]
};

async function signIn() {
    try {
        await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
        console.log("Login redirect error", error);
    }
}

async function handleRedirect() {
    try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            console.log("Redirect successful:", response);
            await callGraphApi(response.account);
        }
    } catch (error) {
        console.error("Handle redirect error:", error);
    }
}

const callGraphApi = async (account) => {
    if (!account) {
        console.error("No account found");
        return;
    }

    const request = {
        scopes: ["User.Read", "User.Read.All"],
        account: account,
    };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        const accessToken = response.accessToken;

        const graphResponse = await fetch(graphMeEndpoints.justme[0], {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (graphResponse.ok) {
            const userData = await graphResponse.json();
            const userId = userData.id;
            console.log(graphResponse.status)
            window.location.href = `/Home/Overview?userId=${encodeURIComponent(userId)}`;
        } else {
            console.error("Graph API error: ", graphResponse.status, graphResponse.statusText);
        }
    } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
            msalInstance.loginRedirect(loginRequest);
        } else {
            console.error("Token acquisition error: ", error);
        }
    }
};


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".ssoButton").addEventListener('click', () => {
        signIn().then(r => console.log("signIn promise resolved"))
    });

    const accounts = msalInstance.getAllAccounts();
    if (accounts && accounts.length > 0) {
        callGraphApi(accounts[0]).then(r => console.log("callGraphApi promise resolved"));
    }
});