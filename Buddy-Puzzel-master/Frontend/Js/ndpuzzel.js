/**
 * @module ndPuzzel
 */

/* Global Variables */
versionObj.ndpuzzel = 37;
var popupActiveG = false, firstIncomingG = false;
var api;


/** @event 
 * @name DOMready
 * @async
 * @fires getPuzzelApi
 * @description DOM Ready
 * @returns {object}
 * @since 1.0.0.0
*/
const DOMready = async () => {
    return new Promise(resolve => {
        window.addEventListener('load', resolve)
    })
}


/** @event 
 * @name getPuzzelApi
 * @async
 * @description Connect to the postMessage API using the Widget API Lib
 * @since 1.0.0.0
*/
const getPuzzelApi = async () => {
    console.debug("(main) In");

    // Wait until DOM is Ready
    await DOMready();
    console.debug("(main) DOMready");

    // Connect to the postMessage API using the Widget API Lib.
    console.debug("(main) widgetApiLib Connect");
    const hosts = [
        'https://agent.puzzel.com',
        'https://devagent.puzzel.com',
        'https://app.puzzel.com'
    ];

    try {
        api = await widgetApiLib.connect(hosts);
        console.info("(main) widgetApiLib Connected");
    } catch (error) {
        console.warn("(main) widgetApiLib Error", error);
        return;
    }


    // Flag that your page is ready to receive events
    api.ready()

    await getAccessToken();
    setInterval(getAccessToken, 900000);  //Refresh Token
}


/** @function 
 * @name getAccessToken
 * @description Get access token from widget api
 * @since 1.0.0.0
*/
const getAccessToken = async () => {
    console.debug("accessToken In");

    custObj.accessToken = await api.get('auth.getAccessToken');
    console.info("accessToken", custObj.accessToken);

    console.debug("accessToken Out");
}


/** @event
 * @name eventsAndState
 * @async
 * @fires onIncomingCall
 * @fires onUserStateChanged
 * @description Subscribe to event and state changes
 * @since 1.0.0.0
*/
const eventsAndState = async () => {
    api.on('SYSTEM_INCOMING_CALL', onIncomingCall);
    api.on('SYSTEM_USER_STATUS_CHANGED', onUserStateChanged);
    api.on('SYSTEM_CALL_STATE_CHANGE', onCallStateChanged);
    api.on('SYSTEM_TAB_ACTIVE_CHANGED', onTabActiveChanged)

    //api.on('SYSTEM_CALL_PROGRESS_CHANGE', onCallProgessChanged);
    //api.on('SYSTEM_CALL_TRIGGER', onCallTrigger);
    //api.on('SYSTEM_CALL_EVENT_TRIGGER', onCallEventTrigger);
    //api.on('SYSTEM_CALLOUT_CALL', onCalloutCall);

    /* Wath */
    //api.watch('agent.contactCentreStatus', contactCentreStatusChanged);
}


/** @function 
 * @name ndActivateWidget
 * @async
 * @param {string} eventName - Name of event : CallAnswer, CallHangup etc.
 * @description Focus Puzzel Widget Tab
 * @since 1.0.0.0
*/
const ndActivateWidget = async (eventName) => {
    console.debug("(ndActivateWidget) In");

    let tabSetting = $('#setting' + eventName + 'TabDD').val();

    if (tabSetting === "" || tabSetting === "DISABLED") {
        return;
    }

    console.info("(ndActivateWidget) eventName", eventName);
    console.info("(ndActivateWidget) tabSetting", tabSetting);

    await api.call('events.publish', tabSetting, {
        data: {
            tab: {
                focus: true
            }
        }
    });

    console.debug("(ndActivateWidget) Out");
}


/** @function 
 * @name ndSetTitle
 * @async
 * @param {boolean} [setTitle=true] - Set or remove title
 * @description Set Puzzel Widget Title
 * @since 1.0.0.0
*/
const ndSetTitle = async (setTitle = true) => {
    console.debug("(ndSetTitle) In");

    if (setTitle) {
        let ndQueueName = await api.call('queue.getQueueDescriptionForQueueKey', callObj.queueKey);
        await api.call('tab.setTitle', "TDC Buddy: " + ndQueueName)
        await api.call('tab.setDescription', "Opkalder: " + callObj.caller)
    }
    else {
        await api.call('tab.setTitle', "TDC Buddy")
        await api.call('tab.setDescription', "")
    }

    console.debug("(ndSetTitle) Out");
}


