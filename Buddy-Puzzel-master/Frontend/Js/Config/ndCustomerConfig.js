/* Customer Specific Settings */
const ndCustomerSpecificSettings = async () => {
    await ndBuildLayout();
    let ndSearchInOption = customersearchInEmpDD[custObj.customerKey];
    console.info("(ndCustomerSpecificSettings) ndSearchInOption", ndSearchInOption)

    if (typeof ndSearchInOption === "undefined") {
        ndSearchInOption = customersearchInEmpDD["DEFAULT"];
    }

    $.each(ndSearchInOption, function (value, key) {
        $("#searchInEmpDD").append($("<option></option>").attr("value", value).text(key));
    });

    let searchOrgOptions = orgUnitEmpDD[custObj.customerKey];
    console.info("(ndCustomerSpecificSettings) searchOrgOptions", searchOrgOptions)

    if (typeof searchOrgOptions !== "undefined") {
        $.each(searchOrgOptions, function (value, key) {
            $("#searchOrgDD").append($("<option></option>").attr("value", value).text(key));
        });
        $("#searchOrgDD").removeClass("ndHide");
    }

    if (miscRowsArr.length !== 0) {
        $.each(miscRowsArr, (index, rowObj) => {
            console.log("(load) value", rowObj);
            buildDynamicRow(rowObj.name, rowObj.id, rowObj.insertAfter);
        });
    }

    $("#searchingLblEmp").html(`> ${searchWordLength} tegn ..`);
}

