/**
 * @module ndBindings
 */

/* Global Variables */
versionObj.ndbindingsny = 37;
const allowedKeysArr = '0123456789abcdefghijklmnopqrstuvxyzæøåABCDEFGHIJKLMNOPQRSTUVXYZÆØÅ*%\''.split('');
const alarmNumbers = ['112', '114'];
var searchTimeOut = 0;

/* Document Ready */
$(function () {
    allowedKeysArr.push('Space');
    allowedKeysArr.push('Backspace');
    allowedKeysArr.push(' ');


    /** @event 
     * @name searchInputQue KeyUp 
     * @listens searchInputQue#keyup
     * @fires ndRequestQueues
     * @description Search Input Key Up
     * @since 1.0.0.0
    */
    $("#searchInputQue").on("keyup", function () {
        ndRequestQueues(true);
    });


    /** @event
     * @name phoneInput KeyUp
     * @listens phoneInput#keyup
     * @description Key up on phone input (upper left box)
     * @since 1.0.0.0
    */
    $("#phoneInput").on('keyup', function (e) {
        console.debug("(phoneInput) keyup");
        console.info("(phoneInput) key", e.key);

        if (e.altKey && e.key === "h") {
            console.log("(phoneInput) Alt+H");
            if (callObj.isConnected) {
                callHangup();
            }
            return;
        }

        if (e.altKey && e.key === "i") {
            console.log("(phoneInput) Alt+I");
            agentSetAvailable();
            return;
        }

        if (!allowedKeysArr.includes(e.key) && e.key !== "Enter") {
            e.preventDefault();
            return;
        }

        let number = $(this).val();

        if (!alarmNumbers.includes(number) && number.length < 5) {
            $('#callOut').prop('disabled', true);
            return;
        }

        $('#callOut').prop('disabled', false);

        if (e.key === "Enter") {
            console.info("(phoneInput) ENTER");
            console.info("(phoneInput) callObj", callObj);

            if (alarmNumbers.includes(number) || number.length === 5) {
                number = prefixLocalNumber(number);
                $(this).val(number);
            }


            if (custObj.customerKey === "45524905" && number.length === 5) {
                number = prefixLocalNumber(number);
                $(this).val(number);
            }

            console.info("(phoneInput) number", number);

            /* Transfer To Consultee */
            if (callObj.transferState === "ALERTING" || callObj.transferState === "CONNECTED") {
                console.info("(phoneInput) TransferState Alerting_Connected");
                transferToConsultee();
                return;
            }

            if (callObj.isConnected) {
                /* Warm transfer */
                if ($('.thPhone').hasClass("ndColorLightRed")) {
                    callObj.tdcManuel = true;
                    consultWithPhone(number, "", "Manuel");
                }
                else {
                    /* Cold transfer */
                    transferToPhone(number, "", "Manuel");
                }
            }
            else {
                outboundCall(number);
            }
        }
    });


    /** @event
     * @name searchInEmpDD Changed
     * @listens searchInEmpDD#change
     * @fires performSearch
     * @description Search In value changed
     * @since 1.0.0.0
    */
    $("#searchInEmpDD").on('change', function () {
        console.debug("(searchInEmpDD) on change");
        performSearch();
    });


    /** @event
     * @name searchCountDDEmp Changed 
     * @listens searchCountDDEmp#change
     * @fires performSearch
     * @description Search Count value changed
     * @since 1.0.0.0
    */
    $("#searchCountDDEmp").on('change', function () {
        performSearch();
    });


    /** @event
     * @name searchOrgDD Changed
     * @listens searchOrgDD#change
     * @fires performSearch
     * @description Organization Unit value changed
     * @since 1.0.0.0
    */
    $("#searchOrgDD").on('change', function () {
        performSearch();
    });


    /** @event
     * @name showOnlineEmpDD Changed
     * @listens showOnlineEmpDD#change
     * @fires performSearch
     * @description Show Online  value changed
     * @since 1.0.0.0
    */
    $("#showOnlineEmpDD").on('change', function () {
        let selected = $('#showOnlineEmpDD').val();
        if (selected === "all") {
            EmployeesDT.columns().search('').draw();
        }
        else {
            EmployeesDT.column(0).search('0', true).draw();
        }
    });


    /** @event
     * @name phoneMessageTemplateDD Change 
     * @listens phoneMessageTemplateDD#change
     * @fires tdcLoadPhoneTemplateText
     * @description Load phone message modal
     * @since 1.0.0.0
    */
    $("#phoneMessageTemplateDD").on('change', function () {
        console.debug("(phoneMessageTemplateDD) on change");
        tdcLoadPhoneTemplateText();
        $("#phoneMessageBodyTxt").trigger("focus");
    });


    /** @event
     * @name searchInputFav KeyUp 
     * @listens searchInputFav#keyup
     * @description Favorites search box keyup
     * @since 1.0.0.0
    */
    $("#searchInputFav").on('keyup', (e) => {
        console.debug("(searchInputFavKeyUp) In");

        console.debug("(searchInputFavKeyUp) eKey", e.key);

        if (!allowedKeysArr.includes(e.key)) {
            e.preventDefault();
            return;
        }

        if (e.altKey && (e.key === "i" || e.key === "h")) {
            console.debug("(searchInputFavKeyUp) Idle or Hangup");
            return;
        }

        let searchValue = $("#searchInputFav").val() || "";
        FavoritesDT.search(searchValue).draw();

        console.debug("(searchInputFavKeyUp) Out");
    });


    /** @event
     * @name searchInputEmp KeyUp 
     * @listens searchInputEmp#keyup
     * @fires ndRequestEmployees
     * @description Employees search box keyup
     * @since 1.0.0.0
    */
    $("#searchInputEmp").on('keyup', (e) => {
        console.debug("(searchInputEmpKeyUp) In");

        console.info("(searchInputEmpKeyUp) eKey", e.key);
        console.info("(searchInputEmpKeyUp) Alt: ", e.altKey);

        if (!allowedKeysArr.includes(e.key)) {
            e.preventDefault();
            return;
        }

        if (e.altKey && (e.key === "i" || e.key === "h")) {
            console.debug("(searchInputEmpKeyUp) Idle or Hangup");
            return;
        }

        clearTimeout(searchTimeOut);
        let searchValue = $("#searchInputEmp").val() || "";

        if (custObj.customerKey === "WebEx") {
            EmployeesDT.search(searchValue).draw();
            return;
        }

        if (searchValue.length >= searchWordLength) {
            searchTimeOut = setTimeout(ndRequestEmployees, 400);
        }
        else {
            $("#searchingLblEmp").html(`> ${searchWordLength} tegn ..`);
            clearEmployeeGrid();
            clearDetailView();
        }

        console.debug("(searchInputEmpKeyUp) searchTimeOut", searchTimeOut);

        console.debug("(searchInputEmpKeyUp) Out");
    });


    /** @event
     * @name window KeyUp 
     * @listens window#keyup
     * @description Window keyup [global]
     * @since 1.0.0.0
    */
    $(window).on('keyup', (e) => {
        console.debug("(windowKeyUp) In");

        console.info("(windowKeyUp) Alt: ", e.altKey);
        console.info("(windowKeyUp) eKey", e.key);

        if (e.altKey) {
            let parkShortCut = $("#settingParkShortcut").val();
            switch (e.key) {
                case "h":
                    console.log("(windowKeyUp) Alt+H");
                    if (typeof callObj.sessionId !== 'undefined') {
                        callHangup();
                    }
                    return;
                case "i":
                    console.log("(windowKeyUp) Alt+I");
                    agentSetAvailable();
                    return;
                case parkShortCut:
                    console.log("(windowKeyUp) ParkShortCut", parkShortCut);
                    tdcParkCurrentCall();
                    break;
            }
        }

        let nextTab = "";

        switch (e.key) {
            case "ArrowRight":
                if (e.shiftKey) {
                    e.preventDefault();
                    nextTab = getPrevNextTab("RIGHT");
                    console.info("(windowKeyUp) nextTab", nextTab);
                    setActiveTab(nextTab);
                }
                break;
            case "ArrowLeft":
                if (e.shiftKey) {
                    e.preventDefault();
                    nextTab = getPrevNextTab("LEFT");
                    console.info("(windowKeyUp) nextTab", nextTab);
                    setActiveTab(nextTab);
                }
                break;
            case ".":
            case ",":
                let removeChar = $("#searchInputEmp").val().replace(".", "").replace(",", "");
                $("#searchInputEmp").val(removeChar);
                $('#phoneInput').trigger('focus');
                break;
            case "Escape":
                clearSearchAndDetail("ESCAPE");
                transferTypeMark();
                setTimeout(setWindowHeight, 500);
                break;
            case "Tab":
                e.preventDefault();
                ndEnableSearchBox(-9);
                ndFocusSearchBox();
                break;
            case "Control":
                e.preventDefault();
                let transferType = $('.thPhone').hasClass("ndColorLightRed") ? "cold" : "warm";
                transferTypeMark(transferType);
                break;
        }

        console.debug("(windowKeyUp) Out");
    });


    /** @event
     * @name tableQueId Click 
     * @listens tableQueId#click
     * @description Click on table queues cell [favorite column]
     * @since 1.0.0.0
    */
    $('#tableQueId').on('click', 'td', function () {
        console.debug("(tableQueId) onClick In")

        let cellIndex = QueuesDT.cell(this).index();
        console.info("(tableQueId) cellIndex", cellIndex)
        /* If not Fav column break out */
        if (cellIndex.column !== 8) {
            return;
        }

        let rowIndex = cellIndex.row;
        let rowData = QueuesDT.row(this).data();
        let cellData = QueuesDT.cell(this).data();
        console.info("(tableQueId) cellData", cellData)

        QueuesDT.cell(this).data(!cellData);

        QueuesDT.draw();
        QueuesDT.cell(rowIndex, 2).focus();

        favoriteChangedQue(rowData.id, !cellData);

        console.debug("(tableQueId) onClick Out")
    });


    /** @event
     * @name tableEmpId Click 
     * @listens tableEmpId#click
     * @async
     * @description Click on table employee cell
     * @since 1.0.0.0
    */
    $('#tableEmpId').on('click', 'td', async function () {
        console.debug("(tableEmpId) onClick In")

        let cellIndex = EmployeesDT.cell(this).index();
        let rowIndex = cellIndex.row;
        let rowData = EmployeesDT.row(this).data();
        let cellData = EmployeesDT.cell(this).data();

        console.info("(tableEmpId) onClick cellIndex", cellIndex)

        /* Show Puzzel */
        if (cellIndex.column === 0) {
            const url = `${puzzelUrl}${custObj.customerKey}/users/${agentObj.userId}/catalog/contacts/${rowData.id}`;
            console.info("(ShowRowData) rowData", rowData);
            const tdcUserRequest = await puzzelApiCall(url);
            console.info("(ShowRowData) tdcUserRequest", tdcUserRequest);

            let modalCommon = new bootstrap.Modal('#modalCommon');
            $("#modalCommon .modal-title").html("Puzzel Data: " + rowData.fullName);
            $("#modalCommonTextarea").text(JSON.stringify(tdcUserRequest));
            modalCommon.show();
            return;
        }

        /* Show ndUser data */
        if (cellIndex.column === 2) {
            let modalCommon = new bootstrap.Modal('#modalCommon');
            $("#modalCommon .modal-title").html("Parsed Data: " + rowData.fullName);
            $("#modalCommonTextarea").text(JSON.stringify(rowData));
            modalCommon.show();
            return;
        }

        /* Mark as favorite */
        if (cellIndex.column === colIndexObj.isFavorite) {
            EmployeesDT.cell(this).data(!cellData);

            //$('#tableEmpId').DataTable().order(ndDataTableSorting(true)).draw();
            EmployeesDT.draw();
            EmployeesDT.cell(rowIndex, colIndexObj.name).focus();

            favoriteChangedEmp(rowData);

            return;
        }

        console.info("(tableEmpId) myDomain", myDomain)
        if (myDomain === "srv-uccx1.collab.local") {
            clearTimeout(showDetailsTimeoutG);
            showDetailsTimeoutG = setTimeout(ndShowDetails, 250, rowData);
        }

        console.debug("(tableEmpId) onClick Out")
    });


    /** @event
     * @name tableFavId Click 
     * @listens tableFavId#click
     * @description Click on table favorites cell
     * @since 1.0.0.0
    */
    $('#tableFavId').on('click', 'td', function () {
        console.debug("(tableFavId) onClick In")

        let cellIndex = FavoritesDT.cell(this).index();
        /* If not Fav column break out */
        if (cellIndex.column !== colIndexObj.isFavorite) {
            return;
        }

        let rowData = FavoritesDT.row(this).data();
        rowData.favorite = false;

        FavoritesDT.row(this).remove().draw();
        FavoritesDT.cell(':eq(0)', colIndexObj.name).focus();

        favoriteChangedEmp(rowData);

        console.debug("(tableFavId) onClick Out")
    });


    /** @event
     * @name detailHeaderID Click 
     * @listens detailHeaderID#click
     * @async
     * @description Click on detail header "Detaljer"<br>Show raw response from Azure AD
     * @since 1.0.0.0
    */
    $('#detailHeaderID').on('click', async function () {
        var modalCommon = new bootstrap.Modal('#modalCommon');
        let dEmail = $("#dEmail").html() || "";
        let detailOrgPath = $("#detailOrgPath").html() || "";

        $("#modalCommon .modal-title").html("");
        $("#modalCommonTextarea").text("");

        if (dEmail === "" || dEmail === "&nbsp;") {
            $("#modalCommon .modal-title").html("Azure Data: &lt;ingen email&gt;");
            modalCommon.show();
            return;
        }

        $("#modalCommon .modal-title").html("Azure Data: " + dEmail);

        let _ndUserObj = { email: dEmail, organizationPath: detailOrgPath }
        const apiRequestNd = await getUserFromAzure(_ndUserObj, true);
        console.info("(detailHeaderID click) apiRequestNd", apiRequestNd);

        if (!apiRequestNd.ok) {
            /* Error in connecting to API */
            let statusCode = apiRequestNd?.status;
            const errorCodesObj = ndHttpErrorCodes["en"][statusCode];

            $('#modalCommonTextarea').html(`URL: ${apiRequestNd?.url}\n`);
            $('#modalCommonTextarea').append(`HTTP Fejlkode: ${statusCode} (${errorCodesObj.short})\n\n`);
            $('#modalCommonTextarea').append(`HTTP Fejltekst*:\n${errorCodesObj.large}`);
            modalCommon.show();
            return;
        }

        const apiResponse = await apiRequestNd.json();
        console.info("(detailHeaderID click) apiResponse", apiResponse);

        if (apiResponse === null) {
            $("#modalCommonTextarea").text("Bruger blev ikke fundet");
        }
        else {
            $("#modalCommonTextarea").text(JSON.stringify(apiResponse));
        }

        modalCommon.show();
    });


    /** @event
     * @name settingsCheckbox Click 
     * @listens settingsCheckbox#click
     * @fires ndRequestQueues
     * @description Settings checkbox changed in settings or queue tab
     * @since 1.0.0.0
    */
    $('#Settings input:checkbox, #settingEmployee input:checkbox, #settingQueue input:checkbox').on('click', function () {
        let id = $(this).attr("id");
        let value = $(this).prop("checked");

        tdcSetLocalStorage(id, value);
        console.log(`(Checkbox) ${id} = ${value}`);

        let queueSettingIdsArr = ["queuesShowFavOnly", "queuesShowRelevantOnly"];
        if (queueSettingIdsArr.includes(id)) {
            ndRequestQueues();
        }

        if (id === "employeesShowFnrOnly") {
            ndRequestEmployees();
        }
    });


    /** @event
     * @name settingsDropDown Changed 
     * @listens settingsDropDown#changed
     * @fires ndRequestQueues
     * @description Settings dropdown changed in settings or employees tab
     * @since 1.0.0.0
    */
    $('#Settings select').on('change', function () {
        let id = $(this).attr("id");
        let value = $(this).val();

        switch (id) {
            case "settingCalloutNumSelect":
                ndCallOutnumCurrentPost(value);
                $('#settingCalloutNum').val(value);
                break;
            case "settingTransferTypeDD":
                transferTypeMark();
                break;
            case "settingDepartmentDD":
                $('#tableEmpId').DataTable().order(ndDataTableSorting(true));
                break;
            case "settingMsTeamsBusyDD":
                if (value === "DISABLED") {
                    clearInterval(myTeamsStatusIntervalG);
                }
                else {
                    myTeamsStatusIntervalG = setInterval(pollMyTeamsStatus, 10000);
                }
                break;
            case "settingShownRowsDD":
                setShownRows(value);
                break;
            case "settingQueueLayoutDD":
                let cssClass = (value === "COMPACT") ? "compact" : "";
                $("#tableQueId").removeClass("compact").addClass(cssClass);
                break;
            case "settingLayoutRightSectionDD":
                let settingRightSection = (value === "CALENDAR");
                calendarShow(settingRightSection);
                break;
            case "settingLayoutOpeningHoursDD":
                placeSearchWordRow(value);
                break;
            case "settingQueuesAlarmDD":
                ndRequestQueues(true);
                break;
            case "settingSearchNoNumberDD":
                ndRequestQueues(false);
                break;
        }
        tdcSetLocalStorage(id, value);
        console.info(`(DropDown) ${id} = ${value}`);
    });


    /** @event
     * @name phoneButtonsTop Click 
     * @listens phoneButtonsTop#click
     * @description Top phone buttons clicked
     * @since 1.0.0.0
    */
    $('#phoneButtonsTop button').on('click', function () {
        let id = $(this).attr("id");
        let number = $('#phoneInput').val() || "";
        let fullName = $("#dFullName").text();
        let departmentName = $("#dDepartmentName").text();

        console.info("(phoneButtonsTop) id", id);

        if (alarmNumbers.includes(number) || number.length === 5) {
            number = prefixLocalNumber(number);
            $('#phoneInput').val(number);
        }

        console.info("(phoneButtonsTop) number", number);

        switch (id) {
            case "callOut":
                outboundCall(number, fullName, departmentName);
                break;
            case "callHangup":
                callHangup();
                break;
            case "transferPhoneCold":
                transferToPhone(number, fullName, departmentName);
                break;
            case "transferPhoneCancel":
                endConsultation();
                break;
            case "transferPhoneWarm":
                callObj.tdcManuel = true;
                consultWithPhone(number, fullName, departmentName);
                break;
            case "transferPhoneWarm2":
                transferToConsultee();
                break;
        }
    });


    /** @event
     * @name phoneButtonsDetailView Click 
     * @listens phoneButtonsDetailView#click
     * @description Phone buttons in detail section clicked
     * @since 1.0.0.0
    */
    $('#dPhoneSection button, #dMobileSection button').on('click', function () {
        console.info("(phoneButtonsDetailView) In");

        let id = $(this).parent().attr("id");
        let number = (id === "dPhoneSection") ? $("#dPhone").text() : $("#dMobile").text()
        let fullName = $("#dFullName").text();
        let departmentName = $("#dDepartmentName").text();

        console.info("(phoneButtonsDetailView) id", id);
        console.info("(phoneButtonsDetailView) number", number);

        switch (id) {
            case "dCallOutPhone":
                outboundCall(number, fullName, departmentName);
                break;
            case "dTransferColdPhone":
                transferToPhone(number, fullName, departmentName);
                break;
            case "dTransferWarmPhone":
                consultWithPhone(number, fullName, departmentName);
                break;
            case "dCallOutMobile":
                outboundCall(number, fullName, departmentName);
                break;
            case "dTransferColdMobile":
                transferToPhone(number, fullName, departmentName);
                break;
            case "dTransferWarmMobile":
                consultWithPhone(number, fullName, departmentName);
                break;
        }

        console.info("(phoneButtonsDetailView) Out");
    });


    /** @event
     * @name detailContent Click 
     * @listens detailContent#click
     * @description Copy of text content from detail<br>Supported fields: fullname, phone, mobile and email
     * @since 1.0.0.0
    */
    /* Detail  Buttons */
    $('#dFullName, #dPhone, #dMobile, #dEmail').on('click', function () {
        console.debug("(dEmail) In");

        let text = $(this).text();
        console.info("(dEmail) text", text);
        $("#inputDummyTxt").val(text);

        $("#inputDummyTxt").removeClass("ndHide");
        copyTextToClipboardOld("inputDummyTxt");
        $("#inputDummyTxt").addClass("ndHide");

        ndFocusSearchBox();

        console.debug("(dEmail) Out");
    });


    /** @event
     * @name dEmailSection Click 
     * @listens dEmailSection#click
     * @description Send phonemessage via email, chat or modal popup
     * @since 1.0.0.0
    */
    /* Detail  Buttons */
    $('#dEmailSection a').on('click', function () {
        console.debug("(dEmailSection Click) In");

        let id = $(this).attr("id");

        let fullName = $("#dFullName").text();
        let email = $("#dEmail").attr("title");

        switch (id) {
            case "dEmailMessage":
                sendEmail(fullName, email);
                break;
            case "dEmailChat":
                sendImChat(fullName, email);
                break;
            case "dEmailMessage2":
                $("#phoneMessageModal_ID").modal('show');
                break;

        }

        console.debug("(dEmailSection Click) Out");
    });


    /** @event
     * @name phoneMessageModal_ID Shown 
     * @listens phoneMessageModal_ID#shown
     * @description Load phonemessage content when message modal is shown
     * @since 1.0.0.0
    */
    $('#phoneMessageModal_ID').on('shown.bs.modal', function () {
        console.debug("(phoneMessageModal_ID Shown) In");

        tdcLoadPhoneTemplateText();
        $("#phoneMessageBodyTxt").trigger("focus");

        console.debug("(phoneMessageModal_ID Shown) Out");
    });


    /** @event
     * @name versionShowDetailBtn Click 
     * @listens versionShowDetailBtn#click
     * @description Show version modal
     * @since 1.0.0.0
    */
    $('#versionShowDetailBtn').on('click', function () {
        console.debug("(versionShowDetailBtn) In");

        console.debug("(versionShowDetailBtn) Out");
    });


    /** @event 
     * @name favoritesExportBtn Click 
     * @fires favoritesExport
     * @description Exports favorites to csv file
    */
    $("#favoritesExportBtn").on("click", function () {
        favoritesExport();
    });


    /** @event 
     * @name favoritesImportBtn Click 
     * @fires favoritesImportFile
     * @description Imports favorites from csv file
    */
    $("#favoritesImportBtn").on("click", function () {
        console.debug("favoritesImportBtn In");
        if ('FileReader' in window) {
            $('#favoritesImportFile').trigger("click")
        } else {
            alert('Your browser does not support the HTML5 FileReader.');
        }
        console.debug("favoritesImportBtn Out");
    });


    /** @event
     * @name favoritesImportFile Changed
     * @listens favoritesImportFile#change
     * @fires favoritesImportSelectedFile
     * @description Imports favorites from csv file
    */
    $('#favoritesImportFile').on("change", function (event) {
        console.debug("(favoritesImportFile Change) In");

        let fileToLoad = event.target.files[0];
        console.info("(favoritesImportFile Change) fileToLoad", fileToLoad);

        if (fileToLoad) {
            let reader = new FileReader();
            reader.readAsText(fileToLoad, 'UTF-8');

            reader.onload = function (fileLoadedEvent) {
                let textFromFileLoaded = fileLoadedEvent.target.result;
                console.log("loaded " + textFromFileLoaded);

                let confirmOkCancel = confirm("Ønsker du at importere favoritter:\n" + textFromFileLoaded);
                if (confirmOkCancel) {
                    favoritesImportSelectedFile(textFromFileLoaded);
                }
                $('#favoritesImportFile').val("");
            };
        }

        console.debug("(favoritesImportFile Change) In");
    });
});