/** @event
 * @name onIncomingCall
 * @async
 * @param {object} call - Puzzel call object
 * @description Incoming Call
 * @since 1.0.0.0
*/
async function onIncomingCall({ call }) {
    console.debug("(onIncomingCall) In");
    popupActiveG = true;
    firstIncomingG = true;

    ndFocusSearchBox(-1);

    await clearCallObject();

    let settingIncomingTab = $("#settingIncomingTabDD").val();
    if (settingIncomingTab !== "DISABLED") {
        setActiveTab(settingIncomingTab);
    }

    let settingClear = $("#settingClearSearchResultDD").val();
    if (settingClear === "INCOMING" || settingClear === "BOTH") {
        clearSearchAndDetail("INCOMING");
    }

    console.info("(onIncomingCall) call", call);

    await ndParseCallState(call);

    ndSetTitle();
    ndActivateWidget("CallIncoming");

    switch (custObj.customerKey) {
        case "2647119":  //Region H
            $("#searchOrgDD").val(callObj.tdcCustGroupIds);
            break;
        case "454014":  //IT-Forsyningen
            $("#searchOrgDD").val(callObj.tdcOrgUnit);
            break;
        case "45524905":  //Region Syd
            $("#searchOrgDD").val(callObj.tdcOrgUnit.replaceAll('_', '|'));
            break;
    }

    console.info("(onIncomingCall) callObj", callObj);


    /* Returned Call */
    if (callObj.callerTransfered === "TRUE" && callObj.callerTransferedTo !== "") {
        $("#searchInputEmp").val(callObj.callerTransferedTo);
        ndRequestEmployees("", "", false);
    }

    getServiceLabelsFromSearch();
    console.debug("(onIncomingCall) Out");
}


/** @event
 * @name onCalloutCall
 * @async
 * @param {object} call - Puzzel call object
 * @description Outgoing Call
 * @since 1.0.0.0
 * @deprecated Since version 1.0. Will be deleted in version 5.
*/
async function onCalloutCall({ call }) {
    console.debug("(onCalloutCall) In");
    console.log("(onCalloutCall)", call);

    if (call.isOutboundConnected) {
        //Forbundet
    }
    else if (call.isConnected) {
        //Ringer op
    }

    console.debug("(onCalloutCall) Out");
}


/** @event
 * @name onCallProgess Changed
 * @async
 * @param {object} call - Puzzel call object
 * @description Call Progess Changed
 * @since 1.0.0.0
 * @deprecated Since version 1.0. Will be deleted in version 5.
*/
async function onCallProgessChanged({ call }) {
    console.debug("(onCallProgessChanged) In");
    console.info("(onCallProgessChanged) call", call);
}


