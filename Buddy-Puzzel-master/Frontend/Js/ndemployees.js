/**
 * @module ndEmployees
 */

/* Global Variables */
versionObj.ndemployeesny = 38;

var EmployeesDT;
var loadPresenceIntervalG = 0, loadDetailsIntervalG = 0, showDetailsTimeoutG = 0;

/* Document Ready */
$(function () {
    $(document).on('preInit.dt', function (e, settings) {
        //TODO
    });

    $(document).on('init.dt.dt', function (e, settings) {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    });
});


/** @function 
 * @name ndRequestEmployees
 * @async
 * @param {string} [searchValue=""] - Text to search for
 * @param {string} [filterColumn=""] - Name of filter column
 * @param {boolean} [bSame=false] - Search in same contxt
 * @description Search in Puzzel catalog from search text
 * @since 1.0.0.0
*/
const ndRequestEmployees = async (searchValue = "", filterColumn = "", bSame = false) => {
    console.debug("(ndRequestEmployees) In");
    const requestStart = moment();
    console.info("(ndRequestEmployees) requestStart", requestStart);

    let ndUserArr = [];

    if (searchValue === "") {
        searchValue = $("#searchInputEmp").val();
    }

    if (filterColumn === "") {
        filterColumn = $("#searchInEmpDD").val();
    }

    if (bSame) {
        $("#searchInputEmp").val(searchValue + " ");
        ndFocusSearchBox();
    }
    searchValue = searchValue.replaceAll('*', '%').replaceAll(',', ' ');

    $("#searchingLblEmp").html("S&oslash;ger ..");

    let spaceFilter = $("#settingSearchSpaceDD").val();
    if (spaceFilter !== "DISABLED" && !bSame && searchValue.startsWith(' ')) {
        filterColumn = spaceFilter;
        searchValue = searchValue.slice(1)
    }

    let numberValue = Number.parseInt(searchValue);
    let isNumber = !Number.isNaN(numberValue);

    if (custObj.customerKey === "45524905" && searchValue.length === 5 && isNumber) {
        searchValue = prefixLocalNumber(numberValue);
        $("#searchInputEmp").val(searchValue);
        //searchValue = "%" + searchValue;
    }

    if (!bSame && $("#settingFoneticDD").val() === "1" && !isNumber) {
        searchValue = "#" + searchValue;
    }

    console.info("(ndRequestEmployees) searchValue", searchValue);

    switch (custObj.customerKey) {
        case "2647119":  //Region H
            const phoneticFlag = $("#settingPhoneticDD").val();
            const maximumRows = $("#searchCountDDEmp").val();

            const organizationIds = $("#searchOrgDD").val();
            let organizationIdsArr = [0];

            if (organizationIds !== "") {
                organizationIdsArr = [];
                $.each(organizationIds.split(','), function (index, orgId) {
                    organizationIdsArr.push(parseInt(orgId));
                });
            }

            const ndSearchObj = searchWordFromCustomerKey(searchValue);

            let bodyObj =
            {
                searchItems: ndSearchObj.searchValue,
                searchColumnSetId: parseInt(ndSearchObj.searchColumnSetId),
                organizationIds: organizationIdsArr,
                phoneticFlag: parseInt(phoneticFlag),
                maximumRows: parseInt(maximumRows)
            };

            console.info("(ndRequestEmployees) bodyObj", bodyObj);

            EmployeesArr = await cbasApiCall("POST", JSON.stringify(bodyObj));
            break;
        default:
            let apiUrl = `${puzzelUrl}${custObj.customerKey}/users/${agentObj.userId}/catalog/contacts/search`;
            let body = { searchString: searchValue };

            let organizationalUnit = $("#searchOrgDD").val() || "";

            if (custObj.orgPath) {
                body.organizationalUnit = organizationalUnit.replaceAll("_", "|") + "%";
            }
            console.info("(ndRequestEmployees) body", body);
            EmployeesArr = await puzzelApiCall(apiUrl, "POST", JSON.stringify(body));
            break;
    }

    console.info("(ndRequestEmployees) EmployeesArr", EmployeesArr);
    if (EmployeesArr == null) {
        console.error("(ndRequestEmployees) Error In Api Call");
        clearDetailView();
        $("#searchingLblEmp").html('Fejl i søgning !!');
        clearEmployeeGrid();
        return;
    }

    if (EmployeesArr.length === 0) {
        console.info("(ndRequestEmployees) Empty Array");
        clearDetailView();
        $("#searchingLblEmp").html('');
        clearEmployeeGrid();
        return;
    }

    /* Parse data */
    let settingNoNumber = $("#settingSearchNoNumberDD").val();
    let settingFnrOnly = $("#employeesShowFnrOnly").prop("checked");
    $.each(EmployeesArr, function (index, employee) {
        switch (custObj.customerKey) {
            case "2647119":  //Region H
                ndUserArr.push(parseCbasUserResponse(employee));
                break;
            default:
                let include = true;
                let ndUserTmp = parsePuzzelUserResponse(employee);

                if (ndUserTmp.phone === "" && ndUserTmp.mobile === "") {
                    include = (settingNoNumber === "1")
                }

                if (include && settingFnrOnly) {
                    include = ndUserTmp.isDepartment;
                }

                if (include) {
                    ndUserArr.push(ndUserTmp);
                }
                break;
        }
    });

    console.info("(ndRequestEmployees) ndUserArr", ndUserArr);

    /* Filter ndUser Array */
    if (filterColumn !== "all" && custObj.customerKey !== "2647119") {
        if (filterColumn === "searchWords" && custObj.customerKey == "45524905") {
            ndUserArr = filterSearchWord(ndUserArr, searchValue);
        }
        else {
            ndUserArr = filterResult(ndUserArr, searchValue, filterColumn, bSame);
        }
    }

    /* Empty Array */
    if (ndUserArr.length === 0) {
        console.info("(ndRequestEmployees) Empty Array After Filter");
        clearDetailView();
        $("#searchingLblEmp").html('');
        clearEmployeeGrid();
        return;
    }
    console.info("ndUserArr", ndUserArr);

    /* Limit number of results based on value in dropdown */
    var searchResultAllNum = ndUserArr.length;

    if (
        custObj.customerKey !== "4054040" &&
        custObj.customerKey !== "2647119" &&
        ndUserArr.length > $("#searchCountDDEmp").val()) {
        ndUserArr = ndUserArr.slice(0, $("#searchCountDDEmp").val());
    }

    var searchResultShownNum = ndUserArr.length;

    if (!$.fn.DataTable.isDataTable('#tableEmpId')) {
        console.debug("(ndRequestEmployees) DataTable Not Initialized");
        ndDataTableInit("#tableEmpId");
        setTimeout(() => {
            EmployeesDT.rows.add(ndUserArr).draw();
            EmployeesDT.cell(':eq(0)', colIndexObj.name).focus();
        }, 200);
    }
    else {
        EmployeesDT.clear();
        EmployeesDT.rows.add(ndUserArr).draw(false);
        EmployeesDT.cell(':eq(0)', colIndexObj.name).focus();
    }

    if (presenceObj.enabled) {
        clearInterval(loadPresenceIntervalG);
        setTimeout(loadPresence, 400);
        loadPresenceIntervalG = setInterval(loadPresence, presenceObj.timer * 1000);
    }

    $("#searchingLblEmp").html(`${searchResultShownNum}&nbsp;/&nbsp;${searchResultAllNum}&nbsp;&nbsp;(${searchInDic[filterColumn]})`);

    const requestEnd = moment();
    const requestDuration = requestEnd.diff(requestStart);
    const requestDurationDisplay = moment(requestDuration).format('ss:SSS');
    console.info("(ndRequestEmployees) requestDuration", requestDurationDisplay);
    $("#searchingLblEmp").attr("title", requestDurationDisplay);

    console.debug("(ndRequestEmployees) Out");
}