/** @event
 * @name nav-link Shown 
 * @listens nav-link#shown
 * @fires navBarChanged
 * @description Perform action when new tab is selected
 * @since 1.0.0.0
*/
$('a.nav-link').on('shown.bs.tab', function (event) {
    let tabName = $(event.target).attr("href");
    navBarChanged(tabName);
});


/** @event
 * @name navBar Changed 
 * @listens nav-link#shown
 * @description Perform action when new tab is selected
 * @since 1.0.0.0
*/
function navBarChanged(tabActive) {
    console.debug("(NavBarChanged) In");

    console.log("(NavBarChanged) active", tabActive)

    switch (tabActive) {
        case "#Queues":
            ndFocusSearchBox(0, "searchInputQue");
            ndRequestQueues();
            QueuesDT.cell(':eq(0)', 2).focus();
            break;
        case "#Employees":
            initializeEmployees();

            //performSearch();
            ndFocusSearchBox();
            EmployeesDT.columns.adjust();

            setTimeout(() => {
                EmployeesDT.cell(':eq(0)', colIndexObj.name).focus();
            }, 200);

            let numRowsEmp = EmployeesDT.rows().count();

            if (numRowsEmp > 0 && presenceObj.enabled) {
                clearInterval(loadPresenceIntervalG);
                setTimeout(loadPresence, 400);
                loadPresenceIntervalG = setInterval(loadPresence, presenceObj.timer * 1000);
            }
            break;
        case "#Favorites":
            initializeFavorites();
            ndFocusSearchBox(0, "searchInputFav");

            let numRowsFav = FavoritesDT.rows().count();
            if (numRowsFav > 0 && presenceObj.enabled) {
                clearInterval(loadPresenceIntervalG);
                setTimeout(loadPresence, 200);
                loadPresenceIntervalG = setInterval(loadPresence, presenceObj.timer * 1000);
            }
            break;
        case "#Settings":
            //ndCallOutnumCurrentGet();
            break;
        case "#Info":
            //TODO
            break;
        case "#TESTMARK":
            //$("#navItemTmHttp").addClass('active');
            //$("#TestmarkHttpID").addClass('active');
            $("#navItemTmHtml").addClass('active');
            $("#TestmarkHtmlID").addClass('active');
            break;
    }

    console.debug("(NavBarChanged) Out");
}


