/**
 * @module ndParsing
*/

/* Global Variables */
versionObj.ndparsing = 37;
var setFocusTimeoutId1G = 0;
var setFocusTimeoutId2G = 0;


/** @function 
 * @name parseCbasUserResponse
 * @param {object} cUser - CBAS user object 
 * @return {object} - ndUSer
 * @description Parse CBAS user response and return ndUser object
 * @since 1.0.0.0
*/
function parseCbasUserResponse(cUser) {
    console.debug("(parseCbasUserResponse) In");
    console.info("(parseCbasUserResponse) cUser", cUser);

    let ndUser = {
        id: cUser?.id,
        azureId: "",
        initials: "",
        firstName: cUser?.firstName || "",
        lastName: cUser?.lastName || "",
        title: cUser?.title || "",
        isAgent: false,

        email: "", phone: "", mobile: "", fax: "", altFax: "",
        secretEmail: "", secretPhone: "", secretMobile: "", secretFax: "",

        searchWords: cUser?.searchphrases || [""],
        imageUrl: cUser?.imageUrl || "",

        isDepartment: cUser.isDepartment,
        departmentName: cUser.organization?.departmentName || "",

        organizationName: cUser.organization?.name || "",
        organizationCode: cUser.organization?.code || "",
        organizationCenter: cUser.organization?.center || "",
        organizationSection: cUser.organization?.section || "",
        organizationRoom: cUser.organization?.room || "",
        organizationOffice: cUser.organization?.office || "",
        organizationPath: "",
        info: cUser?.info || "", customGroup: cUser?.customGroup || "",
        division: "", location: "",

        isCalenderBusy: "",

        managerName: "", managerEmail: "",
        administrationName: "",
        streetAddress: cUser?.streetAddress || "",
        roomNumber: "",
        phoneHours: "",
        openingHours: cUser?.openingHours || "",
        url: "", rowColor: "",

        presenceAggregated: "",
        presencePhone: "",
        presenceMobile: "",
        presenceCFANumber: "",
        presencePA: "",
        presenceDND: "",
        presenceTeams: "",
        presenceAgent: "",

        statusText: "OK"
    };

    ndUser.openingHours = ndUser.openingHours?.replace(/(?:\r\n|\r|\n)/g, "<br>") || "";
    ndUser.info = ndUser.info?.replace(/(?:\r\n|\r|\n)/g, "<br>") || "";

    ndUser.fullName = ndUser.firstName + " " + ndUser.lastName
    ndUser.favorite = favoritesEmpArr.includes(ndUser.id);

    if (ndUser.searchWords.toString() === "") {
        ndUser.searchWords = "";
    }

    /* Phone Numbers */
    if (cUser.communicationPoints !== null) {
        $.each(cUser.communicationPoints, function (index, comPoint) {
            switch (comPoint.communicationType) {
                case "EMail":
                    ndUser.email = comPoint?.remoteAddress || "";
                    ndUser.secretEmail = (comPoint?.isHidden);
                    break;
                case "Phone":
                    ndUser.phone = comPoint?.remoteAddress || "";
                    ndUser.phone = ndUser.phone.replace("+45", "").replace("+1", "").replace("+2", "");
                    ndUser.secretPhone = (comPoint?.isHidden);
                    break;
                case "Cell":
                    ndUser.mobile = comPoint?.remoteAddress || "";
                    ndUser.mobile = ndUser.mobile.replace("+45", "").replace("+1", "").replace("+2", "");
                    ndUser.secretMobile = (comPoint?.isHidden);
                    break;
                case "Fax":
                    ndUser.fax = comPoint?.remoteAddress || "";
                    ndUser.fax = ndUser.fax.replace("+45", "").replace("+1", "").replace("+2", "");
                    ndUser.secretFax = (comPoint?.isHidden);
                    break;
            }
        });
    }

    /* Customer Specific Parsing */
    let ndCustomerSpecific = parseCustomerSpecific(ndUser, cUser);
    Object.assign(ndUser, ndCustomerSpecific);

    console.info("(parseCbasUserResponse) ndUser", ndUser);
    console.debug("(parseCbasUserResponse) Out");

    return ndUser;
}