/* Build Layout */
const ndBuildLayout = async () => {
    console.debug("(ndBuildLayout) In");

    switch (custObj.customerKey) {
        case "458631":  //ABB
            addPresence();
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            $("#dInitialsRow").removeClass("ndHide");
            break;
        case "474896":  //Apcoa
            addPresence();
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "10117738":  //DAB
            addPresence();
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "474898":  //Gribskov
            addTabOption("SelvbetjeningNu");
            $("#settingSapa").removeClass("ndHide");
            addPresence();
            presenceObj.tdcScale = true;
            break;
        case "4517111":  //Helsingør Forsyning
            addPresence();
            presenceObj.enabled = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "454014":  //IT-Forsyningen
            addTabOption("SelvbetjeningNu");
            addPresence();
            presenceObj.calendar = true;
            presenceObj.tdcScale = true;
            custObj.orgPath = true;

            /* MS Teams Presence */
            if (typeof agentObj.groupName !== "undefined" && agentObj.groupName.length > 3) {
                let groupNameShort = agentObj.groupName.substring(0, 3).toUpperCase();
                console.info("(ndBuildLayout) groupNameShort", groupNameShort);
                let groupNamesArr = ["ALL", "EGE", "FUR", "FRE"];
                if (groupNamesArr.includes(groupNameShort)) {
                    presenceObj.msTeams = true;
                    agentObj.msalConfig = groupNameShort;
                    agentObj.orgPath = orgPathFromGroupNameDic[groupNameShort];
                }

                /* SAPA */
                if (groupNameShort === "FRE") {
                    setTimeout(() => {
                        $("#myndighed").val("29188335");
                    }, 1000);
                }
            }

            console.info("(ndBuildLayout) IT-Forsyningen presenceObj", presenceObj);
            console.info("(ndBuildLayout) IT-Forsyningen agentObj", agentObj);

            $("#dDivisionRow").removeClass("ndHide");
            $("#settingSapa").removeClass("ndHide");
            $("#settingSolteq").removeClass("ndHide");
            break;
        case "454265":  //Morsø Kommune
            addPresence();
            presenceObj.enabled = true;
            presenceObj.calendar = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "4517222":  //munckgruppen
            addPresence();
            presenceObj.enabled = true;
            presenceObj.calendar = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = false;
            break;
        case "4054040":  //NetDesign
            addTabOption("SelvbetjeningNu");
            addTabOption("JhaTest");

            $("#dInitialsRow").removeClass("ndHide");
            $("#dDivisionRow").removeClass("ndHide");
            $("#dAdministrationNameRow").removeClass("ndHide");
            $("#dLocationRow").removeClass("ndHide");
            $("#dEmailMessage2").removeClass("ndHide");
            
            $("#dRoomNumberRow").removeClass("ndHide");
            $("#dIpPhoneRow").removeClass("ndHide");

            $("#settingLayoutOpeningHoursID").removeClass("d-none");
            $("#settingSolteq").removeClass("ndHide");
            $("#settingSapa").removeClass("ndHide");
            $("#settingEmployee").removeClass("ndHide");
            
            addPresence();

            presenceObj.timer = 10;
            presenceObj.enabled = true;
            presenceObj.calendar = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;

            /* Misc Rows */
            let miscRowsArr = [
                {
                    id: "dMisc1",
                    name: "Misc One",
                    insertAfter: "dInitialsRow"
                },
                {
                    id: "dMisc2",
                    name: "Misc Two",
                    insertAfter: "dLocationRow"
                }
            ];

            setTimeout(() => {
                /*$.each(miscRowsArr, (index, row) => {
                    buildDynamicRow(row.name, row.id, row.insertAfter);
                });*/
            }, 1000);

            setTimeout(() => {
                //$("#dMisc1").html("FlotFyr!");
                //$("#dMisc2").html("HER!");
            }, 200000);
    break;
        case "454056":  //Odense
            addTabOption("SelvbetjeningNu");
            $("#dAdministrationNameRow").removeClass("ndHide");
            $("#settingLayoutOpeningHoursID").removeClass("d-none");
            addPresence();
            presenceObj.tdcScale = true;
            custLayoutObj.fullNameWidth = 22;
            break;
        case "455160":  //Novafos
            presenceObj.enabled = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "12820":  //PFA
            addPresence();
            presenceObj.msTeams = true;
            break;
        case "2647119":  //Region H
            $("#dCalendarStatus").addClass("ndHide");
            $("#calendarContainer").addClass("ndHide");
            $("#dPhoneHoursHeader").addClass("ndHide");
            $("#dOpeningHoursHeader").html("Telefontider");
            $("#searchOrgDD").removeClass("ndHide");
            $("#infoContainer").removeClass("ndHide");
            $("#custGroupId").removeClass("ndHide");
            $("#regionHovedstaden1_ID").removeClass("ndHide");
            $("#dSearchWordHeader").html("Søgefraser");
            searchWordLength = 4;

            if (tdcGetLocalStorage("settingLayoutRightSectionDD") === "NotSet") {
                $("#settingLayoutRightSectionDD").val("NOTES");
                tdcSetLocalStorage("settingLayoutRightSectionDD", "NOTES");
            }
            break;
        case "45524905":  //Region Syd
            addPresence();
            //presenceObj.timer = 10;
            custObj.azureAd = false;
            custObj.orgPath = true;
            presenceObj.calendar = true;
            presenceObj.tdcScale = true;
            custLayoutObj.fullNameWidth = 50;

            $("#dAdministrationNameHeader").html("Åbningstider");
            $("#dAdministrationNameRow").removeClass("ndHide");

            $("#dRoomNumberRow").removeClass("ndHide");
            $("#dIpPhoneRow").removeClass("ndHide");

            if (tdcGetLocalStorage("settingLayoutRightSectionDD") === "NotSet") {
                $("#settingLayoutRightSectionDD").val("NOTES");
                tdcSetLocalStorage("settingLayoutRightSectionDD", "NOTES");
            }
            break;
        case "454335":  //Scanvaegt
            presenceObj.enabled = true;
            presenceObj.msTeams = true;
            break;
        case "32273":  //Kongeballe
            addTabOption("SelvbetjeningNu");
            break;
        case "1018811":  //Vejdirek
            addPresence();
            $("#dLocationRow").removeClass("ndHide");
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
    }

    if (presenceObj.msTeams) {
        $("#settingMsTeamsCard_ID").removeClass("ndHide");
        $("#infoMsTeamsCard_ID").removeClass("ndHide");
    }

    console.info("(ndBuildLayout) agentObj", agentObj);
    console.info("(ndBuildLayout) custObj", custObj);

    console.debug("(ndBuildLayout) In");
}


/* Presence Enabled */
function addPresence() {
    presenceObj.enabled = true;
    $(".ndBorderLeft").removeClass("ndHide");
    $("#presenceStatusDetail").removeClass("ndHide");
}