/** @event
 * @name onCallState Changed
 * @async
 * @fires ndParseCallState
 * @param {object} call - Puzzel call object
 * @description Call State Changed
 * @since 1.0.0.0
*/
async function onCallStateChanged({ call }) {
    console.debug("(onCallStateChange) In");
    console.info("(onCallStateChange) call", call);

    await ndParseCallState(call);

    /* JHA Testing */
    if (callObj.caller === "44358336ABE") {
        console.debug("(onIncomingCall) jhatesting");
        callObj.cpr_number = "2204731234";
        callObj.queueKey = "q_fre_tandplejen";
    }

    let queueName = callObj.queueKey.toUpperCase();
    let targetSolteq = $('#settingSolteqDD').val();
    let targetSapa = $('#settingSapaDD').val();

    /* DEBUG */
    let debugobj = {
        customerKey: custObj.customerKey,
        queueKey: callObj.queueKey,
        queueName: queueName,
        cpr_number: callObj.cpr_number,
        popupActive: popupActiveG,
        callProgress: callObj.callProgress,
        targetSolteq: targetSolteq,
        targetSapa: targetSapa
    };
    console.info("(onCallStateChange) debugobj", debugobj);

    /* ITF - Solteq - Tandpleje */
    let enabledCustomersSolteq = ["454014", "4517111", "4054040ABE"];
    if (enabledCustomersSolteq.includes(custObj.customerKey)) {
        if (
            popupActiveG &&
            callObj.cpr_number.length === 10 &&
            queueName.includes("TAND")
        ) {
            if (callObj.callProgress === targetSolteq) {
                console.debug("(onCallStateChange) solteq");
                popupActiveG = false;
                solteqPopup(callObj.cpr_number);
            }
        }
    }

    if (call.hasOwnProperty('vars')) {
        console.info("(onCallStateChange) call vars", call.vars);

        let variablesArr = new Map();
        $.each(call.vars, function (key, value) {
            variablesArr.set(key, value);
        });

        switch (callObj.callProgress) {
            case "CONNECTED":
                console.info("(onCallStateChange) popupActiveG", popupActiveG);
                let enabledCustomersTdcPopup = ["4517111", "4054040ABE"];
                if (popupActiveG && enabledCustomersTdcPopup.includes(custObj.customerKey)) {
                    console.debug("(onCallStateChange) TdcBuddyPopup");
                    popupActiveG = false;
                    let popupUrl = "tdcbuddypopup:" + callObj.caller;

                    tdcBuddyPopupWindow(popupUrl, 400);
                }

                /* SAPA */
                if (
                    popupActiveG &&
                    callObj.cpr_number.length === 10 &&
                    (queueName.substring(0, 3) === "FRE" || queueName.includes("Q_FRE")) &&
                    !queueName.includes("TAND")
                ) {
                    let enabledCustomersSapa = ["474898", "454014"];
                    if (enabledCustomersSapa.includes(custObj.customerKey)) {
                        let myndighed = $('#myndighed').val();

                        console.debug("(onCallStateChange) Sapa cpr_number", callObj.cpr_number);
                        console.debug("(onCallStateChange) Sapa myndighed", myndighed);

                        if (targetSapa !== "DISABLED" && callObj.cpr_number !== "" && popupActiveG) {
                            $('#objektVaerdi1').val(callObj.cpr_number);
                            $('#sapaForm').attr("target", targetSapa);
                            $('#sapaForm').submit();

                            console.debug("(onCallStateChange) Sapa Send");
                        }
                        callObj.cpr_number === "";
                        popupActiveG = false;
                    }
                }


                switch (callObj.transferState) {
                    case "ALERTING":
                        console.info("(onCallStateChange) ConsulationAlerting");
                        api.call('widget.alert', "Info", "Ringer op til " + variablesArr.get("system_last_called"), { "global": false, "timeout": 2000, "icon": "fas fa-phone" });
                        break;
                }
        }

        console.debug("(onCallStateChange) Out");
    }
}


/** @event
 * @name onCallTrigger
 * @async
 * @param {object} call - Puzzel call object
 * @description Call Trigger
 * @since 1.0.0.0
 * @deprecated Since version 1.0. Will be deleted in version 5.
*/
async function onCallTrigger(call) {
    console.log("(onCallTrigger) In");
    console.log("(onCallTrigger) call", call);
}


/** @event
 * @name onCallEventTrigger
 * @async
 * @param {object} call - Puzzel call object
 * @description Call Event trigger
 * @since 1.0.0.0
 * @deprecated Since version 1.0. Will be deleted in version 5.
*/
async function onCallEventTrigger(call) {
    console.log("(onCallEventTrigger) In");
    console.log("(onCallEventTrigger) call", call);
}


/** @event
 * @name onUserState Changed
 * @async
 * @fires setMyTeamsPresence
 * @param {string} status - Available, Alerting, Connected etc.
 * @description Agent state changed
 * @since 1.0.0.0
*/
async function onUserStateChanged(status) {
    console.log("(onUserStateChanged) In");
    console.log("(onUserStateChanged) status", status);
    let tabSetting = $("#settingIncomingTabDD").val();
    let teamsSetting = $("#settingMsTeamsPuzzelBusyDD").val();

    switch (status) {
        case "Available":
            ndSetTitle(false);
            break;
        case "Alerting":
            break;
        case "Connected":
            ndFocusSearchBox(0.2, "searchInput" + tabSetting.slice(0, 3));
            if (teamsSetting === "DND") {
                setMyTeamsPresence("CONNECTED");
            }
            break;
    }
}