/** @function 
 * @name parsePuzzelUserResponse
 * @param {object} pUser - Puzzel user object 
 * @return {object} - ndUSer
 * @description Parse Puzzel user response and return ndUser object
 * @since 1.0.0.0
*/
function parsePuzzelUserResponse(pUser) {
    console.debug("(parsePuzzelUserResponse) In");
    console.info("(parsePuzzelUserResponse) pUser", pUser);

    const ndUser = {
        id: pUser?.id,
        azureId: pUser?.azureObjectId || "",
        initials: "",
        firstName: pUser?.firstName || "",
        lastName: pUser?.lastName || "",
        title: pUser?.title || "",
        isAgent: false,

        email: "", phone: "", mobile: "", fax: "", altFax: "",
        secretPhone: "", secretMobile: "", noTransfer: false,

        organizationId: pUser?.organizationId || "",
        departmentName: pUser?.organizationName || "",
        organizationPath: pUser?.organizationPath || "",
        division: "", location: "", customGroup: "",
        isDepartment: false,

        info: pUser?.info?.replace(/(?:\r\n|\r|\n)/g, "<br>") || "",
        services: pUser?.services || "",
        searchWords: "",

        isCalenderBusy: pUser?.isCalenderBusy || false,

        managerName: "", managerEmail: "",
        administrationName: "", streetAddress: "", roomNumber: "",
        phoneHours: "", openingHours: "",
        url: "", rowColor: "", imageUrl: "",

        presenceAggregated: "",
        presencePhone: "",
        presenceMobile: "",
        presenceCFANumber: "",
        presencePA: "",
        presenceDND: "",
        presenceTeams: "",
        presenceAgent: "",

        statusText: "OK"
    };

    ndUser.info = ndUser.info.replaceAll("$b_", "<b>").replaceAll("_b$", "</b>");
    ndUser.info = ndUser.info.replaceAll("$i_", "<i>").replaceAll("_i$", "</i>");
    ndUser.info = ndUser.info.replaceAll("$u_", "<u>").replaceAll("_u$", "</u>");
    ndUser.info = ndUser.info.replaceAll("$h_", "<a>").replaceAll("_h$", "</a>");
    ndUser.info = ndUser.info
        .replaceAll("$n_", `<span class="numberInNotes">`)
        .replaceAll("_n$", "</span>");

    ndUser.fullName = ndUser.firstName + " " + ndUser.lastName;
    ndUser.favorite = favoritesEmpArr.includes(ndUser.id.toString());

    /* Phone Numbers */
    if (pUser.communicationPoints !== null) {
        $.each(pUser.communicationPoints, function (index, comPoint) {
            switch (comPoint.communicationType) {
                case "EMail":
                    ndUser.email = comPoint?.remoteAddress || "";
                    break;
                case "Phone":
                    ndUser.phone = comPoint?.remoteAddress || "";
                    ndUser.phone = ndUser.phone.replace("+45", "").replace("+1", "").replace("+2", "");
                    break;
                case "Cell":
                    ndUser.mobile = comPoint?.remoteAddress || "";
                    ndUser.mobile = ndUser.mobile.replace("+45", "").replace("+1", "").replace("+2", "");
                    break;
                case "Fax":
                    ndUser.fax = comPoint?.remoteAddress || "";
                    /* Secret Number */
                    if (ndUser.fax.length === 8) {
                        ndUser.secretPhone = (ndUser.fax.charAt(0) === "1");
                        ndUser.secretMobile = (ndUser.fax.charAt(1) === "1");
                        ndUser.noTransfer = (ndUser.fax.charAt(2) === "1");
                        ndUser.rowColor = ndUser.fax.charAt(3);
                    }
                    break;
            }
        });
    }

    /* Info [Notes] and Search Words both in Info field*/
    let searchWordsArr = ndUser.info.split('|');
    if (searchWordsArr.length > 1) {
        ndUser.info = tdcFormatHighlightText(searchWordsArr[0]);
        ndUser.searchWords = tdcFormatHighlightText(searchWordsArr[1]);
    }
    else {
        ndUser.searchWords = tdcFormatHighlightText(ndUser.info);
        ndUser.info = "";
    }

    /*  Department Puzzel (OrganizationName) replace \\ */
    ndUser.departmentName = ndUser.departmentName.replace("\\", ">");

    /* Department File Upload (fullName start with '!') */
    if (ndUser.fullName.startsWith("!")) {
        ndUser.fullName = ndUser.fullName.slice(1);
        ndUser.departmentName = ndUser.fullName;
        ndUser.isDepartment = true;
    }

    /* Multiple values in services (contains '|') */
    if (ndUser.services.includes("|")) {
        const ndService = parseServices(ndUser.services)
        Object.assign(ndUser, ndService);
    }
    else {
        ndUser.streetAddress = ndUser.services;
    }

    /* Custome Specific Parsing */
    const ndCustomerSpecific = parseCustomerSpecific(ndUser, pUser);
    Object.assign(ndUser, ndCustomerSpecific);

    console.info("(parsePuzzelUserResponse) ndUser", ndUser);
    console.debug("(parsePuzzelUserResponse) Out");

    return ndUser;
}


