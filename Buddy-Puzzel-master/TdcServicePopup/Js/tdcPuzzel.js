/* Global Variables */

const TdcLdapSearchUrlG = "http://localhost/LdapSearch/api/SearchFromAttribute?searchValue=";
var TdcPopupUrlG = "https://tdcerhverv.service-now.com/cti.do?sysparm_cti_rule=cti&sysparm_caller_name=";
var TdcPopupUrlDefaultG = "https://tdcerhverv.service-now.com/cti.do?sysparm_cti_rule=cti";
var TargetG = "_blank";
var PopupActiveG = false;
var api;

const DOMready = async () => {
    return new Promise((resolve) => {
        window.addEventListener("load", resolve)
    })
}

/** @function 
 * @name tdcGetWidgetOption
 * @param {string} optionName - Name of option 
 * @param {boolean} [arrayB=false] - Return value af array
 * @param {string} [defaultValue=""] - Value to return if not found
 * @returns {string}
 * @description Get option value from widget config
 * @since 1.0.0.0
*/
const tdcGetWidgetOption = async (optionName, arrayB = false, defaultValue = "") => {
    console.info("(TdcWidgetService) tdcGetWidgetOption optionName", optionName);

    let returnValue = defaultValue;
    await api.call('widget.getOption', optionName)
        .then(ret => {
            returnValue = ret;
        })
        .catch(error => {
            console.warn("(TdcWidgetService) tdcGetWidgetOption error", error);
        });

    if (arrayB) {
        returnValue = (returnValue !== "") ? returnValue.split(',') : [];
    }

    return returnValue;
}


/** @function 
 * @name main
 * @description Main
 * @since 1.0.0.0
*/
const main = async () => {
    // Wait until DOM is Ready
    await DOMready()

    // Connect to the postMessage API using the Widget API Lib.
    api = await widgetApiLib.connect()

    // Flag that your page is ready to receive events
    api.ready()

    // Fetch Widget Options
    TargetG = await tdcGetWidgetOption("target", false, "_blank");
    TdcPopupUrlG = await tdcGetWidgetOption("popupUrl", false, TdcPopupUrlG);
    TdcPopupUrlDefaultG = await tdcGetWidgetOption("popupUrlDefault", false, TdcPopupUrlDefaultG);

    console.info("(TdcWidgetService) TargetG", TargetG);
    console.info("(TdcWidgetService) TdcPopupUrlG", TdcPopupUrlG);
    console.info("(TdcWidgetService) TdcPopupUrlDefaultG", TdcPopupUrlDefaultG);

    // Widget API Call
    const customerKey = await api.get("auth.customerKey")
    const customerId = await api.get("auth.customerId")
    const userName = await api.get("auth.userName")
    const userId = await api.get("auth.userId")
    const userGroupId = await api.get("auth.userGroupId")


    // Subscribe to events
    api.on("SYSTEM_INCOMING_CALL", onIncomingCall)
    api.on("SYSTEM_CALL_STATE_CHANGE", onCallStateChange)
}


/** @event
 * @name onIncomingCall
 * @async
 * @param {object} call - Puzzel call object
 * @description Incoming Call
 * @since 1.0.0.0
*/
const onIncomingCall = async ({ call }) => {
    console.info("(TdcWidgetService) onIncomingCall call)", call);
    PopupActiveG = true;
}

/** @event
 * @name onCallStateChange
 * @async
 * @param {object} call - Puzzel call object
 * @description Call State Change
 * @since 1.0.0.0
*/
const onCallStateChange = async ({ call }) => {
    console.debug("(TdcWidgetService) onCallStateChange In)");
    console.info("(TdcWidgetService) onCallStateChange call)", call);

    let tdcCaller = call?.caller || "";
    let callProgress = call.vars?.system_call_progress || "";
    let cprNumber = call.vars?.cpr_number || "";

    /* JHA Testing */
    if (tdcCaller === "44358336") {
        console.debug("(TdcWidgetService) onCallStateChange jhatesting");
        cprNumber = "2502751444";
    }

    console.info("(TdcWidgetService) onCallStateChange tdcCaller)", tdcCaller);
    console.info("(TdcWidgetService) onCallStateChange callProgress)", callProgress);
    console.info("(TdcWidgetService) onCallStateChange cprNumber)", cprNumber);
    console.info("(TdcWidgetService) onCallStateChange PopupActiveG)", PopupActiveG);


    if (PopupActiveG && callProgress === "CONNECTED") {
        PopupActiveG = false;

        if (cprNumber === "" || cprNumber === "ingen_cpr_indtastet") {
            console.info("(TdcWidgetService) onCallStateChange NoCprNumber");
            if (TdcPopupUrlDefaultG !== "") {
                console.debug("(TdcWidgetService) onCallStateChange Default Popup1");
                window.open(`${TdcPopupUrlDefaultG}`, TargetG);
            }
            return;
        }

        let respJson = await getUserIdFromCpr(cprNumber);
        console.info("(TdcWidgetService) onCallStateChange respJson", respJson);

        if (typeof respJson !== "undefined" && respJson !== null && respJson !== "") {
            let popupUrl = `${TdcPopupUrlG}${respJson.sAMAccountName}`;
            console.info("(TdcWidgetService) onCallStateChange popupUrl", popupUrl);
            window.open(popupUrl, TargetG);
        }
        else {
            if (TdcPopupUrlDefaultG !== "") {
                console.debug("(TdcWidgetService) onCallStateChange Default Popup2");
                window.open(`${TdcPopupUrlDefaultG}`, TargetG);
            }
        }
    }
    console.debug("(TdcWidgetService) onCallStateChange Out)");
}


// Start the Async Function
main()