/* DataTable Emp Coloumn config */
const ndColoumnsEmp = {
    "4054040":  //NetDesign
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: "" },
            { data: 'presencePhone', width: 20, visible: true, defaultContent: "" },
            { data: 'isCalenderBusy', width: 20, visible: true, defaultContent: false },
            { data: 'presenceTeams', width: 20, visible: true, defaultContent: "" },
            { data: 'rowColor', width: 20, visible: true, defaultContent: "" },
            { data: 'fullName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'title', visible: true, className: "ndMaxWidth", defaultContent: "" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false, defaultContent: "" },
            { data: 'phone', width: 100, visible: true, defaultContent: "" },
            { data: 'mobile', width: 100, visible: true, defaultContent: "" },
            { data: 'favorite', width: 25, visible: true, defaultContent: false },
            { data: 'isDepartment', visible: false, defaultContent: false },
            { data: 'organizationPath', visible: false, defaultContent: "" },
            { data: 'id', visible: false, defaultContent: "" },
            { data: 'azureId', visible: false, defaultContent: "" },
            { data: 'presenceDND', visible: false, defaultContent: "" },
            { data: 'presencePA', visible: false, defaultContent: "" },
            { data: 'presenceCFANumber', visible: false, defaultContent: "" }
        ],
    "454056":  //Odense
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: true },
            { data: 'isCalenderBusy', width: 20, visible: true },
            { data: 'presenceTeams', width: 20, visible: true },
            { data: 'rowColor', width: 20, visible: false },
            { data: 'fullName', className: "ndMaxWidth", visible: true },
            { data: 'title', visible: true, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: true },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false },
            { data: 'presenceCFANumber', visible: false }
        ],
    "2647119":  //Region H
        [
            { data: 'presenceAggregated', width: 20, visible: false, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: false },
            { data: 'isCalenderBusy', width: 20, visible: false },
            { data: 'presenceTeams', width: 20, visible: false },
            { data: 'rowColor', width: 20, visible: false },
            { data: 'fullName', className: "ndMaxWidth", visible: true },
            { data: 'title', visible: true, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false },
            { data: 'presenceCFANumber', visible: false }
        ],
    "45524905":  //Region Syd
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: true },
            { data: 'isCalenderBusy', width: 20, visible: true },
            { data: 'presenceTeams', width: 20, visible: false },
            { data: 'rowColor', width: 20, visible: true },
            { data: 'fullName', className: "ndMaxWidth2", visible: true },
            { data: 'title', visible: false, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false },
            { data: 'presenceCFANumber', visible: false }
        ],
    "DEFAULT":  //Default
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: "" },
            { data: 'presencePhone', width: 20, visible: true, defaultContent: "" },
            { data: 'isCalenderBusy', width: 20, visible: true, defaultContent: false },
            { data: 'presenceTeams', width: 20, visible: true, defaultContent: "" },
            { data: 'rowColor', width: 20, visible: false, defaultContent: "" },
            { data: 'fullName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'title', visible: true, className: "ndMaxWidth", defaultContent: "" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false, defaultContent: "" },
            { data: 'phone', width: 100, visible: true, defaultContent: "" },
            { data: 'mobile', width: 100, visible: true, defaultContent: "" },
            { data: 'favorite', width: 25, visible: true, defaultContent: false },
            { data: 'isDepartment', visible: false, defaultContent: false },
            { data: 'organizationPath', visible: false, defaultContent: "" },
            { data: 'id', visible: false, defaultContent: "" },
            { data: 'azureId', visible: false, defaultContent: "" },
            { data: 'presenceDND', visible: false, defaultContent: "" },
            { data: 'presencePA', visible: false, defaultContent: "" },
            { data: 'presenceCFANumber', visible: false, defaultContent: "" }
        ]
}