/** @function 
 * @name parseCustomerSpecific
 * @param {object} ndUser - ndUser object 
 * @param {object} pUser - Puzzel user object 
 * @return {object} - ndUSer
 * @description Customer specific parsing
 * @since 1.0.0.0
*/
function parseCustomerSpecific(ndUser, pUser) {
    console.debug("parseCustomerSpecific In");

    let orgPath = ndUser.organizationPath;

    switch (custObj.customerKey) {
        case "458631":  //ABB
            ndUser.initials = ndUser.services;
            ndUser.departmentName = ndUser.departmentName.split(',')[0] || "";
            break;
        case "4054040":  //NetDesign 
            ndUser.isDepartment = (ndUser.title.substring(0, 8).toUpperCase() === "FUNKTION");
            break;
        case "45524905":  //Region Syd 
            ndUser.isDepartment = (ndUser.title.substring(0, 3).toUpperCase() === "FNR");

            if (typeof ndUser.orgTree !== "undefined") {
                ndUser.orgTree = getOrgTreeFromService(ndUser.orgTree);
            }

            if (orgPath.includes("|REG|")) {  //REG
                if (!ndUser.services.includes("|")) {
                    ndUser.roomNumber = ndUser.services;
                    ndUser.streetAddress = "";
                }
            }
            break;
        case "1018811":  //Vejdirektorat
            ndUser.location = pUser?.services || ""
            ndUser.streetAddress = "";
            break;
    }

    console.debug("parseCustomerSpecific Out");
    return ndUser;
}


/** @function 
 * @name parseServices
 * @param {string} services - services string
 * @return {object} - ndService
 * @description Parse services string and return ndService object
 * @since 1.0.0.0
*/
function parseServices(services) {
    console.debug("parseServices In");

    const ndService = {
        managerName: "", managerEmail: "",
        administrationName: "", altFax: "",
        phoneHours: "", openingHours: "",
        streetAddress: "", url: "",
        orgTree: "", roomNumber: "", ipPhone: "",
        rowColor: ""
    };

    const serviceArr = services.split("|");
    console.info("parseServices serviceArr", serviceArr);

    /* Services Iterating */
    $.each(serviceArr, function (index, service) {
        let serviceValue = service.trim();
        switch (index) {
            case 0:  //Administration Name (Forvaltning)
                ndService.administrationName = (service === "X") ? "" : serviceValue;
                break;
            case 1: //Opening Hours Phone
                ndService.phoneHours = parseOpeningHours(serviceValue)

                break;
            case 2: //Opening Hours
                ndService.openingHours = parseOpeningHours(serviceValue)
                break;
            case 3:  //Address
                ndService.streetAddress = serviceValue;
                break;
            case 4:  //Manager
                const ndManager = parseManagerFromServices(serviceValue);
                Object.assign(ndService, ndManager);
                break;
            case 5:  //URL
                ndService.url = serviceValue;
                break;
            case 6:  //OrgTree
                ndService.orgTree = serviceValue;
                break;
            case 7:  //RowColor
                ndService.rowColor = serviceValue;
                console.log("RowColor", serviceValue);
                break;
            case 8:  //FaxNumber
                ndService.altFax = serviceValue;
                break;
            case 9:  //RoomNumber
                ndService.roomNumber = serviceValue;
                break;
            case 10:  //IpPhone
                ndService.ipPhone = serviceValue;
                break;
        }
    });

    console.info("parseServices ndService", ndService);
    console.debug("parseServices Out");

    return ndService;
}


