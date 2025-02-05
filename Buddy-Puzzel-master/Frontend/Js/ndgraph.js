/**
 * @module ndGraph
*/


/* Global Variables */
versionObj.ndgraph = 37;


/** @function 
 * @name getMsToken
 * @async
 * @returns {string}
 * @description Get MS Token
 * @since 1.0.0.0
*/
const getMsToken = async () => {
    console.debug("(ndgraph) getMsToken In");

        let apiRequestNd = await fetch(`${ndBuddyUrl}'Token?customerKey=${custObj.customerKey}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    msToken = await apiRequestNd.json();

    console.info("(ndgraph) getMsToken response: ", msToken);

    console.debug("(ndgraph) getMsToken Out");
}


/** @function 
 * @name getPhotoFromAzure
 * @async
 * @returns {blob} - Image
 * @description Get MS Graph User Photo from Email
 * @since 1.0.0.0
*/
const getPhotoFromAzure = async (ndUser) => {
    console.debug("(getPhotoFromAzure) In");
    let orgPath = getOrgPath(ndUser.organizationPath);

    let apiRequestNd = await fetch(`${ndBuddyUrl}UserPhoto/?email=${ndUser.email}&customerKey=${custObj.customerKey}&orgPath=${orgPath}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'image/jpeg'
        }
    })

    if (apiRequestNd.ok) {
        let apiResponseNd = await apiRequestNd.blob();

        if (apiResponseNd.size > 0) {
            const urlObject = URL.createObjectURL(apiResponseNd);
            document.getElementById("userPhoto").setAttribute("src", urlObject);
        }
        else {
            console.warn("(getPhotoFromAzure) No Photo Found for user: ", ndUser.email);
        }
    }
    else {
        console.error("(getPhotoFromAzure) Request Error", apiRequestNd);
    }

    console.debug("(getPhotoFromAzure) Out");
}


/** @function 
 * @name msGraphUserSearch
 * @async
 * @param {string} searchWord - Text to search for
 * @returns {object} - azureUser
 * @description MS Graph user Search from Searchword
 * @since 1.0.0.0
*/
const msGraphUserSearch = async (searchWord) => {
    console.debug("(ndgraph) msGraphUserFromEmail In");

    let apiRequestNd = await fetch(`https://graph.microsoft.com/v1.0/users?$search="displayName:${searchWord}"`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'ConsistencyLevel': 'eventual',
            'Authorization': 'Bearer ' + msToken
        }
    })

    if (apiRequestNd.ok) {
        let apiResponseNd = await apiRequestNd.json();
        console.debug("(ndgraph) msGraphUserFromEmail Out");

        return apiResponseNd;
    }
    else {
        console.debug("(ndgraph) msGraphUserFromEmail Out");
        return null;
    }

}


/** @function 
 * @name msGraphUserFromEmail
 * @async
 * @param {string} email - Email address
 * @returns {object} - azureUser
 * @description MS Graph user from Email
 * @since 1.0.0.0
*/
const msGraphUserFromEmail = async (email) => {
    console.debug("(ndgraph) msGraphUserFromEmail In");

    let apiRequestNd = await fetch(`https://graph.microsoft.com/v1.0/users/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + msToken
        }
    })

    if (apiRequestNd.ok) {
        let apiResponseNd = await apiRequestNd.json();

        console.info("(ndgraph) msGraphUserFromEmail response: ", apiResponseNd);
        console.debug("(ndgraph) msGraphUserFromEmail Out");

        return apiResponseNd;
    }
    else {
        console.warn("(ndgraph) msGraphUserFromEmail Token Refresh: ", apiRequestNd);
        console.debug("(ndgraph) msGraphUserFromEmail Out");
        return null;
    }

}


/** @function 
 * @name ndGetPuzzelUserGraph
 * @async
 * @param {string} email - Email address
 * @description ndGetPuzzelUserGraph
 * @since 1.0.0.0
 */
const ndGetPuzzelUserGraph = async (email) => {
    console.debug("(ndGetPuzzelUserGraph) In");

    let ndUser = await msGraphUserFromEmail(email);

    if (ndUser === null) {
        await getMsToken();
        ndUser = await msGraphUserFromEmail(email);
        msGraphPhotoFromEmail(email);
    }
    else {
        msGraphPhotoFromEmail(email);
    }

    $('#dDisplayName').html(ndUser?.displayName);
    $('#dUserId').html(ndUser?.userPrincipalName.replace("@sw8p.onmicrosoft.com", ""));
    $('#dPhone').html(ndUser?.businessPhones);
    $('#dMobile').html(ndUser?.mobilePhone);
    $('#dEmail').html(ndUser?.mail);
    $('#dTitle').html(ndUser?.jobTitle);

    $('#dAdministrationName').html(ndUser?.officeLocation);
    $('#dOrganization').html(ndUser?.preferredLanguage);


    console.debug("(ndGetPuzzelUserGraph) Out");
}


/** @function 
 * @name msGraphPhotoFromEmail
 * @async
 * @param {string} email - Email address
 * @returns {blob} - Image
 * @description MS Graph user photo from Email
 * @since 1.0.0.0
*/
const msGraphPhotoFromEmail = async (email) => {
    console.debug("(ndgraph) msGraphPhotoFromEmail In");

    let apiRequestNd = await fetch(`https://graph.microsoft.com/v1.0/users/${email}/photos/120x120/$value`, {
        method: 'GET',
        headers: {
            'Content-Type': 'image/jpeg'
            , 'Authorization': 'Bearer ' + msToken
        }
    })

    if (apiRequestNd.ok) {
        let apiResponseNd = await apiRequestNd.blob();

        const urlObject = URL.createObjectURL(apiResponseNd);
        document.getElementById("userPhoto").setAttribute("src", urlObject);
    }
    else {
        console.warn("(ndgraph) msGraphPhotoFromEmail apiRequestNd", apiRequestNd);
        document.getElementById("userPhoto").setAttribute("src", "Res/nophoto.png");
        return false;
    }


    console.debug("(ndgraph) msGraphPhotoFromEmail Out");
}