/** @function
 * @name performSearch 
 * @description Perform search on employees
 * @since 1.0.0.0
*/
function performSearch() {
    let searchValue = $("#searchInputEmp").val() || "";

    if (searchValue.length >= searchWordLength) {
        ndRequestEmployees();
        ndFocusSearchBox();
    }
    else {
        $("#searchingLblEmp").html(`> ${searchWordLength} tegn ..`);
        clearEmployeeGrid();
        clearDetailView();
    }
}


/** @event
 * @name modalCommonDataCopy Click 
 * @listens modalCommonDataCopy#click
 * @description Copy content of modal textarea to clipboard
 * @since 1.0.0.0
*/
$('#modalCommonDataCopy').on('click', function () {
    let copiedBol = copyTextToClipboardOld("modalCommonTextarea");

    if (copiedBol) {
        $("#modalCommonDataCopyStatus").html(`<span class="ndColorGreen">Data copied</span>`);
        setTimeout(() => {
            $("#modalCommonDataCopyStatus").html("");
        }, 2000);
    }
});


/** @event
 * @name cfaNumber Click 
 * @listens cfaNumber#click
 * @description Perform chosen action on cfa number, when clicked
 * @since 1.0.0.0
*/
$('#cfaNumber').on('click', function () {
    let settingCfaClick = $("#settingDetailClickCfa").val() || "none";
    let numberText = $("#cfaNumberTxt").val();

    if (numberText !== "") {
        switch (settingCfaClick) {
            case "copy":
                $("#cfaNumberTxt").removeClass("ndHide");
                copyTextToClipboardOld("cfaNumberTxt");
                $("#cfaNumberTxt").addClass("ndHide");
                break;
            case "search":
                $("#searchInputEmp").val(numberText);
                ndRequestEmployees();
                break;
        }
    }
});