/** @function 
 * @name getOrgTreeFromService
 * @param {string} services - services string
 * @return {object} - orgText
 * @description Parse Organization Tree from Services
 * @since 1.0.0.0
*/
function getOrgTreeFromService(services) {
    console.debug("getOrgTreeFromService In");
    console.info("getOrgTreeFromService services", services);

    if (typeof services === "undefined") {
        return;
    }

    let servicesArr = services.split(',');
    console.info("getOrgTreeFromService services", services);

    let arrowDown = "<span class='fas fa-caret-down'></span>";
    let arrowRight = "<span class='fas fa-long-arrow-alt-right'></span>";
    let orgText = "", counter = 0;

    $.each(servicesArr, function (index, text) {
        let trimTxt = text.trim();
        console.info("getOrgTreeFromService index", index);
        switch (index) {
            case 0:  //First row
                orgText = (trimTxt !== "") ? trimTxt + ndGetSpaces(2) + arrowDown + "<br />" : "";
                break;
            case servicesArr.length - 1:  //Last row
                orgText += (trimTxt !== "") ? ndGetSpaces(index * 4) + arrowRight + ndGetSpaces(2) + trimTxt : "";
                break;
            case 1:  //Second row
                orgText += (trimTxt !== "") ? ndGetSpaces(index * 4) + arrowRight + ndGetSpaces(2) + trimTxt + "<br />" : "";
                break;
            default:
                orgText += (trimTxt !== "") ? ndGetSpaces(index * 4) + arrowRight + ndGetSpaces(2) + trimTxt + ndGetSpaces(2) + "<br />" : "";
                break;
        }
    });

    console.info("getOrgTreeFromService orgText", orgText);
    console.debug("getOrgTreeFromService Out");
    return orgText;
}


/** @function 
 * @name parseManagerFromServices
 * @param {string} services - services string
 * @return {object} - ndService
 * @description Parse Manager From Service
 * @since 1.0.0.0
*/
function parseManagerFromServices(services) {
    const ndService = {
        managerName: "",
        managerEmail: "",
    };

    const serviceArr = services.split(',');

    $.each(serviceArr, function (index, services) {
        switch (index) {
            case 0:  //Manager Name
                ndService.managerName = services;
                break;
            case 1: //Manager Email
                ndService.managerEmail = services;
                break;
        }
    });

    return ndService;
}


/** @function 
 * @name parseOpeningHours
 * @param {string} services - services string
 * @return {string} - returnText
 * @description v
 * @since 1.0.0.0
*/
function parseOpeningHours(services) {
    let returnText = "";
    const openingHoursArr = services.split(',');

    $.each(openingHoursArr, function (index, openingHours) {
        switch (index) {
            case 0:
                returnText = openingHours;
                break;
            case 1:
                returnText += "<br />" + openingHours;
                break;
            case 2:
                returnText += "<br />" + openingHours;
                break;
            case 3:
                returnText += "<br />" + openingHours;
                break;
        }
    });

    return returnText;
}