/** @event
 * @name contactCentreStatus Changed
 * @async
 * @param {string} newValue - New state value
 * @param {string} oldValue - Old state value
 * @description Contact Center Status Changed
 * @since 1.0.0.0
 * @deprecated Since version 1.0. Will be deleted in version 5.
*/
async function contactCentreStatusChanged(newValue, oldValue) {
    console.log("(contactCentreStatusChanged) In");

    console.log("(contactCentreStatusChanged) newValue", newValue);
    console.log("(contactCentreStatusChanged) oldValue", oldValue);

    console.log("(contactCentreStatusChanged) Out");
}


/** @event
 * @name onTabActive Changed
 * @fires setActiveTab
 * @param {object} data - Widget tab data
 * @description On Puzzel Widget Tab active changed
 * @since 1.0.0.0
*/
function onTabActiveChanged(data) {
    console.debug("(onTabActiveChanged) In");
    console.info("(onTabActiveChanged) data", data);

    /* If activated tab is TDC Buddy */
    const tabNames = ["BUDDY", "TEST", "JHA"];
    let uid = data.uid.toUpperCase();
    let tdcEnabledWidget = tabNames.some(tabName => uid.includes(tabName))
    console.info("(onTabActiveChanged) tdcEnabledWidget", tdcEnabledWidget);

    if (data.isActive && tdcEnabledWidget) {
        let tabSetting = $("#settingIncomingTabDD").val();

        console.info("(onTabActiveChanged) settingTab", tabSetting);

        if (tabSetting !== "DISABLED") {
            setActiveTab(tabSetting);
        }

        setTimeout(initializeEmployees, 1000);
        setTimeout(initializeFavorites, 1000);
        setTimeout(setWindowHeight, 2000);
    }

    if (data.uid.includes("Phone With Agent Assist") && data.isActive) {
        console.info("(onTabActiveChanged) Puzzel Phone Agent Assist");
        ndFocusSearchBox(-1);
    }

    console.debug("(onTabActiveChanged) Out");
}


/** @function 
 * @name validateUser 
 * @returns {boolean}
 * @description Validate Buddy user from Puzzel token
 * @since 1.0.0.0
*/
const validateUser = async () => {
    console.debug("(validateUser) In");

    let apiUrl = ndBuddyUrl + "Puzzel/ValidateUser";
    let apiRequest = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Puzzel-Token': custObj.accessToken
        }
    });

    let jsonResponse = await apiRequest.json();

    agentObj.groupName = jsonResponse.groupName;
    agentObj.eMail = jsonResponse.eMail;

    console.debug("(validateUser) Out");
    return jsonResponse.HasError;
}


/** @function 
 * @name fetchUserInfo 
 * @returns {agentObj} - agentObj
 * @description Validate Buddy user from Puzzel token
 * @since 1.0.0.0
*/
const fetchUserInfo = async () => {
    console.debug("(fetchUserInfo) In");

    agentObj.userId = await api.get("auth.userId");
    agentObj.userName = await api.get("auth.userName");
    agentObj.firstName = await api.get("agent.firstName");
    agentObj.lastName = await api.get("agent.lastName");

    custObj.customerKey = await api.get("auth.customerKey");
    custObj.customerId = await api.get("auth.customerId");

    $("#userInfoUserId").val(agentObj.userId);
    $("#userInfoUserName").val(agentObj.userName);
    $("#userInfoName").val(agentObj.firstName + " " + agentObj.lastName);
    $("#userGroupName").val(agentObj.groupName);

    $("#userInfoCustomerKey").val(custObj.customerKey);
    $("#userInfoCustomerId").val(custObj.customerId);
    $("#userInfoCustomerName").val(customerInfoFromKey[custObj.customerKey]["Name"]);
    $("#myndighed").val(customerInfoFromKey[custObj.customerKey]["cvrNr"]);

    let keyboardShortcuts = await api.get("widget.keyboardShortcuts");
    console.info("(fetchUserInfo) agentObj", agentObj);
    console.info("(fetchUserInfo) custObj", custObj);
    console.info("(fetchUserInfo) keyboardShortcuts", keyboardShortcuts);

    console.debug("(fetchUserInfo) Out");
}