/* DataTable Fav Coloumn config */
const ndColoumnsEmpFav = {
    "4054040":  //NetDesign
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: "" },
            { data: 'presencePhone', width: 20, visible: true, defaultContent: "" },
            { data: 'isCalenderBusy', width: 20, visible: true, defaultContent: false },
            { data: 'presenceTeams', width: 20, visible: true, defaultContent: "" },
            { data: 'rowColor', width: 20, visible: false, defaultContent: "" },
            { data: 'fullName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'title', visible: true, className: "ndMaxWidth", defaultContent: "" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false, defaultContent: "" },
            { data: 'phone', width: 100, visible: true, defaultContent: "" },
            { data: 'mobile', width: 100, visible: true, defaultContent: "" },
            { data: 'favorite', width: 25, visible: true, defaultContent: false },
            { data: 'isDepartment', visible: false, defaultContent: false },
            { data: 'organizationPath', visible: false, defaultContent: "" },
            { data: 'id', visible: false, defaultContent: "" },
            { data: 'azureId', visible: false, defaultContent: "" },
            { data: 'presenceDND', visible: false, defaultContent: "" },
            { data: 'presencePA', visible: false, defaultContent: "" }
        ],
    "454056":  //Odense
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: true },
            { data: 'isCalenderBusy', width: 20, visible: true },
            { data: 'presenceTeams', width: 20, visible: true },
            { data: 'rowColor', width: 20, visible: false },
            { data: 'fullName', className: "ndMaxWidth", visible: true },
            { data: 'title', visible: true, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: true },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false }
        ],
    "2647119":  //Region H
        [
            { data: 'presenceAggregated', width: 20, visible: false, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: false },
            { data: 'isCalenderBusy', width: 20, visible: false },
            { data: 'presenceTeams', width: 20, visible: false },
            { data: 'rowColor', width: 20, visible: false },
            { data: 'fullName', className: "ndMaxWidth", visible: true },
            { data: 'title', visible: true, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false }
        ],
    "45524905":  //Region Syd
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: 0 },
            { data: 'presencePhone', width: 20, visible: true },
            { data: 'isCalenderBusy', width: 20, visible: true },
            { data: 'presenceTeams', width: 20, visible: false },
            { data: 'rowColor', width: 20, visible: true },
            { data: 'fullName', className: "ndMaxWidth2", visible: true },
            { data: 'title', visible: false, className: "ndMaxWidth" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false },
            { data: 'phone', width: 100, visible: true },
            { data: 'mobile', width: 100, visible: true },
            { data: 'favorite', width: 25, visible: true },
            { data: 'isDepartment', visible: false },
            { data: 'organizationPath', visible: false },
            { data: 'id', visible: false },
            { data: 'azureId', visible: false },
            { data: 'presenceDND', visible: false },
            { data: 'presencePA', visible: false },
            { data: 'presenceCFANumber', visible: false }
        ],
    "DEFAULT":  //Default
        [
            { data: 'presenceAggregated', width: 20, visible: true, defaultContent: "" },
            { data: 'presencePhone', width: 20, visible: true, defaultContent: "" },
            { data: 'isCalenderBusy', width: 20, visible: true, defaultContent: false },
            { data: 'presenceTeams', width: 20, visible: true, defaultContent: "" },
            { data: 'rowColor', width: 20, visible: false, defaultContent: "" },
            { data: 'fullName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'title', visible: true, className: "ndMaxWidth", defaultContent: "" },
            { data: 'departmentName', className: "ndMaxWidth", visible: true, defaultContent: "" },
            { data: 'streetAddress', className: "ndMaxWidth", visible: false, defaultContent: "" },
            { data: 'phone', width: 100, visible: true, defaultContent: "" },
            { data: 'mobile', width: 100, visible: true, defaultContent: "" },
            { data: 'favorite', width: 25, visible: true, defaultContent: false },
            { data: 'isDepartment', visible: false, defaultContent: false },
            { data: 'organizationPath', visible: false, defaultContent: "" },
            { data: 'id', visible: false, defaultContent: "" },
            { data: 'azureId', visible: false, defaultContent: "" },
            { data: 'presenceDND', visible: false, defaultContent: "" },
            { data: 'presencePA', visible: false, defaultContent: "" }
        ]
}

