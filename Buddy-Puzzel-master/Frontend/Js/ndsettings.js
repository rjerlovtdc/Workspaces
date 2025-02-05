/* Global Variables */
versionObj.ndsettings = 37;

/* Document Ready */
$(function () {
    console.log("(ndSettings) Document Ready");

    /* Column indexes for datatable */
    colIndexObj.name = 5;
    colIndexObj.isFavorite = 11;
    colIndexObj.isDep = 12;
    colIndexObj.orgPath = 13;
    colIndexObj.id = 14;
    colIndexObj.azureId = 15;
    colIndexObj.dnd = 16;
    colIndexObj.pa = 17;
    colIndexObj.cfa = 18;
});


/* Load Settings */
const loadSettings = async () => {
    console.debug("(loadSettings) In");

    await ndCalloutNumListGet();
    let ndCallOutnumCurrent = await ndCallOutnumCurrentGet();

    if (ndCallOutnumCurrent !== 0) {
        $('#settingCalloutNum').val(ndCallOutnumCurrent);
        $('#settingCalloutNumSelect').val(ndCallOutnumCurrent);
    }

    /* Local Storage Support */
    localStorageAvailableBol = await tdcLocalStorageAvailable();
    console.info("localStorageAvailableBol", localStorageAvailableBol);

    if (!localStorageAvailableBol) {
        console.warn("(loadSettings) Local Storage Not Avaible");
    }

    /* Load Favorites from Cookie */
    await getFavoritesArr();
    await buildFavoritesList();
    initializeFavorites();
    await ndCustomerSpecificSettings();

    /* Checkboxes */
    $('#Settings input:checkbox, #settingQueue input:checkbox').each(function (index) {
        let id = $(this).attr("id");
        let value = tdcGetLocalStorage(id);

        if (value !== "NotSet") {
            $(this).prop("checked", JSON.parse(value));
        }
    });

    /* DropDowns */
    $('#Settings select').each(function (index) {
        let id = $(this).attr("id");
        let value = tdcGetLocalStorage(id);

        if (value !== "NotSet") {
            $(this).val(value);
        }

        switch (id) {
            case "settingQueueLayoutDD":
                let cssClass = (value === "COMPACT") ? "compact" : "";
                $("#tableQueId").removeClass("compact").addClass(cssClass);
                break;
            case "settingParkShortcut":
                let parkShortcutValue = (value === "NotSet") ? "F5" : value;
                $("#btnPark_ID").attr("title", "Alt+" + parkShortcutValue);
                break;
        }
    });

    transferTypeMark();

    /* Calendar Show Default */
    let settingRightSection = ($("#settingLayoutRightSectionDD").val() === "CALENDAR");
    calendarShow(settingRightSection);

    /* Search Word Placement */
    let settingLayoutOpeningHours = $("#settingLayoutOpeningHoursDD").val();
    console.info("(loadSettings) settingLayoutOpeningHours", settingLayoutOpeningHours)
    placeSearchWordRow(settingLayoutOpeningHours);


    /* Start Tab */
    let tabSetting = $("#settingBuddyStartTabDD").val();
    console.info("(loadSettings) tabSetting", tabSetting)

    switch (tabSetting) {
        case "Queues":
            //TODO
            break;
        case "Employees":
            //TODO
            break;
        case "Favorites":
            //initializeFavorites();
            break;
    }

    setActiveTab(tabSetting);

    let serviceLabelsFromCookie = tdcGetLocalStorage("serviceLabels");
    console.info("(loadSettings) serviceLabelsFromLocalStorage", serviceLabelsFromCookie);


    if (serviceLabelsFromCookie !== "NotSet") {
        let serviceLabelsArr = JSON.parse(serviceLabelsFromCookie);
        serviceLabelsMapG = getMapFromArray(serviceLabelsArr);
    }

    console.info("(loadSettings) serviceLabelsMapG", serviceLabelsMapG);
    console.debug("(loadSettings) Out");
}