/** @function 
 * @name tdcGetWidgetOption
 * @async
 * @param {string} optionName - Puzzel Widget option name to get value from
 * @param {boolean} arrayB - Is returned value expected to be an array
 * @returns {string}
 * @description Get option value from widget konfig
 * @since 1.0.0.0
*/
const tdcGetWidgetOption = async (optionName, arrayB = false) => {
    let returnValue = "";
    await api.call("widget.getOption", optionName)
        .then(ret => {
            returnValue = ret;
        })
        .catch(error => {
            console.warn("(tdcGetWidgetOption) error", error);
        });

    if (arrayB) {
        returnValue = (returnValue !== "") ? returnValue.split(',') : [];
    }

    return returnValue;
}


/** @function 
 * @name loadValuesFromPuzzel
 * @async
 * @description Get load values from Puzzel widget options into arrays
 * @since 1.0.0.0
*/
const loadValuesFromPuzzel = async () => {
    console.debug("(loadValuesFromPuzzel) In");

    /* Hide Transfer Button from Queue Id */
    alarmQueuesArr = await tdcGetWidgetOption("alarmQueuesArr", true);
    console.info("(loadValuesFromPuzzel) alarmQueuesArr", alarmQueuesArr);

    /* Hide Queues with Id */
    hideQueuesArr = await tdcGetWidgetOption("hideQueuesArr", true);
    console.info("(loadValuesFromPuzzel) hideQueuesArr", hideQueuesArr);

    /* Shown Only Queues with Id */
    shownQueuesArr = await tdcGetWidgetOption("shownQueuesArr", true);
    console.info("(loadValuesFromPuzzel) shownQueuesArr", shownQueuesArr);

    /* WaitTime Thresholds */
    waitTimeThresholdsArr = await tdcGetWidgetOption("waitTimeThresholdsArr", true);
    console.info("(loadValuesFromPuzzel) waitTimeThresholdsArr", waitTimeThresholdsArr);

    console.debug("(loadValuesFromPuzzel) Out");
}


/** @function 
 * @name ndLoadAll
 * @async
 * @description Wrapper that runs all initializing functions
 * @since 1.0.0.0
*/
const ndLoadAll = async () => {
    console.debug("(ndLoadAll) In");

    await getPuzzelApi();

    let isUserNotValid = await validateUser();
    document.getElementById("validateBody").style.display = "none";

    /* Users customerKey not validated */
    if (isUserNotValid) {
        document.getElementById("errorBody").style.display = "block";
        return;
    }

    document.getElementById("divBodyId").style.display = "block"

    await fetchUserInfo();

    await loadValuesFromPuzzel();
    await eventsAndState();
    await loadSettings();
    await getVisualQueues();
    await ndRequestQueues(false, true);

    setInterval(ndRequestQueues, 10000);

    setButtonStatesFromCurrentCall();
    ndFocusSearchBox(1);

    console.debug("(ndLoadAll) Out");
}


/** @function 
 * @name ndTestingAll
 * @async
 * @description Wrapper that runs all initializing functions for TESTING
 * @since 1.0.0.0
*/
const ndTestingAll = async () => {
    console.debug("(ndTestingAll) In");

    let runOutsidePuzzelAllowed = outsidePuzzelAllowed();
    console.info("(ndTestingAll) runOutsidePuzzelAllowed", runOutsidePuzzelAllowed);

    if (!runOutsidePuzzelAllowed) {
        window.location.replace("error.html");
        return false;
    }

    testingConfig = await getTestingConfig();

    console.info("(ndTestingAll) testingConfig", testingConfig);
    if (testingConfig === "") {
        return false;
    }

    console.warn("Running outside Puzzel");

    /* Auth Api login if running outside Puzzel */
    await auth();
    await loadSettings()
    await getVisualQueues();
    await ndRequestQueues(false, true);

    console.info("(ndTestingAll) custObj", custObj);

    setTimeout(() => {
        QueuesDT.cell(':eq(0)', 0).focus();
    }, 500);

    setInterval(refreshAuth, 900000);
    setInterval(ndRequestQueues, 50000);

    $("#validateBody").hide();
    $("#divBodyId").show();

    await ndTesting2(testingConfig);
    ndFocusSearchBox();

    console.debug("(ndTestingAll) Out");
}