/* Customer SearchIn DropDown */
const customersearchInEmpDD = {
    "2647119":  //Region H
    {
        "departmentName": "Afdeling",
        "name": "Navn",
        "searchWords": "Søgefraser",
        "title": "Titel",
        "streetAddress": "Vejnavn"
    },
    "DEFAULT":  //Default
    {
        "departmentName": "Afdeling",
        "name": "Fulde navn",
        "firstName": "Fornavn",
        "lastName": "Efternavn",
        "searchWords": "Søgeord",
        "title": "Titel",
        "streetAddress": "Vejnavn"
    }
};


/* Customer OrgUnit DropDown */
const orgUnitEmpDD = {
    "454014":  //IT-Forsyningen
    {
        "TOP_454014_Allerød": "Allerød",
        "TOP_454014_Ballerup": "Ballerup",
        "TOP_454014_CFT Ballerup": "CFT",
        "TOP_454014_Egedal": "Egedal",
        "TOP_454014_Furesø": "Furesø",
        "TOP_454014_Fredensborg": "Fredensborg",
        "TOP_454014_454014 IT Forsyningen": "IT Forsyningen",
    },
    "4054040":  //NetDesign
    {
        "TOP|45524905|OUH": "København",
        "TOP|45524905|REG": "Odense",
        "TOP|45524905|SHS": "Århus",
    },
    "45524905":  //Region Syd
    {
        "TOP|45524905|OUH": "OUH",
        "TOP|45524905|REG": "REG",
        "TOP|45524905|SHS": "SHS",
        "TOP|45524905|SLB": "SLB",
        "TOP|45524905|SVS": "SVS"
    },
    "2647119":  //Region Hovedstaden
    {
        "14,6": "AHH",
        "15": "BBH",
        "11": "BOH",
        "12,8,18": "HGH",
        "3": "NOH",
        "4,5": "RGG",
        "1": "RHP",
        "2,7": "RH"
    }
};


/* Customer Name From Key */
const customerInfoFromKey = {
    "458631": { Name: "ABB", cvrNr: "", bSapa: false },
    "474896": { Name: "Apcoa", cvrNr: "", bSapa: false },
    "10117738": { Name: "Dansk Almennyttigt Boligselskab", cvrNr: "", bSapa: false },
    "474898": { Name: "Gribskov Kommune", cvrNr: "29188440", bSapa: false },
    "4517111": { Name: "Helsingør Forsyning", cvrNr: "", bSapa: false },
    "454014": { Name: "IT-Forsyningen", cvrNr: "35202285", bSapa: true },
    "454265": { Name: "Morsø Kommune", cvrNr: "", bSapa: false },
    "4517222": { Name: "Munck Gruppen", cvrNr: "", bSapa: false },
    "4054040": { Name: "NetDesign", cvrNr: "14773908", bSapa: false },
    "455160": { Name: "Novafos", cvrNr: "", bSapa: false },
    "454056": { Name: "Odense Kommune", cvrNr: "", bSapa: false },
    "12820": { Name: "PFA", cvrNr: "", bSapa: false },
    "2647119": { Name: "Region Hovedstaden", cvrNr: "", bSapa: false },
    "45524905": { Name: "Region Syd", cvrNr: "", bSapa: false },
    "454335": { Name: "Scanvægt", cvrNr: "", bSapa: false },
    "1018811": { Name: "Vejdirektoratet", cvrNr: "", bSapa: false },
    "": { Name: "Ukendt kunde", cvrNr: "", bSapa: false },
    "default": { Name: "Ukendt kunde", cvrNr: "", bSapa: false }
}