/** @function
 * @name ndDataTableInit
 * @async
 * @param {string} tableName - Name of table
 * @param {object[]} [data=[]] - Data to load into table
 * @description Init datatable for Employee or Favorites
*/
const ndDataTableInit = async (tableName, data = []) => {
    console.debug("(ndDataTableInit) In");
    console.info("(ndDataTableInit) tableName", tableName);

    if ($.fn.DataTable.isDataTable(tableName)) {
        console.debug("(ndDataTableInit) Allready Initialized");
        return;
    }

    let dtColumns = [];
    let dtSorting = [];
    let shownRowsSetting = $("#settingShownRowsDD").val() || "";
    console.info("(ndDataTableInit) shownRowsSetting", shownRowsSetting);

    if (shownRowsSetting === "") {
        console.warn("(ndDataTableInit) shownRowsSetting blank");
        shownRowsSetting = 6;
        $("#settingShownRowsDD").val(6);
    }

    let scrollY = 179 + (shownRowsSetting - 6) * 30 + "px";

    console.debug("ndDataTableInit scrollY", scrollY);

    switch (tableName) {
        case "#tableEmpId":
            dtColumns = ndColoumnsEmp[custObj.customerKey];
            dtColumns = (typeof dtColumns === "undefined") ? ndColoumnsEmp["DEFAULT"] : dtColumns
            dtSorting = ndDataTableSorting(true);
            EmployeesDT = getDataTable(tableName, dtColumns, data, dtSorting, scrollY);
            break;
        case "#tableFavId":
            dtColumns = ndColoumnsEmp[custObj.customerKey];
            dtColumns = (typeof dtColumns === "undefined") ? ndColoumnsEmp["DEFAULT"] : dtColumns
            dtSorting = ndDataTableSorting(false);
            FavoritesDT = getDataTable(tableName, dtColumns, data, dtSorting, "72vh");
            break;
    }

    console.info("ndDataTableInit dtColumns", dtColumns);
    console.debug("ndDataTableInit Out");
}