/** @function 
 * @name parseDataFromAzure
 * @param {object} azureUser - Microsoft user object from Azure
 * @param {object} ndUser - ndUser object
 * @return {object} - ndUserAzure
 * @description Parse Data From Azure
 * @since 1.0.0.0
*/
function parseDataFromAzure(azureUser, ndUser) {
    console.debug("(parseDataFromAzure) In");

    console.info("(parseDataFromAzure) ndUser", ndUser);
    console.info("(parseDataFromAzure) azureUser", azureUser);

    const ndUserAzure = {
        initials: "",
        administrationName: azureUser?.Department || "",
        streetAddress: azureUser?.StreetAddress || "",
        postalCode: azureUser?.PostalCode || "",
        city: azureUser?.City || "",
        officeLocation: azureUser?.OfficeLocation || "",
        onPremisesDistinguishedName: azureUser?.OnPremisesDistinguishedName || "",
        onPremisesExtensionAttributes: azureUser?.OnPremisesExtensionAttributes || "",
        organizationText: "",
        division: azureUser?.ndDivision || "",
        managerGivenName: azureUser.Manager?.GivenName || "",
        managerSurname: azureUser.Manager?.Surname || "",
        managerDisplayName: azureUser.Manager?.DisplayName || "",
        managerEmail: azureUser.Manager?.Mail || "",
        statusText: "OK"
    }

    /* Initials */
    ndUserAzure.initials = azureUser.UserPrincipalName.split('@')[0].toUpperCase();

    /* Address */
    ndUserAzure.fullAddress = (ndUserAzure.streetAddress !== "") ?
        ndUserAzure.streetAddress + ", " + ndUserAzure.postalCode + " " + ndUserAzure.city : "";

    /* Organization */
    let arrowDown = "<span class='fas fa-caret-down'></span>";
    let arrowRight = "<span class='fas fa-long-arrow-alt-right'></span>";

    let organizationText = "";

    /* Organization from OnPremisesExtensionAttributes */
    let customerKeys = ["4054040", "474898"]; //NetDesign and Gribskov
    let bolValue = customerKeys.some(element => custObj.customerKey.includes(element))
    let startKey = (custObj.customerKey !== "474898") ? 1 : 11;

    let counter = 0;
    if (bolValue && ndUserAzure.onPremisesExtensionAttributes !== "") {
        console.debug("OnPremisesExtensionAttributes In");

        let preValue = "";
        let extAttArr = new Map();

        $.each(ndUserAzure.onPremisesExtensionAttributes, function (key, value) {
            let keyValue = parseInt(key.replace('ExtensionAttribute', ''));
            if (keyValue >= startKey && keyValue <= startKey + 4) {
                extAttArr.set(keyValue, value);
            }
        });

        var extAttSortedArr = new Map([...extAttArr].sort((a, b) => a[0] - b[0]));  //spread operator ..., expands array > list
        console.debug("OnPremisesExtensionAttributes extAttArr", extAttSortedArr);

        extAttSortedArr.forEach((value, key) => {
            if (key === startKey) {
                organizationText = value + ndGetSpaces(2) + arrowDown + "<br />";  //First row
            }

            if (key !== startKey && value != preValue) {
                organizationText += ndGetSpaces(counter * 4) + arrowRight + ndGetSpaces(2) + value + "<br />";
            }

            preValue = value;
            counter++;
        });

        ndUserAzure.organizationText = organizationText;
    }

    /* Organization from OnPremisesDistinguishedName */
    if (!bolValue && ndUserAzure.onPremisesDistinguishedName !== "") {
        const organizationArr = ndUserAzure.onPremisesDistinguishedName.split(",");
        let organizationArrFiltered = organizationArr.filter(filterOrganization);

        if (custObj.customerKey === "454014") {
            organizationArrFiltered.reverse();
        }

        if (custObj.customerKey === "458631") {
            organizationArrFiltered = ndUserAzure.administrationName.split(',');
        }

        if (ndUser.organizationPath.includes("TOP|454014|Allerød")) {
            organizationArrFiltered = ndUserAzure.onPremisesExtensionAttributes.ExtensionAttribute3.split('/');
            organizationArrFiltered.splice(4);
        }

        $.each(organizationArrFiltered, function (index, org) {
            let orgText = org.replaceAll("OU=", "").replaceAll("\\", "");

            switch (index) {
                case 0:  //First row
                    organizationText = orgText + ndGetSpaces(2) + arrowDown + "<br />";
                    break;
                case organizationArrFiltered.length - 1:  //Last row
                    organizationText += ndGetSpaces(index * 4) + arrowRight + ndGetSpaces(2) + orgText;
                    break;
                default:
                    organizationText += ndGetSpaces(index * 4) + arrowRight + ndGetSpaces(2) + orgText + ndGetSpaces(2) + arrowDown + "<br />";
                    break;
            }
        });


        if (ndUser.organizationPath.includes("TOP|454014|Egedal")) {
            organizationText = ndUserAzure.division + ndGetSpaces(2) + arrowDown + "<br />";
            organizationText += ndGetSpaces(counter * 4) + arrowRight + ndGetSpaces(2) + ndUser.departmentName;
        }

        ndUserAzure.organizationText = organizationText;
    }

    /* Customer Specific Parsing */
    const ndCustomerSpecific = parseCustomerSpecificAzure(ndUserAzure, ndUser, azureUser);
    Object.assign(ndUserAzure, ndCustomerSpecific);

    console.info("(parseDataFromAzure) ndUserAzure", ndUserAzure);
    console.debug("(parseDataFromAzure) Out");

    return ndUserAzure;
}


