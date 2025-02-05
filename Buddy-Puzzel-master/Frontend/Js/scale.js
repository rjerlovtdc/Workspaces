/* Document Ready */
$(function () {
    console.debug("(DocumentReady) In");
    runTests()
    console.debug("(DocumentReady) Out");
});

async function runTests() {
    let token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJwZmNFcTNWSEFxRDF0cElXc0ZlUkhnR0hoUlJ4MW5wTDBFRE1aNTl2Xy1JIn0.eyJleHAiOjE3Mjg2NTg4NzQsImlhdCI6MTcyODY0MDg3NCwianRpIjoiMzBlOWFhOGMtNjVmOC00NTQzLWJiN2UtMmZiODIzZTA0NDE4IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1odWIucHVibGljLmxxZC5kay9yZWFsbXMvUHJlc2VuY2VIdWIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNGQwM2Q5NDUtNTU5NS00NWRjLThkYzEtNDY0ZjFkOTgyM2E3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicHJlc2VuY2VodWItY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6IjJlNmE5NThjLWY4ZDktNGEwYS04ZDdmLTY3NjQ1ZTEzYjA3MCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsicHJlc2VuY2Uvc2NhbGUvcmVhZC92azE3NzgxMyIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtcHJlc2VuY2VodWIiLCJwcmVzZW5jZS9zY2FsZS9yZWFkL3ZrMTUwOTYxIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiMmU2YTk1OGMtZjhkOS00YTBhLThkN2YtNjc2NDVlMTNiMDcwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlcyI6WyJwcmVzZW5jZS9zY2FsZS9yZWFkL3ZrMTc3ODEzIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1wcmVzZW5jZWh1YiIsInByZXNlbmNlL3NjYWxlL3JlYWQvdmsxNTA5NjEiXSwibmFtZSI6Ikplc3BlciBIaW5nZWxiamVyZyIsInByZWZlcnJlZF91c2VybmFtZSI6InByZXNlbmNlaHVidXNlciIsImdpdmVuX25hbWUiOiJKZXNwZXIiLCJmYW1pbHlfbmFtZSI6IkhpbmdlbGJqZXJnIiwiZW1haWwiOiJ0ZXN0QGZpc2suYm9sbGUifQ.T7pjTZ2NRRleqryXKhFm1vWYC9rSxc1THkLL5OV74_PsvQ1Ap7EVdValrl6hesnGXJg4791PeVrtiQAa6g6VC9Sbq2LL8eFNRWhldu0F4EW0pmM1oOdXhFN5slC6f55tEM6YVw-MCYBqf7XlxyQUasoegss7sSuVPZ92xdMpLVam8NZ1u5MW6v0sSnjGoAXbgV8R8VwuEhOG8Uqn9GQs1QyFi58S5bscSRkpbQqF2L5NuCFsPAypswwQHDrvZixQKE7Q28ko8XZR_vC170zTJaxVmU9E-tgbqdGUfbC8FhGyCp34_6ZsYU9TUIF8OYFAGxVZW63TuAtjgUwwox2CFg";
    let number = "30550517";
    let url = "https://mobilepartners.northeurope.cloudapp.azure.com/PresenceHub/api/Presence/?number=" + number;

    const response = await tdcFetchUrl(url, "GET", "", token);
    console.debug("(runTests) response", response);
    
}

async function tdcFetchUrl(url, method = "GET", body = "", token = "") {
    console.debug("(tdcFetchUrl) In");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (token !== "") {
        myHeaders.append("Authorization", "Bearer " + token);
    }

    let requestOptions = {
        method: method,
        headers: myHeaders
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(url, requestOptions);
        console.info("(tdcFetchUrl) response", response);
        if (response?.ok) {
            var responseJson = await response.json();
            console.info("(tdcFetchUrl) responseJson", responseJson);
            return responseJson;
        }
        else {
            console.error("(tdcFetchUrl) Response Not OK", response);
        }
    }
    catch (error) {
        console.error('(tdcFetchUrl) error', error);
    }

    console.debug("(tdcFetchUrl) Out");

    return null;
}
