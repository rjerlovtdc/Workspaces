/* Global Variables */
const tdcVersion = "1.0.1.7";

/* Document Ready */
document.addEventListener("DOMContentLoaded", function (e) {
    console.debug("(TdcWidgetService) DOMContentLoaded");
    console.info("(TdcWidgetService) Version", tdcVersion);

    let myDomain = window.location.hostname.toLowerCase();
    console.info("((TdcWidgetService)) myDomain", myDomain);
});

const getUserIdFromCpr = async (searchValue) => {
    console.info("(TdcWidgetService) getUserIdFromCpr searchValue", searchValue);

    let fetchUrl = `${TdcLdapSearchUrlG}${searchValue}`;
    console.info("(TdcWidgetService) getUserIdFromCpr fetchUrl", fetchUrl);

    const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
        //,body: JSON.stringify(bodyData)
    }).catch((error) => {
        console.warn("(TdcWidgetService) fetch error", error);
        return "";
    })

    if (response.ok) {
        let responseJson = await response.json();
        console.info("(TdcWidgetService) getUserIdFromCpr responseJson", responseJson);
        return responseJson;
    }
    else {
        return "";
    }
}

/* Popup URL */
function tdcPopupUrl(url, timeout = 0) {
    let params = `scrollbars=no, resizable=no, status=no, location=no, toolbar=no, menubar=no,
                    width=50, height=50, left=4000, top=2000`;

    let newWindow = window.open(url, "solteq", params);
    /*
    newWindow.onload = function () {
        newWindow.close();
        alert(newWindow.closed); // true
    };
    */

    if (timeout > 0) {
        setTimeout(function () { newWindow.close() }, timeout);
    }
}