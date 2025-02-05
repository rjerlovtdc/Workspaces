/* Global Variables */
const ndBuddyUrl = "https://netdesign-buddy-test.northeurope.cloudapp.azure.com:8443/TDC/";

/* Document Ready */
$(async function () {
    console.debug("(DocumentReady) In");

    let url = "api/MonitorCustomer";
    let response = await tdcAPI(url);
    console.info("(DocumentReady) response", response);

    console.debug("(DocumentReady) Out");
});


/* Scale Call */
const tdcAPI = async (resUrl, method = "GET", body = "") => {
    console.debug("(tdcAPI) In");
    let userName = "puzzel";
    let userPassword = "Tdc2024!"

    var apiHeaders = new Headers();
    apiHeaders.append("Content-Type", "application/json");
    apiHeaders.append("Authorization", "Basic " + btoa(`${userName}:${userPassword}`));

    let requestOptions = {
        method: method,
        headers: apiHeaders
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(ndBuddyUrl + resUrl, requestOptions);

        if (response?.ok) {
            reponseJson = await response.json();
            console.info("(tdcAPI) reponseJson: ", reponseJson);

            if (reponseJson?.HasError) {
                console.warn("(tdcAPI) Has Error: ", reponseJson.ErrorText);
            }
            return reponseJson;
        }
        else {
            console.error("(tdcAPI) Response Not OK: ", response);
        }
    } catch (error) {
        console.error('(tdcAPI) error: ', error);
    }

    console.debug("(tdcAPI) Out");
    return null;
}
