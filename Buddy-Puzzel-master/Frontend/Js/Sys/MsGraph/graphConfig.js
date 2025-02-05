// Add here the endpoints for MS Graph API services you would like to use.
const urlDefault = "https://graph.microsoft.com/v1.0";
const url = "https://graph.microsoft.com/beta";

const userId = "";

/* Graph Endonts Me */
const graphEndpointsMe = {
    info: "/me",
    mail: "/me/messages",
    presence: "/me/presence",
    presenceSet: "/me/presence/setPresence",
    preferedPresenceSet: "/me/presence/setUserPreferredPresence",
    preferedPresenceClear: "/me/presence/clearUserPreferredPresence"
};

function tdcGetGraphEndpoint(point, userId = "/me") {
    if (userId !== "/me") {
        userId = `/users/${userId}`
    }

    const graphEndpoints = {
        info: `/users/${userId}`,
        mail: `/users/${userId}/messages`,
        presence: `/users/${userId}/presence`,
        presenceSet: `/users/${userId}/presence/setPresence`,
        preferedPresenceSet: `/users/${userId}/presence/setUserPreferredPresence`,
        preferedPresenceClear: `/users/${userId}/presence/clearUserPreferredPresence`
    }

    let returnTxt = graphEndpoints[point];
    console.info("(tdcGetGraphEndpoint) returnTxt", returnTxt);
    return returnTxt;
}