/** @function 
 * @name parseDataFromAzure
 * @param {object} ndUserAzure - ndUserAzure object
 * @param {object} ndUser - ndUser object
 * @param {object} azureUser - Microsoft user object from Azure
 * @return {object} - ndUserAzure
 * @description Customer Specific Parsing Azure AD
 * @since 1.0.0.0
*/
function parseCustomerSpecificAzure(ndUserAzure, ndUser, azureUser) {
    console.debug("(parseCustomerSpecificAzure) In");

    /* IT-Forsynigen */
    if (ndUser.organizationPath.includes("|454014|Furesø") ||
        ndUser.organizationPath.includes("|454014|Fredensborg")) {
        ndUserAzure.officeLocation = azureUser?.Department || "";
        ndUserAzure.administrationName = azureUser?.OfficeLocation || "";
    }

    if (custObj.customerKey === "4054040") {
        ndUserAzure.administrationName = azureUser?.OnPremisesExtensionAttributes.ExtensionAttribute1;
    }

    console.info("(parseCustomerSpecificAzure) ndUserAzure", ndUserAzure);
    console.debug("(parseCustomerSpecificAzure) Out");
    return ndUserAzure;
}


/** @function 
 * @name filterOrganization
 * @param {string} orgName - Full orgname from CN string
 * @return {boolean}
 * @description Filter organization from Azure AD
 * @since 1.0.0.0
*/
function filterOrganization(orgName) {
    var conditions = [];

    switch (custObj.customerKey) {
        case "458631":  //ABB
            conditions = ["CN=", "DC=dabbolig", "DC=dk"];
            break;
        case "474896":  //Apcoa
            conditions = ["CN=", "OU=Users", "DC=epd", "DC=intern"];
            break;
        case "10117738":  //DAB
            conditions = ["CN=", "OU=Users", "OU=Gribskov", "DC=gribskov", "DC=local"];
            break;
        case "474898":  //Gribskov
            conditions = ["CN=", "OU=Users", "OU=Gribskov", "DC=gribskov", "DC=local"];
            break;
        case "4517111":  //HelsinFor
            conditions = ["CN=", "OU=Users", "OU=Gribskov", "OU=.Forsyning Helsingoer", "DC=int", "DC=fh", "DC=dk"];
            break;
        case "454265":  //Morsø Kommune
            conditions = ["CN=", "OU=Users", "OU=Morsø Kommune", "DC=mk", "DC=local"];
            break;
        case "4517222":  //Munck Gruppen
            conditions = ["CN=", "OU=Users", "DC=munck", "DC=net"];
            break;
        case "4054040":  //NetDesign
            conditions = ["CN=", "OU=Users"];
            break;
        case "455160":  //Novafos
            conditions = ["CN=", "OU=Users", "DC=nv", "DC=local"];
            break;
        case "454056":  //Odense
            conditions = ["CN=", "OU=Users", "OU=Odense", "DC=OdkNet", "DC=dk"];
            break;
        case "2647119":  //Region H
            conditions = ["CN=", "OU=Users"]
            break;
        case "454335":  //Scanvaegt
            conditions = ["CN=", "OU=Users", "DC=ad", "DC=lan"]
            break;
        case "454014":  //IT-Forsyningen
            conditions = [
                "OU=Ballerup Kommune", "DC=balk",
                "OU=Fredensborg", "DC=alpha", "DC=local",
                "OU=Direktionen", "OU=Furesø Kommune", "DC=FURESOE", "DC=KOMMUNE",
                "OU=Brugere", "DC=egedal", "DC=egekom", "DC=org",
                "CN=", "OU=Users", "DC=intern", "DC=itfors", "DC=dk"
            ]
            break;
        case "12820":  //PFA
            conditions = ["CN=", "OU=User Accounts", "OU=PFA", "DC=prod", "DC=pfaintern", "DC=dk"]
            //OU = PROD Users, OU = Internal User
            break;
        case "1018811":  //Vejdirek
            conditions = ["CN=", "OU=Users", "DC=vdnet", "DC=dk"]
            break;
    }

    let bolValue = !conditions.some(element => orgName.includes(element))

    return bolValue;
}