/** @event
 * @name tdcModal_ID Shown 
 * @listens tdcModal_ID#shown
 * @description Fill in data when tdcModal is shown
 * @since 1.0.0.0
*/
$('#tdcModal_ID').on('show.bs.modal', function (e) {
    console.debug("tdcModal_ID In");
    console.info("tdcModal_ID Show e.relatedTarget", e.relatedTarget);

    let titleText = e.relatedTarget?.title || "";
    let bodyText = e.relatedTarget?.bodyText || "";
    console.info("tdcModal_ID Show titleText", titleText);
    console.info("tdcModal_ID Show bodyText", bodyText);

    $("#tdcModal_ID div.modal-header h1.modal-title").html(titleText);
    $("#tdcModal_ID div.modal-body").html(bodyText);

    console.debug("tdcModal_ID Out");
});


/** @event
 * @name tableDisplay KeyFocus 
 * @listens table.display#keyfocus
 * @description Highlight row based on department and transfer type
 * @since 1.0.0.0
*/
$('table.display').on('key-focus', function (e, datatable, cell) {
    // 
    console.debug("on_key-focus In");
    let tableId = datatable.settings()[0].sTableId
    let rowData = datatable.row(cell.index().row).data();

    $(datatable.row(cell.index().row).node()).addClass('selected');
    if (rowData.isDepartment) {
        $(datatable.row(cell.index().row).node()).addClass('Dep');
    }

    if ($('.thPhone').hasClass("ndColorLightRed")) {
        $(datatable.row(cell.index().row).node()).addClass('Warm');
    }

    clearTimeout(showDetailsTimeoutG);
    if (tableId === "tableEmpId") {
        showDetailsTimeoutG = setTimeout(ndShowDetails, 250, rowData);
    }
});