/** @function
 * @name getDataTable
 * @param {string} tableName - Name of table
 * @param {string[]} dtColumns - Columns to load into table
 * @param {object[]} [data=[]] - Data to load into table
 * @param {string} dtSorting - Set sorting for table
 * @param {string} scrollY - Height of datatable grid
 * @returns {object} - Datatable
 * @description Get DataTable
*/
function getDataTable(tableName, dtColumns, data, dtSorting, scrollY) {
    let languageFile = (tableName === "#tableEmpId") ? "datatables_emp" : "datatables_fav";
    let datatable =
        $(tableName).DataTable({
            dom: 't',
            data: data,
            language: {
                "url": `Res/${languageFile}.json`
            },
            "initComplete": function (settings, json) {
                //TODO
            },
            responsive: false,
            "bSort": true,
            paging: false,
            autoWidth: false,
            scrollX: true,
            scrollY: scrollY,
            scrollCollapse: false,
            fixedColumns: false,
            order: dtSorting,
            orderClasses: false,
            keys: {
                keys: [13, 38, 40],  //Enter, Up, Down
                blurable: false
            },
            columns: dtColumns,
            'createdRow': function (row, data, dataIndex) {
                /*
                if (data.rowColor !== "") {
                    //$(row).attr("style", "background-color: " + data.rowColor + ";");
                }
                */

                if (data.isDepartment) {
                    $(row).addClass('ndColorBlue');
                    //$(row).attr("style", "color: steelblue;");
                }
            },
            columnDefs: [
                {
                    targets: [0],  //Agg status
                    className: 'dt-center',
                    orderable: false,
                    render: function (data, type) {
                        if (type === 'display') {
                            const returnObj = aggStatusDic[data];
                            return `<span title="${returnObj.title}" class="fas fa-circle ${returnObj.color}" />`;
                        }
                        return data;
                    }
                },
                {
                    targets: [1],  //Phone status
                    className: 'dt-center',
                    orderable: false,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            const returnObj = getPhonePresenceText(row);
                            return `<span title="${returnObj.title}" class="fas fa-circle ${returnObj.color}" />`;
                        }

                        return data;
                    }
                },
                {
                    targets: [2],  //Calendar status
                    className: 'dt-center',
                    orderable: false,
                    render: function (data, type) {
                        if (type === 'display') {
                            if (data === true) {
                                return '<span title="Optaget" class="fas fa-circle ndColorRed" />';
                            }
                            else {
                                return '<span title="Ledig" class="fas fa-circle ndColorGreen" />';
                            }
                        }

                        return data;
                    }
                },
                {
                    targets: [3],  //Calendar status
                    className: 'dt-center',
                    orderable: false,
                    render: function (data, type) {
                        if (type === 'display' && data !== "") {
                            const returnObj = teamsAvailability[data.availability];
                            return `<span title="${returnObj?.title || "Ukendt"}" class="fas fa-circle ${returnObj?.color || "ndColorGray"}" />`;
                        }

                        return data;
                    }
                },
                {
                    targets: [4],  //Color
                    className: 'dt-center',
                    orderable: false,
                    render: function (data, type) {
                        if (type === 'display' && typeof data !== "undefined" && data !== "") {
                            let colorObj = rowColorFromBit[data];
                            if (typeof colorObj !== "undefined" && colorObj.colorName !== "") {
                                return `
                                    <span title="${colorObj.depName}" class="fas fa-square-full" style="color: ${colorObj.colorName};" />
                                `;
                            }
                            return "";
                        }
                        return "";

                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (typeof rowData.rowColor !== "undefined" && rowData.rowColor !== "") {
                            console.log("RowColor 2");
                            $(td).html(`<span class="fas fa-square-full" style="color: ${rowData.rowColor};" />`);
                            $(td).attr("title", rowData.rowColor);
                        }
                    }
                }, {
                    targets: [5],  //Name
                    render: function (data, type) {
                        if (type !== 'sort') {
                            if (data.startsWith("!")) {
                                return data.slice(1);
                            }
                        }
                        return data;
                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (rowData.isDepartment) {
                            //$(td).addClass('ndColorBlue');
                        }
                        $(td).attr("title", cellData);
                    }
                },
                {
                    targets: [6],  //Title
                    render: function (data, type) {
                        if (type !== 'sort') {
                            if (data.startsWith("!")) {
                                return data.slice(1);
                            }
                        }
                        return data;
                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (rowData.isDepartment) {
                            //$(td).addClass('ndColorBlue');
                        }
                        $(td).attr("title", cellData);
                    }
                },
                {
                    targets: [7],  //Department
                    render: function (data, type) {
                        if (type !== 'sort') {
                            if (data.startsWith("!")) {
                                return data.slice(1);
                            }
                        }
                        return data;
                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (rowData.rowColor !== "") {
                            //$(td).attr("style", "color: " + rowData.rowColor + ";");
                            //$(td).addClass('ndColorBlue');
                        }
                        $(td).attr("title", cellData);
                    }
                },
                {
                    targets: [8],  //StreetAddress
                    render: function (data, type) {
                        if (type === 'display') {
                            if (data.includes(",")) {
                                return data.split(',')[0];
                            }
                        }
                        return data;
                    }
                },
                {
                    "targets": [9],  //Phone
                    orderable: false,
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (rowData.noTransfer) {
                            $(td).addClass('ndNoTransfer');
                        }

                        if (rowData.secretPhone) {
                            $(td).addClass('ndSecret');
                        }
                    }
                },
                {
                    "targets": [10],  //Mobile
                    orderable: false,
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (rowData.noTransfer) {
                            $(td).addClass('ndNoTransfer');
                        }

                        if (rowData.secretMobile) {
                            $(td).addClass('ndSecret');
                        }
                    }
                },
                {
                    targets: [11],  //Favorite
                    render: function (data, type) {
                        if (type === 'display') {
                            if (data === true) {
                                return '<span class="fa-star fas"></span>';
                            }
                            else {
                                return '<span class="fa-star far"></span>';
                            }
                        }

                        return data;
                    }
                }
            ]
        });
    return datatable;
}