/** @function 
 * @name outsidePuzzelAllowed
 * @returns {boolean}
 * @description Check if Buddy is allowed to run outside of agent.puzzel.com
 * @since 1.0.0.0
*/
function outsidePuzzelAllowed() {
    console.debug("(outsidePuzzelAllowed) In");

    myDomain = window.location.hostname.toLowerCase();
    console.info("(runOutsidePuzzelAllowed) myDomain", myDomain);

    const allowedHosts = ["localhost", "jha", "netdesign-buddy-dev", "netdesign-buddy-test"]
    let allowedBol = allowedHosts.some(element => myDomain.includes(element))

    console.debug("(outsidePuzzelAllowed) Out");
    return allowedBol
}


/** @function 
 * @name getTestingConfig
 * @async
 * @returns {boolean}
 * @description Load testing config
 * @since 1.0.0.0
*/
const getTestingConfig = async () => {
    console.debug("(getTestingConfig) In");
    console.info("(getTestingConfig) myDomain", myDomain);

    let testingConfig = "";
    testingConfig = await ndTesting(testingConfig);

    const searchParams = new URLSearchParams(window.location.search);
    console.info("(getTestingConfig) searchParams", searchParams);

    if (window.location.hash !== "") {
        $("#validateBody").append("<br /><span>MS Teams validated</span>");
        setTimeout(() => {
            window.close("", "_parent", "")
        }, 1000);
        return "";
    }

    if (searchParams.has('tdcTestingConfig')) {
        testingConfig = searchParams.get('tdcTestingConfig')
    }

    if (!testingConfig) {
        $("#validateBody").append("<br /><span>Testing config not found</span>");
        return "";
    }

    let ndTestingFound = await ndTesting(testingConfig);

    if (!ndTestingFound) {
        $("#validateBody").append(`<br /><span>Testing config name not found: ${testingConfig}</span>`);
        return "";
    }

    console.debug("(getTestingConfig) Out");
    return testingConfig;
}


// #region Start the Async Function
console.debug("(StartAsync) In");

let refer = document.referrer.toUpperCase();
console.info("(StartAsync) refer", refer);

if (refer.includes("PUZZEL")) {
    ndLoadAll().then(() => {
        console.debug("StartAsync After ndLoadAll");

        setTimeout(initializeEmployees, 1000);
        setTimeout(initializeFavorites, 1000);
        setTimeout(setWindowHeight, 2000);

        let appServer = $('#ndBuddyAppServer').val();
        console.info("(StartAsync) appServer", appServer);

        if (appServer === "localhost") {
            //presenceObj.enabled = false;
            //presenceObj.msTeams = false;
        }

        if (presenceObj.msTeams) {
            setMsalConfig();
            setTimeout(() => {
                signIn();
            }, 1000);
        }

        ndFocusSearchBox();
    });

    console.debug("(StartAsync) Out");
}
else {
    /* Running outside Puzzel */
    console.debug("(StartAsync) Outside Puzzel In");

    ndTestingAll().then(() => {
        console.debug("(StartAsync) Outside Puzzel After ndTestingAll");

        setTimeout(ndDataTableInit, 1000, "#tableEmpId");
        setTimeout(setWindowHeight, 2000);

        let appServer = $('#ndBuddyAppServer').val();
        //appServer = "https://jhatest.northeurope.cloudapp.azure.com:8443/api/";
        console.info("(StartAsync) appServer", appServer);

        if (appServer === "localhost") {
            presenceObj.enabled = true;
            presenceObj.tdcScale = true;
            //presenceObj.msTeams = false;
        }

        console.info("(StartAsync) presenceObj", presenceObj);

        if (presenceObj.msTeams) {
            setMsalConfig();
            setTimeout(() => {
                signIn();
            }, 1000);
        }

        ndFocusSearchBox();
    });

    console.info("(StartAsync) testingConfig", testingConfig);
    console.debug("(StartAsync) Outside Puzzel Out");
}
// #endregion Start the Async Function