/* Parked Call DD */
function addParkedCallOption(queuesMap) {
    console.debug("(addParkedCallOption) In");

    $("#settingParkDefaultQueue").empty();

    $('#settingParkDefaultQueue').append(
        new Option("Deaktiveret", 0, false, false)
    );

    queuesMap.forEach((value, key) => {
        $('#settingParkDefaultQueue').append(
            new Option(value, key, false, false)
        );
    });

    let selectedCookie = tdcGetLocalStorage("settingParkDefaultQueue");
    console.info("(addParkedCallOption) selectedCookie", selectedCookie);

    /* Check if stored park queue is still existing */
    $("#settingParkDefaultQueue option").each(function () {
        if ($(this).val() === selectedCookie) {
            $("#settingParkDefaultQueue").val(selectedCookie);
            console.info("(addParkedCallOption) Found", selectedCookie);
        }
    });

    console.debug("(addParkedCallOption) Out");
}


/* ndSelvbetjeningNu */
function addTabOption(optionName) {
    switch (optionName) {
        case "SelvbetjeningNu":
            $('#settingCallIncomingTabDD').append(new Option("Selvbetjening.nu", "SNU_TAB", false, false));
            $('#settingCallAnswerTabDD').append(new Option("Selvbetjening.nu", "SNU_TAB", false, false));
            $('#settingCallEndTabDD').append(new Option("Selvbetjening.nu", "SNU_TAB", false, false));
            break;
        case "JhaTest":
            $('#settingCallIncomingTabDD').append(new Option("JhaTest", "JHATEST_TAB", false, false));
            $('#settingCallAnswerTabDD').append(new Option("JhaTest", "JHATEST_TAB", false, false));
            $('#settingCallEndTabDD').append(new Option("JhaTest", "JHATEST_TAB", false, false));
            break;
    }
}


/* Get Current Callout Number */
const ndCallOutnumCurrentGet = async () => {
    console.log("(ndSettings) ndCallOutnumCurrentGet In");
    let ndCallOutnumCurrent = 0;

    let apiUrl = puzzelUrl + custObj.customerKey + '/properties/prof_call/prof_call_prop_00005?userid=' + agentObj.userId;

    let apiResponseNd = await puzzelApiCall(apiUrl);
    console.info("(ndSettings) apiResponseNd", apiResponseNd);

    if (apiResponseNd !== null) {
        ndCallOutnumCurrent = apiResponseNd.value;
    }

    console.log("(ndSettings) ndCallOutnumCurrent Out");

    return ndCallOutnumCurrent;
}


/* Get Callout Numners List */
const ndCalloutNumListGet = async () => {
    console.debug("(ndSettings) ndCalloutNumListGet In");
    $('#settingCalloutNumSelect option').remove();

    let apiUrl = `${puzzelUrl}${custObj.customerKey}/properties/prof_call/prof_callout_orig_num_list?userid=${agentObj.userId}`;

    let apiResponseNd = await puzzelApiCall(apiUrl);

    let optionsArr = (apiResponseNd !== null) ? apiResponseNd.value.split(';') : "";

    console.info("(ndSettings) ndCalloutNumListGet optionsArr", optionsArr);

    $.each(optionsArr, function (index, option) {
        if (option !== "") {
            let optionArr = option.split('|');
            $('#settingCalloutNumSelect').append(new Option(optionArr[1] + " [" + optionArr[0].trim() + "]", optionArr[0].trim(), false, false));
        }
    });

    console.debug("(ndSettings) ndCalloutNumListGet Out");
}


/* Post Current Callout Number */
const ndCallOutnumCurrentPost = async (number) => {
    console.debug("(ndSettings) ndCallOutnumCurrentPost In");

    let apiUrl = puzzelUrl + custObj.customerKey + '/properties/prof_call';
    body = JSON.stringify({
        "PropertyKey": "prof_call_prop_00005",
        "PropertyValue": number,
        "UserId": agentObj.userId
    })
    await puzzelApiCall(apiUrl, "POST", body);

    console.debug("(ndSettings) ndCallOutnumCurrentPost", ndCallOutnumCurrent);
}



/* Phone Message Templates */
const tdcGetPhoneMessageTemplates = async () => {
    console.debug("(tdcGetPhoneMessageTemplates In)");

    const response = await fetch('Res/Phonemessages/default.json');
    phoneTemplatesArr = await response.json();
    console.debug("(tdcGetPhoneMessageTemplates) responseJson", phoneTemplatesArr);

    $("#phoneMessageTemplateDD").empty();
    $.each(phoneTemplatesArr, function (index, template) {
        $('#phoneMessageTemplateDD').append(new Option(template.listName, index, template.default, template.default));
    });

    console.debug("(tdcGetPhoneMessageTemplates) Out");
}