/** @function 
 * @name clearDetailView
 * @description Clear Detail View
 * @since 1.0.0.0
*/
function clearDetailView() {
    $('#dFullName').html("&nbsp;");
    $('#dFullName').attr("title", "");
    $('#dFullName').attr("tdcId", "");
    $('#detailOrgPath').html("");

    $('#dPhone').html("&nbsp;");
    $('#dPhone').removeClass("ndSecret");
    $('#dMobile').html("&nbsp;");
    $('#dMobile').removeClass("ndSecret");
    $('#dEmail').html("&nbsp;");
    $('#dInitials').html("&nbsp;");
    $('#dTitle').html("&nbsp;");
    $('#dAddress').html("&nbsp;");
    $('#dPostalCity').html("&nbsp;");

    $('#dAdministraionName').html("&nbsp;");
    $('#dDepartmentName').html("&nbsp;");
    $('#dDivision').html("&nbsp;");
    $('#dLocation').html("&nbsp;");

    $('#dManagerName').html("&nbsp;");
    $('#dManagerEmail').html("&nbsp;");
    $('#dOrganization').html("&nbsp;");

    $('#dRoomNumber').html("&nbsp;");
    $('#dIpPhone').html("&nbsp;");

    $('#dPhoneHours').html("&nbsp;");
    $('#dOpeningHours').html("&nbsp;");
    $("#phoneHoursRow").hide();
    $("#phoneHoursRowLine").hide();
    $("#organizationRow").show();

    $('#dSearchWord').html("&nbsp;");
    $('#dCustGroupName').html("&nbsp;");
    $('#dInfo').html("&nbsp;");

    $("#userPhoto").attr("src", "Res/nophoto.png");

    $("#dPhoneSection").hide();
    $("#dMobileSection").hide();
    $("#dEmailSection").hide();
    $("#btnPark_ID").addClass("ndHidden");
    $("#dFullName").attr("lastParkedNumber", "");

    $("#cfaNumber").html("");
    $("#cfaNumberTxt").val("")
    $("#paStatus").html("");
    $("#dndStatus").html("");
    $("#teamsStatus").html("");
    $("#oofStatus").html("");

    $("#dDetailStatus").removeClass("ndColorGreen").removeClass("ndColorYellow").removeClass("ndColorRed");
    $("#dDetailStatus").addClass("ndColorGray");
    $("#dDetailStatus").attr("title", "Ukendt");

    /* Tooltips Clear */
    ndTooltip("teamsStatus");
    ndTooltip("oofStatus");
    ndTooltip("cfaNumber");
    $("[data-bs-custom-class='custom-tooltip-calendar']").tooltip('dispose');

    /* Calendar */
    resetCalendar();
    let settingRightSection = ($("#settingLayoutRightSectionDD").val() === "CALENDAR");
    calendarShow(settingRightSection);
}