/** @event
 * @name tableDisplay KeyBlur
 * @listens table.display#keyblur
 * @description Deselect highlighted row
 * @since 1.0.0.0
*/
$('table.display').on('key-blur', function (e, datatable, cell) {
    console.debug("on_key-blur", datatable);
    // Deselect highlighted row
    $(datatable.row(cell.index().row).node()).removeClass('selected').removeClass('Warm').removeClass('Dep');
});


/** @event
 * @name tableDisplay KeyDt
 * @listens table.display#keydt
 * @description Handle key event that hasn't been handled by KeyTable
 * @since 1.0.0.0
*/
$('table.display').on('key.dt', function (e, datatable, key, cell, originalEvent) {
    console.debug("(DataTable On Key) In");

    // If not ENTER key, break out
    if (originalEvent.key !== "Enter") {
        console.info("(DataTable On Key) Not Enter");
        return;
    }

    let targetId = originalEvent.target.id;
    console.info("(DataTable On Key) targetId", targetId);

    /* Wrong Control */
    if (originalEvent.target.id === "phoneInput") {
        console.debug("(DataTable On Key) Out - Wrong control");
        return;
    }

    let callProgress = callObj.callProgress || "HANGUP";
    let tableId = datatable.settings()[0].sTableId;
    console.info("(DataTable On Key) callProgress", callProgress);
    console.info("(DataTable On Key) tableId", tableId);


    /* Wrong State */
    if (callObj.callProgress !== "CONNECTED" && callObj.callProgress !== "HANGUP") {
        console.debug("(DataTable On Key) Out - Wrong state");
        return;
    }

    /* Wrong State Queue */
    if (tableId === "tableQueId" && callObj.callProgress !== "CONNECTED") {
        console.debug("(DataTable On Key) Out - Wrong state for Queue");
        return;
    }


    let transferState = callObj.transferState || "";
    let isConsultToQueue = callObj.isConsultToQueue || "false";
    let rowData = datatable.row(cell.index().row).data();
    console.info("(DataTable On Key) transferState", transferState);
    console.info("(DataTable On Key) isConsultToQueue", isConsultToQueue);
    console.info("(DataTable On Key) data", rowData);


    /* Is Consult to Queue */
    if (isConsultToQueue === "true") {
        console.debug("(DataTable On Key) TransferState isConsultToQueue");
        transferToConsultee();
        return;
    }


    /* TransferState Alerting_Connected */
    if (transferState === "ALERTING" || transferState === "CONNECTED") {
        console.debug("(DataTable On Key) TransferState Alerting_Connected");
        transferToConsultee();
        return;
    }

    if (testingConfig !== "") {
        //alert(data.fullName);
        return;
    }
    console.debug("(DataTable On Key) HER");

    /* Enter on Queues */
    if (tableId === "tableQueId") {
        if (rowData.nodeId === "") {
            console.debug("(DataTable On Key) No NodeId");
            return;
        }

        if (rowData.agentsLoggedOn === 0) {
            console.debug("(DataTable On Key) No Agent");
            popupWarning("warning", `Det er ikke muligt at stille om til ${rowData.description}. Ingen agenter pålogget!`);
            return;
        }

        if ($('.thPhone').hasClass("ndColorLightRed")) {
            consultWithServiceQueue(rowData);
        }
        else {
            transferToService(rowData);
        }
        return;
    }

    if (transferState === "") {
        transferOnEnter(rowData, originalEvent);
    }

    console.debug("(DataTable On Key) Out");
});