/** @function 
 * @name searchWordFromCustomerKey
 * @param {string} searchValue - Value to search for
 * @return {object} - ndSearchObj
 * @description Searchword from CustomerKey
 * @since 1.0.0.0
*/
function searchWordFromCustomerKey(searchValue) {
    switch (custObj.customerKey) {
        case "2647119":  //Region H
            console.debug("(searchWordFromCustomerKey) In");

            const searchColumnSetId = searchInTxtToNum[$("#searchInEmpDD").val()];
            const ndSearchObj = { searchColumnSetId: searchColumnSetId };
            const wildCard = $('#settingWildcardDD').val();
            console.info("searchColumnSetId", searchColumnSetId);

            switch (searchColumnSetId) {
                case 3:  //Search whole sentence
                case 9:  //Search whole sentence
                    ndSearchObj.searchValue = [searchValue];
                    break;
                default:
                    /* Wildcard search for CBAS */
                    ndSearchObj.searchValue = (wildCard === "1") ? searchValue.replaceAll(' ', '% ') + "%" : searchValue;
                    ndSearchObj.searchValue = ndSearchObj.searchValue.split(' ')
                    break;
            }

            switch (searchValue[0]) {
                case "-": //Search whole sentence
                    ndSearchObj.searchValue = [searchValue.slice(1)];
                    break;
                case "+": //Search Phrase
                    ndSearchObj.searchValue = [searchValue.slice(1)];
                    ndSearchObj.searchColumnSetId = 3;
            }

            console.info("(searchWordFromCustomerKey) ndSearchObj", ndSearchObj);
            console.debug("(searchWordFromCustomerKey) In");

            return ndSearchObj;
    }
}