/** @function 
 * @name ndShowDetails
 * @async
 * @param {object} ndUser - ndUser object
 * @description Show details for user
 * @since 1.0.0.0
*/
const ndShowDetails = async (ndUser) => {
    console.debug("(ndShowDetails) In");
    console.debug("(ndShowDetails) ndUser", ndUser);

    let tdcIdAttr = $("#dFullName").attr("tdcId") || "";

    /* Already Shown Exit */
    if (tdcIdAttr === ndUser.id.toString()) {
        console.debug("(ndShowDetails) Already Shown");
        return;
    }

    clearDetailView();

    ndShowCommonDetails(ndUser);


    /* Info [Noter] */
    $("#dInfo").html(ndUser.info);

    /* Group Name (RegH) */
    $('#dCustGroupName').html(custGroupIdToName[ndUser.customGroup]);

    /* Søgeord */
    let searchValue = $("#searchInputEmp").val().trim().replaceAll("+", "").replaceAll("-", "");
    let searchWords = ndUser.searchWords;
    console.info("(ndShowDetails) searchWords", searchWords);

    switch (custObj.customerKey) {
        case "2647119":  //RegH
            let searchWordsArr = [];
            $.each(searchWords, function (index, searchWord) {
                if (searchValue !== "") {
                    searchWord = searchWord.replace(new RegExp(searchValue, 'gi'), '<mark>$&</mark>');
                    searchWordsArr.push(searchWord + "<br>");
                }
            });
            searchWords = searchWordsArr;
            console.info("(ndShowDetails) searchWordsArr", searchWordsArr);
            break;
        default:
            //searchWords = tdcFormatHighlightText(searchWords, searchValue);
            break;
    }
    $('#dSearchWord').html(searchWords);


    /* Region Syd - OrgText from Services */
    if (custObj.customerKey === "45524905") {
        $('#dOrganization').html(ndUser.orgTree);
    }

    /* Calendar */
    if (ndUser.isCalenderBusy) {
        $("#dCalendarStatus").removeClass().addClass("far fa-calendar-times ndColorRed");
    }
    else {
        $("#dCalendarStatus").removeClass().addClass("fas fa-calendar ndColorGreen");
    }

    /* Get Scale Presence */
    calculatePresenceDetail(ndUser);

    /* File Uploaded Department */
    if (ndUser.isDepartment) {
        $("#organizationRow").hide();
        $("#phoneHoursRow").show();
        $("#phoneHoursRowLine").show();
        $("#userPhoto").attr("src", "Res/office.png");

        /* Administration Name (Forvaltning) */
        $('#dAdministraionName').html(ndUser.administrationName);

        /* Address */
        $('#dAddress').html(truncText(ndUser.streetAddress, 45, " .."));
        $('#dAddress').attr("title", ndUser.streetAddress);

        /* Room Number */
        $('#dRoomNumber').html(ndUser.roomNumber);

        /* Ip Phone */
        $('#dIpPhone').html(ndUser.ipPhone);

        /* Opening Hours */
        $('#dPhoneHours').html(ndUser.phoneHours.replace(/(\\n)/g, '<br>'));
        $('#dOpeningHours').html(ndUser.openingHours.replace(/(\\n)/g, '<br>'));

        /* Manager */
        $('#dManagerName').html(ndUser.managerName);
        if (ndUser.managerName !== "") {
            $("#dManagerName").attr("onclick", "ndRequestEmployees('" + ndUser.managerName + "', 'name', true)");
        }

        $('#dManagerEmail').html(ndUser.managerEmail);
        if (ndUser.managerEmail !== "") {
            $("#dManagerEmail").attr("onclick", `sendEmail('','${ndUser.managerEmail}');`);
        }

        return;
    }

    /* Puzzel Catalog */
    $("#phoneHoursRow").hide();
    $("#phoneHoursRowLine").hide();
    $("#organizationRow").show();

    /* Region H Image from Cbas */
    if (custObj.customerKey === "2647119") {
        if (ndUser.imageUrl !== "") {
            if (urlExists(ndUser.imageUrl)) {
                document.getElementById("userPhoto").setAttribute("src", ndUser.imageUrl);
            }
        }
        console.debug("(ndShowDetails) Out");
        return;
    }

    getCalendarPuzzelFromId();

    /* Get User data from Azure */
    if (custObj.azureAd && ndUser.email !== "") {
        console.debug("(ndShowDetails) Azure Data In");

        const ndUserAzure = await getUserFromAzure(ndUser);
        console.info("(ndShowDetails) Azure Data ndUserAzure", ndUserAzure);

        /* User Found */
        if (ndUserAzure.statusText === "OK") {
            /* Initials */
            if ($("#dInitials").text() === "") {
                $("#dInitials").html(ndUserAzure.initials);
            }
            $('#dAddress').html(truncText(ndUserAzure.fullAddress, 45, " .."));
            $('#dAddress').attr("title", ndUserAzure.fullAddress);
            $('#dOrganization').html(ndUserAzure.organizationText);

            /* Manager */
            let managerName = ndUserAzure.managerDisplayName;
            if (managerName !== "") {
                $('#dManagerName').html(managerName);
                $("#dManagerName").attr("onclick",
                    `ndRequestEmployees("${ndUserAzure.managerGivenName} ${ndUserAzure.managerSurname}", "name", true)`);
            }

            let managerEmail = ndUserAzure.managerEmail
            if (managerEmail !== "") {
                $('#dManagerEmail').html(managerEmail);
                $("#dManagerEmail").attr("onclick", `sendEmail('','${managerEmail}');`);
            }

            /* Administration Name [Forvaltning] */
            $('#dAdministraionName').html(ndUserAzure.administrationName);

            /* Division [Center] */
            $('#dDivision').html(ndUserAzure.division);

            /* Location [Placering] */
            $('#dLocation').html(ndUserAzure.officeLocation);

            /* Get Photo from Azure */
            getPhotoFromAzure(ndUser);

            console.debug("(ndShowDetails) Azure Data Out");
        }
    }

    console.debug("(ndShowDetails) Out");
}