/** @event
 * @name settingParkDefaultQueue Changed
 * @listens settingParkDefaultQueue#change
 * @description Show or hide parkering symbol, when setting are changed
 * @since 1.0.0.0
*/
$("#settingParkDefaultQueue").on('change', function () {
    let value = $(this).val();
    if (value !== "0") {
        $("#btnPark_ID").removeClass("ndHidden");
    } else {
        $("#btnPark_ID").addClass("ndHidden");
    }
});


/** @event
 * @name settingParkShortcut Changed
 * @listens settingParkShortcut#change
 * @description Chage btnPark_ID to reflect new selected shortcut
 * @since 1.0.0.0
*/
$("#settingParkShortcut").on('change', function () {
    let value = $(this).val();
    $("#btnPark_ID").attr("title", "Alt+" + value);
});


/** @event
 * @name btnPark_ID Click
 * @listens btnPark_ID#click
 * @description Park current call
 * @since 1.0.0.0
*/
$('#btnPark_ID').on('click', async function (e) {
    console.debug("(btnPark_ID Click) In");
    console.info("(btnPark_ID Click) shift", e.shiftKey);

    tdcParkCurrentCall(e.shiftKey);

    console.debug("(btnPark_ID Click) Out");
});

/** @event
 * @name testmarkHtmlBtn Click
 * @listens testmarkHtmlBtn#click
 * @description Testmark Html Buttons
 * @since 1.0.0.0
*/
$('#testmarkHtmlBtn').on('click', function () {
    console.debug("(testmarkHtmlBtn) In");

    let number = $("#TestmarkHtmlNumberTxt").val();
    $("#tdcPopupId").attr("href", "tdcbuddypopup:" + number);
    $('#tdcPopupId')[0].click();

    console.debug("(testmarkHtmlBtn) Out");
});


/** @event
 * @name testmarkHtml2Btn Click
 * @listens testmarkHtml2Btn#click
 * @description Testmark Html Buttons Two
 * @since 1.0.0.0
*/
$('#testmarkHtml2Btn').on('click', function () {
    console.debug("(testmarkHtml2Btn) In");

    let url = "tdcbuddypopup:" + $("#TestmarkHtmlNumberTxt").val();
    tdcBuddyPopupWindow(url, 400);

    console.debug("(testmarkHtml2Btn) Out");
});


/** @event
 * @name numberInNotes Click
 * @listens document.numberInNotes#click
 * @description Copy Number from Notes
 * @since 1.0.0.0
 */
$(document).on('click', ".numberInNotes", function () {
    console.debug("(numberInNotes) In");
    let value = $(this).text();
    console.info("(numberInNotes) value", value);

    $("#phoneInput").val(value);
    $("#phoneInput").trigger("focus");

    console.debug("(numberInNotes) Out");
});