/* MSAL Config */
const msalCustomerConfig = {
    "458631":  //ABB
    {
        "DEFAULT": {
            "clientId": "2094313c-833a-40c6-a324-90b05b36e87b",
            "tenantId": "372ee9e0-9ce0-4033-a64a-c07073a91ecd"
        }
    },
    "474896":  //Apcoa
    {
        "DEFAULT": {
            "clientId": "ac9bb32d-167c-4838-aa8b-0136f0de3ad0",
            "tenantId": "538a6619-7a1f-48a1-873e-abd5d052e980"
        }
    },
    "10117738":  //DAB
    {
        "DEFAULT": {
            "clientId": "39664ba7-d545-4563-9e44-566d3220599f",
            "tenantId": "1d5d4aa1-4a6d-4e14-a382-b8d5f5a2be3f"
        }
    },
    "4517111":  //HelsinFor
    {
        "DEFAULT": {
            "clientId": "28898f50-7dbf-47e4-b424-e6b8f79243cf",
            "tenantId": "8162953c-5783-4d47-a2df-8d670bce00c6"
        }
    },
    "454014":  //IT-Forsyningen
    {
        "ALL":  //Alleroed
        {
            "clientId": "9511a701-13e7-484b-8e65-9aa6c49b80c8",
            "tenantId": "4a3b76ae-faaa-417e-9bb6-b62544e34363"
        },
        "FRE":  //Fredensborg
        {
            "clientId": "72f69f59-ba97-4aa1-8184-9295505b2c3e",
            "tenantId": "233a2a3e-ce39-4e81-afc6-6928bc5edffe"
        },
        "FUR":  //Furesoe
        {
            "clientId": "4e9b57e3-a14a-46d2-90e3-0df3f6a88971",
            "tenantId": "54b12f94-d8e4-4c53-a8a2-b525fdaff193"
        },
        "EGE":  //Egedal
        {
            "clientId": "aac6400a-0433-43b9-aa99-08f7411edb73",
            "tenantId": "28bf998a-8123-4874-bda6-e25670c1c089"
        }
    },
    "454265":  //Morsø Kommune
    {
        "DEFAULT": {
            "clientId": "f066a06f-6e48-45d6-ae49-ac71089d7661",
            "tenantId": "a72842fb-a665-41b1-892f-ae5c61f0a510"
        }
    },
    "4517222":  //Munck Gruppen
    {
        "DEFAULT": {
            "clientId": "15031b3c-4e98-4e10-963e-b44f8b21873d",
            "tenantId": "5d0b65bc-8b72-4f59-b9f5-f1ca412f5af8"
        }
    },
    "4054040":  //NetDesign
    {
        "DEFAULT": {
            "clientId": "509447b5-a1ee-48ef-b17e-0304bbbee1b0",
            "tenantId": "84adce5c-2f55-4a74-bb37-3f1609020ba2"
        }
    },
    "455160":  //Novafos
    {
        "DEFAULT": {
            "clientId": "dc98fe61-5826-44eb-a480-36c18c717954",
            "tenantId": "d1060655-cfa1-4d91-a362-0090d74ffd68"
        }
    },
    "12820":  //PFA
    {
        "DEFAULT": {
            "clientId": "745446bb-e462-4632-a84f-2aa0f9fb9d32",
            "tenantId": "8121fdf8-bc8e-4d71-b4d6-3da048dd2505"
        }
    },
    "1018811":  //Vejdirektoratet
    {
        "DEFAULT": {
            "clientId": "987cc663-08b1-494a-b2bf-726e7e5498db",
            "tenantId": "f1044067-8c60-4022-98d8-69306c5f7238"
        }
    },
    "454335":  //Scanvaegt
    {
        "DEFAULT": {
            "clientId": "543eaa6d-3ac7-4f8f-bb3f-6f096692e315",
            "tenantId": "8012a67e-5c0d-4fd8-b3bf-dbbfaff82bc5"
        }
    }
}


/* Orgpath from groupname (short) */
const orgPathFromGroupNameDic = {
    "ALL": "TOP|454014|Allerød",
    "EGE": "TOP|454014|Egedal",
    "FRE": "TOP|454014|Fredensborg",
    "FUR": "TOP|454014|Furesø",
    "ITF": "TOP|454014|454014 IT Forsyningen"
}

/* RowColor Name From Bit */
const rowColorFromBit = {
    0: { colorName: "", depName: "" },
    1: { colorName: "Gray", depName: "Grå" },
    2: { colorName: "Green", depName: "Grøn" },
    3: { colorName: "Orange", depName: "Orange" },
    4: { colorName: "Turquoise", depName: "Tyrkis" },
    5: { colorName: "Plum", depName: "Blomme" },
    6: { colorName: "Yellow", depName: "Gul" },
    7: { colorName: "CornflowerBlue", depName: "Blå" },
    8: { colorName: "Red", depName: "Rød" },
    9: { colorName: "Wheat", depName: "Hvede" },
    "": { colorName: "", depName: "" },
}