/** @function 
 * @name ndParseCallState
 * @param {object} call - Puzell cal object
 * @param {boolean} [pageReload=false] - Puzell cal object
 * @return {object} - ndSearchObj
 * @description Parse Call State
 * @since 1.0.0.0
*/
async function ndParseCallState(call, pageReload = false) {
    console.debug("(ndParseCallState) In");
    console.info("(ndParseCallState) call", call);

    if (typeof call === "undefined") {
        ndSetButtonsDefault();
        ndSetTitle(false);
        ndEnableSearchBox(-9);
        return;
    }

    callObj.sessionId = call.sessionId, callObj.requestId = call.requestId;
    callObj.queueKey = call.queueKey, callObj.caller = call.caller;
    callObj.isConnected = call.isConnected, callObj.isOutboundConnected = call.isOutboundConnected;
    callObj.callProgress = "", callObj.transferState = "";

    callObj.callerTransfered = call.vars?.system_caller_transfered || "FALSE";
    callObj.callerTransferedTo = call.vars?.Omstillet_til || "";
    if (callObj.callerTransferedTo === "") {
        callObj.callerTransferedTo = call.vars?.tdcCatCalledNumber || "";
    }

    callObj.tdcCustGroupIds = call.vars?.tdcCustGroupIds || "0";
    callObj.tdcOrgUnit = call.vars?.tdcOrgUnit || "";
    callObj.cpr_number = call.vars?.cpr_number || "";


    let variablesArr = new Map();

    if (call.hasOwnProperty('vars')) {
        console.info("(ndParseCallState) vars", call.vars);
        $.each(call.vars, function (key, value) {
            variablesArr.set(key, value);
        });
    }
    console.info("(ndParseCallState) variablesArr", variablesArr);

    if (!callObj.queueKey.toUpperCase().includes("PARKE")) {
        callObj.lastCalledQueue = variablesArr.get("system_queue_id");
        puzzelUpdateVarsIncoming(callObj.lastCalledQueue);
    }


    let settingClear = $("#settingClearSearchResultDD").val();

    if (variablesArr.has("system_call_progress")) {
        callObj.callProgress = variablesArr.get("system_call_progress");
        console.info("(ndParseCallState) callObj.callProgress", callObj.callProgress);
        let inputBoxName = getInputBoxFromActiveTab();

        switch (callObj.callProgress) {
            case "ALERTING":
                if (firstIncomingG) {
                    ndFocusSearchBox(-1);
                    ndEnableSearchBox(-1);

                    $(window).trigger('focus');
                    firstIncomingG = false;
                }
                break;
            case "SETUP":
                $('#callOut').prop('disabled', true);
                ndFocusSearchBox(1, inputBoxName);
                ndFocusSearchBox(3, inputBoxName);
                break;
            case "CONNECTED":
                $('#callHangup').prop('disabled', false);

                ndRequestQueues(false, true);
                console.info("(ndParseCallState) callObj", callObj);

                if (call.isOutbound === false) {
                    ndActivateWidget("CallAnswer");
                    ndEnableSearchBox(-9);

                    if (callObj.tdcManuel) {
                        ndFocusSearchBox(0, "phoneInput");
                    }
                    else {
                        console.info("(ndParseCallState) Focus Search");
                        ndFocusSearchBox(2, inputBoxName);
                        ndFocusSearchBox(4, inputBoxName);
                    }

                    if (call.isConnected) {
                        console.info("(ndParseCallState) isConnected");
                        $('#transferPhoneCold').prop('disabled', false);
                        $('#transferPhoneWarm').prop('disabled', false);
                    }
                }
                else {
                    if (call.isOutboundConnected) {
                        console.info("(ndParseCallState) isOutboundConnected");
                        $('#transferPhoneCold').prop('disabled', false);
                        $('#transferPhoneWarm').prop('disabled', false);
                    }
                }
                break;
            case "ABORTED":
                ndSetButtonsDefault();
                ndSetTitle(false);
                ndEnableSearchBox(-9);

                if ($("#settingCallEndClearCallObjDD").val() === "1") {
                    clearCallObject()
                }
                if (settingClear === "HANGUP" || settingClear === "BOTH") {
                    clearSearchAndDetail("HANGUP");
                }

                transferTypeMark();
                break;
            case "HANGUP":
                console.debug("(ndParseCallState) HANGUP");
                ndSetButtonsDefault();
                ndSetTitle(false);
                transferTypeMark();
                ndActivateWidget("CallEnd");
                ndEnableSearchBox(-9);

                if ($("#settingCallEndClearCallObjDD").val() === "1") {
                    clearCallObject()
                }
                if (settingClear === "HANGUP" || settingClear === "BOTH") {
                    clearSearchAndDetail("HANGUP");
                }

                if ($("#settingMsTeamsPuzzelBusyDD").val() === "DND") {
                    console.debug("(ndParseCallState) setMyTeamsPresence");
                    setMyTeamsPresence("HANGUP");
                }
                break;
            case "BUSY":
                ndEnableSearchBox(-9);
                break;
            default:
                ndEnableSearchBox(-9);
                break;
        }
    }

    if (variablesArr.has("leg.Transferee.state")) {
        callObj.transferState = variablesArr.get("leg.Transferee.state");
        console.info("(ndParseCallState) callObj.transferState", callObj.transferState);
        switch (callObj.transferState) {
            case "ALERTING":
                console.info("(ndParseCallState) Consulation Alerting");
                $('#transferPhoneCancel').prop('disabled', false);
                $('#transferPhoneWarm2').prop('disabled', false);

                $('#transferPhoneCold').prop('hidden', true);
                $('#transferPhoneWarm').prop('hidden', true);
                $('#transferPhoneCancel').prop('hidden', false);
                $('#transferPhoneWarm2').prop('hidden', false);
                break;
            case "CONNECTED":
                console.info("(ndParseCallState) Consulation Connected");
                $('#transferPhoneCancel').prop('disabled', false);
                $('#transferPhoneWarm2').prop('disabled', false);

                $('#transferPhoneCold').prop('hidden', true);
                $('#transferPhoneWarm').prop('hidden', true);
                $('#transferPhoneCancel').prop('hidden', false);
                $('#transferPhoneWarm2').prop('hidden', false);
                break;
            default:
                $('#transferPhoneCancel').prop('disabled', true);
                $('#transferPhoneWarm2').prop('disabled', true);

                $('#transferPhoneCold').prop('hidden', false);
                $('#transferPhoneWarm').prop('hidden', false);
                $('#transferPhoneCancel').prop('hidden', true);
                $('#transferPhoneWarm2').prop('hidden', true);
        }
    }

    if (variablesArr.has("is_consult_to_queue")) {
        callObj.isConsultToQueue = variablesArr.get("is_consult_to_queue");
        console.info("(ndParseCallState) callObj.isConsultToQueue", callObj.isConsultToQueue);

        if (callObj.isConsultToQueue === "true") {
            console.info("(ndParseCallState) isConsultToQueue: true");
            $('#transferPhoneCold').prop('hidden', true);
            $('#transferPhoneWarm').prop('hidden', true);

            $('#transferPhoneCancel').prop('hidden', false);
            $('#transferPhoneWarm2').prop('hidden', false);
            $('#transferPhoneCancel').prop('disabled', false);
            $('#transferPhoneWarm2').prop('disabled', false);
        }
    }
}