/** @function 
 * @name ndShowCommonDetails
 * @param {object} ndUser - ndUser object
 * @description Show common details for user
 * @since 1.0.0.0
*/
function ndShowCommonDetails(ndUser) {
    console.debug("(ndShowCommonDetails) In");
    console.debug("(ndShowCommonDetails) ndUser", ndUser);

    /* Full name and id */
    $('#dFullName').html(ndUser.fullName.replace("!", ""));
    $('#dFullName').attr("title", ndUser.fullName);
    $('#dFullName').attr("tdcId", ndUser.id);

    /* OrgPath */
    $('#detailOrgPath').html(ndUser.organizationPath);

    /* Phone */
    if (ndUser.phone != "") {
        $('#dPhone').html(ndUser.phone);
        $('#dPhone').addClass(ndUser.secretPhone);
        $("#dPhoneSection").show();
    }
    else {
        $("#dPhoneSection").hide();
    }

    /* Mobile */
    if (ndUser.mobile != "") {
        $('#dMobile').html(ndUser.mobile);
        $('#dMobile').addClass(ndUser.secretMobile);
        $("#dMobileSection").show();
    } else {
        $("#dMobileSection").hide();
    }

    /* Park Call */
    let parkQueueVal = $("#settingParkDefaultQueue").val();
    if (parkQueueVal !== "0") {
        $("#btnPark_ID").removeClass("ndHidden");
        $("#dFullName").attr("lastParkedNumber", "");
    }

    /* Email */
    if (ndUser.email != "") {
        $('#dEmail').html(truncText(ndUser.email, 26, " .."));
        $('#dEmail').attr("title", ndUser.email);
        $("#dEmailSection").show();
    }
    else {
        $("#dEmailSection").hide();
    }

    /* Initials */
    $('#dInitials').html(ndUser.initials);

    /* Title */
    $('#dTitle').html(ndUser.title);
    if (ndUser.title !== "") {
        $("#dTitle").attr("onclick", "ndRequestEmployees('" + ndUser.title + "', 'title', true)");
    }

    /* Department */
    $("#dDepartmentName").html(ndUser.departmentName);
    if (ndUser.departmentName !== "") {
        $("#dDepartmentName").attr("onclick", "ndRequestEmployees('" + ndUser.departmentName + "', 'departmentName', true)");
    }

    /* Administration [Forvaltning] */
    $('#dAdministraionName').html(ndUser.administrationName);

    /* Division [Center] */
    $('#dDivision').html(ndUser.division);

    /* Location [Placering] */
    $('#dAdministraionName').html(ndUser.location);

    /* Address */
    $('#dAddress').html(truncText(ndUser.streetAddress, 45, " .."));
    $('#dAddress').attr("title", ndUser.streetAddress);

    /* Room Number */
    $('#dRoomNumber').html(ndUser.roomNumber);

    /* Ip Phone */
    $('#dIpPhone').html(ndUser.ipPhone);

    /* Opening Hours */
    $('#dAdministraionName').html(ndUser.phoneHours);
    console.debug("(ndShowCommonDetails) Out");
}


/** @function 
 * @name ndDataTableSorting
 * @param {boolean} [departmentSort=false] - Sort on department
 * @description Set datatable sorting
 * @since 1.0.0.0
*/
function ndDataTableSorting(departmentSort = false) {
    console.debug("(ndDataTableSorting) IN");
    let returnArr = [[colIndexObj.isFavorite, "desc"], [colIndexObj.name, "asc"]];

    let settingDepartmentSorting = $("#settingDepartmentDD").val();
    if (departmentSort && settingDepartmentSorting === "1") {
        returnArr = [[colIndexObj.isFavorite, "desc"], [colIndexObj.isDep, "desc"], [colIndexObj.name, "asc"]];
    }

    console.debug("(ndDataTableSorting) Out");
    return returnArr;
}


/** @function 
 * @name clearEmployeeGrid
 * @description Clear Employee datatable
 * @since 1.0.0.0
*/
function clearEmployeeGrid() {
    if (typeof EmployeesDT !== "undefined") {
        EmployeesDT.clear().draw();
        EmployeesDT.columns.adjust();
    }
}