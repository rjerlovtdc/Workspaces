// Helper function to call MS Graph API endpoint 
// using authorization bearer token scheme
async function callMSGraph(endpoint, accessToken, callback) {
    
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };
    
    console.log('Request made to Graph API at: ' + new Date().toString() + ' to URL: ' + endpoint);
    
    fetch(endpoint, options)
        .then(response => response.json())
        .then(response => callback(response, endpoint? endpoint : ''))
        .catch(error => console.log(error));
    
}


async function showProfile() {
    console.log('AccountId: ' + accountId)
    const currentAcc = myMSALObj.getAllAccounts()[0]
    if (currentAcc) {
        console.log('currentAccounttttttt', currentAcc);
        const response = await getTokenPopup(tokenRequest, currentAcc).catch(error => {
            console.log(error);
        });
        await callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
    }
}

async function readMail() {
    console.log('AccountId: ' + accountId)
    const accountFilter = {
        homeAccountId: homeAccountId,
    };
    request.account = myMSALObj.getAccount(accountFilter)
    if (currentAcc) {
        console.log('currentAccounttttttt', currentAcc);
        const response = await getTokenPopup(tokenRequest, currentAcc-homeAccountId).catch(error => {
            console.log(error);
        });
        await callMSGraph(graphConfig.graphMailEndpoint, response.accessToken, updateUI);
    } else {
        console.log("No account found")
    }
}

async function showGroups() {
    const currentAcc = myMSALObj.getAccountByHomeId(accountId)
    if (currentAcc) {
        console.log('currentAccounttttttt', currentAcc);
        const response = await getTokenPopup(tokenRequest, currentAcc.homeAccountId).catch(error => {
            console.log(error);
        });
        await callMSGraph(graphConfig.graphGroupsEndpoint, response.accessToken, updateUI);
    }

}

async function showUsers() {
    const accountFilter = {
        homeAccountId: homeAccountId,
    };
    request.account = myMSALObj.getAccount(accountFilter)
    if (currentAcc) {
        console.log('currentAccounttttttt', currentAcc);
        const response = await getTokenPopup(tokenRequest, currentAcc.homeAccountId).catch(error => {
            console.log(error);
        });
        await callMSGraph(graphConfig.graphUsersEndpoint, response.accessToken, updateUI);
    }
}

// async function seeProfileRedirect() {
//     const currentAcc = myMSALObj.getAccountByHomeId(accountId);
//     if (currentAcc) {
//         const response = await getTokenRedirect(loginRequest, currentAcc).catch(error => {
//             console.log(error);
//         });
//         callMSGraph(graphConfig.graphGroupsEndpoint, response.accessToken, updateUI);
//     }
// }
//
// async function readMailRedirect() {
//     const currentAcc = myMSALObj.getAccountByHomeId(accountId);
//     if (currentAcc) {
//         const response = await getTokenRedirect(tokenRequest, currentAcc).catch(error => {
//             console.log(error);
//         });
//         callMSGraph(graphConfig.graphMailEndpoint, response.accessToken, updateUI);
//     }
// }
