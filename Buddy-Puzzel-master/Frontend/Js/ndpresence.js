/**
 * @module ndPresence
*/

/* Global Variables */
versionObj.ndpresence = 37;
var puzzelStateSavedG = false, msTeamsStateSavedG = "", myTeamsStatusIntervalG = 0;


$(function () {
    myTeamsStatusIntervalG = setInterval(pollMyTeamsStatus, 10000);
});


/** @function 
 * @name loadPresence
 * @async
 * @description Update presence on all visbile rows in datatable
 * @since 1.0.0.0
*/
async function loadPresence() {
    console.debug("(loadPresence) In");

    /* Only Run on Employees or Favorites page */
    let employeesTabActive = $("#navItemEmployees").hasClass("active");
    let favoritesTabActive = $("#navItemFavorites").hasClass("active");

    console.info("(loadPresence) EmployeesTabActive", employeesTabActive);
    console.info("(loadPresence) FavoritesTabActive", favoritesTabActive);

    if (!(employeesTabActive || favoritesTabActive)) {
        console.log("(loadPresence) Employees or Favorites Tab Not Active");
        clearInterval(loadPresenceIntervalG);
        return;
    }

    let _presenceDT = (employeesTabActive) ? EmployeesDT : FavoritesDT;
    console.info("(loadPresence) _presenceDT", _presenceDT);

    if (typeof _presenceDT === "undefined") {
        console.info("(loadPresence) No data");
        return;
    }

    var msTokenRequest = {};
    var continueLoop = true;

    _presenceDT.rows().every(async function (rowIdx) {
        if (!continueLoop) {
            return false;
        }

        let rowData = this.data();
        let number = (rowData.mobile === "") ? rowData?.phone || "" : rowData.mobile;
        console.info("(loadPresence) rowData", rowData);
        console.info("(loadPresence) presenceObj.tdcScale", presenceObj.tdcScale);

        /* TDC Scale */
        if (presenceObj.tdcScale && number !== "") {
            continueLoop = await calculateStatusScale(rowIdx, rowData, _presenceDT);
        }


        /* Teams */
        if (presenceObj.msTeams && msalUsername !== "" && (rowData.azureId !== "" || rowData.email !== "")) {
            let orgPath = rowData.organizationPath;

            if (typeof msTokenRequest?.accessToken === "undefined") {
                msTokenRequest = await getTokenPopup(tokenRequest);
            }

            if (agentObj.orgPath === "DEFAULT" || orgPath.includes(agentObj.orgPath)) {
                await getTeamsStatus(rowIdx, rowData, msTokenRequest.accessToken, _presenceDT);
            }
        }

        /* Agg Status */
        await calculateAggStatus(rowIdx, _presenceDT);

        if (employeesTabActive) {
            let tdcIdAttr = $("#dFullName").attr("tdcId") || "";
            if (rowData.id.toString() === tdcIdAttr) {
                let ndUser = EmployeesDT.row(rowIdx).data();
                calculatePresenceDetail(ndUser);
            }
        }
    });
    console.debug("(loadPresence) Out");
}


/** @function 
 * @name calculateAggStatus
 * @async
 * @param {number} rowIdx - Index for datatable row
 * @param {object} _presenceDT - Datatable object
 * @description Update presence on all visbile rows in datatable
 * @since 1.0.0.0
*/
async function calculateAggStatus(rowIdx, _presenceDT) {
    console.debug("(calculateAggStatus) In");

    let rowData = _presenceDT.row(rowIdx).data();
    if (typeof rowData === "undefined") {
        console.debug("(calculateAggStatus) No rowData");
        return;
    }
    let aggCell = _presenceDT.cell(rowIdx, 0);
    const scalePaState = paStatusDic[rowData.presencePA]?.state || -1;
    const msTeamsState = teamsAvailability[rowData.presenceTeams.availability]?.state || -1;

    /* Phone Busy or DND */
    if (presenceObj.tdcScale && rowData.presencePhone === "Off-Hook" || rowData.presencePhone === "DND") {
        aggCell.data("2")
        return;
    }

    /* Phone Personal Assistant RED */
    if (presenceObj.tdcScale && scalePaState === "2") {
        aggCell.data("2")
        return;
    }

    /* Teams RED */
    if (presenceObj.msTeams && msTeamsState === "2") {
        aggCell.data("2")
        return;
    }

    /* Out of Office */
    if (presenceObj.msTeams && msTeamsState === "2") {
        aggCell.data("2")
        return;
    }

    /* Phone CFA */
    if (presenceObj.tdcScale && rowData.presencePhone === "CFA") {
        aggCell.data("1")
        return;
    }

    /* Phone Personal Assistant YELLOW */
    if (presenceObj.tdcScale && scalePaState === "1") {
        aggCell.data("1")
        return;
    }

    /* Teams YELLOW */
    if (presenceObj.msTeams && presenceObj.msTeams && msTeamsState === "1") {
        aggCell.data("1")
        return;
    }

    /* Calendar */
    if (presenceObj.calendar && rowData.isCalenderBusy) {
        aggCell.data("1");
        return;
    }

    /* GREEN */
    aggCell.data("0");
}


/** @function 
 * @name getTeamsStatus
 * @async
 * @param {number} rowIdx - Index for datatable row
 * @param {object} _presenceDT - Datatable object
 * @description Update presence on all visbile rows in datatable
 * @since 1.0.0.0
*/
async function getTeamsStatus(rowIdx, rowData, teamsToken, _presenceDT) {
    console.debug("(getTeamsStatus) In");
    console.info("(getTeamsStatus) rowData", rowData);

    let azureId = rowData?.azureId || "";
    
    if (azureId === "" ||
        rowData.organizationPath.includes("TOP|454014|Furesø") ||
        rowData.organizationPath.includes("TOP|454014|Allerød")
    ) {
        /* Get Azure ID From Email */
        const urlUser = `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${rowData.email}'`
        let tdcUserJson = await getFromMSGraph(urlUser, teamsToken);
        console.info("(getTeamsStatus) tdcUserJson", tdcUserJson);
        if (typeof tdcUserJson.value[0]?.id === "undefined") {
            return;
        }
        azureId = tdcUserJson.value[0]?.id || "";
    }

    console.info("(getTeamsStatus) azureId", azureId);
    const url = `https://graph.microsoft.com/beta/users/${azureId}/presence`;

    let tdcJson = await getFromMSGraph(url, teamsToken);
    console.info("(getTeamsStatus) tdcJson", tdcJson);

    _presenceDT.cell(rowIdx, 3).data(tdcJson);

    console.debug("(getTeamsStatus) Out");
}


const calculateStatusScale = async (rowIdx, rowData, _presenceDT) => {
    console.debug("(calculateStatusScale) In");

    let number = (rowData.mobile === "") ? rowData?.phone || "" : rowData.mobile;
    let orgPath = getOrgPath(rowData.organizationPath);
    console.debug("(calculateStatusScale) orgPath", orgPath);

    if (number === "" || orgPath === "") {
        console.info("(calculateStatusScale) no phonenumber found: ", rowData);
        _presenceDT.cell(rowIdx, colIndexObj.pa).data("NotEnabled");
        _presenceDT.cell(rowIdx, colIndexObj.dnd).data("NotEnabled");
        return true;
    }

    /* PresenceHUB TEST */
    if (testingConfig === "regionsyd2" || testingConfig === "netdesign2") {
        console.debug("PHUB In");
        const phubToken = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJwZmNFcTNWSEFxRDF0cElXc0ZlUkhnR0hoUlJ4MW5wTDBFRE1aNTl2Xy1JIn0.eyJleHAiOjE3Mjg2NTEzNTIsImlhdCI6MTcyODYzMzM1MiwianRpIjoiZjVkMzIwNzUtNWU0Ni00ZjMxLWIzNDAtN2M4ZDFkYzIzZGM1IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1odWIucHVibGljLmxxZC5kay9yZWFsbXMvUHJlc2VuY2VIdWIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNGQwM2Q5NDUtNTU5NS00NWRjLThkYzEtNDY0ZjFkOTgyM2E3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicHJlc2VuY2VodWItY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6IjI0YTRhZWRlLTQxYzItNGE2Mi1iMzYzLTE1MTgzMzFlMTI0YSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsicHJlc2VuY2Uvc2NhbGUvcmVhZC92azE3NzgxMyIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtcHJlc2VuY2VodWIiLCJwcmVzZW5jZS9zY2FsZS9yZWFkL3ZrMTUwOTYxIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiMjRhNGFlZGUtNDFjMi00YTYyLWIzNjMtMTUxODMzMWUxMjRhIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlcyI6WyJwcmVzZW5jZS9zY2FsZS9yZWFkL3ZrMTc3ODEzIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1wcmVzZW5jZWh1YiIsInByZXNlbmNlL3NjYWxlL3JlYWQvdmsxNTA5NjEiXSwibmFtZSI6Ikplc3BlciBIaW5nZWxiamVyZyIsInByZWZlcnJlZF91c2VybmFtZSI6InByZXNlbmNlaHVidXNlciIsImdpdmVuX25hbWUiOiJKZXNwZXIiLCJmYW1pbHlfbmFtZSI6IkhpbmdlbGJqZXJnIiwiZW1haWwiOiJ0ZXN0QGZpc2suYm9sbGUifQ.k8_bPupJiabMyjWtSqNHUR8CRl7sYxVWyddcNgX9X7tohyUowxiDdPbGoONcvB07kp_l6EnK0_BirQdGdMaeVZ3Ou3cxmYrRHIb8SHJRh49-kzNJLKL4XShZY-gnYN6GkpmCPrrZ5p0JWP72y0En9_VAM7YC_V2PxQdcQh28uk4716OnD2uG694VdcWEQytmIzfDUJW_vneT2eV-FrNVyMN-ho0BwP6EbisPQBoFo1NWKQPwM8NE3gTSW4FEBn0Xo5J4cYjVj0Hir8pP_VEKMGF4Q22sOI_U2PR9137DIrhKShenOdkv1CI9akXF1xO1gs99vO1OV_QotRhxsydmug";
        const phubUrl = "https://mobilepartners.northeurope.cloudapp.azure.com/PresenceHub/api/Presence/?number=30550517";
        console.info("PHUB phubUrl", phubUrl);
        const phubRes = await scaleApiCall(phubUrl, "GET", "", phubToken);

        console.info("PHUB phubRes", phubRes);
        console.debug("PHUB Out");
        return;
    }

    /* Get Hook Status Mobile */
    const resUrl = `Scale?phoneNumber=${number}&customerKey=${custObj.customerKey}&orgPath=${orgPath}`;

    const scalePresenceRes = await scaleApiCall(resUrl);
    console.log("(calculateStatusScale) scalePresenceRes", scalePresenceRes);

    if (scalePresenceRes?.HasError) {
        _presenceDT.cell(rowIdx, colIndexObj.pa).data("NotEnabled");
        _presenceDT.cell(rowIdx, colIndexObj.dnd).data("NotEnabled");
        console.info("(calculateStatusScale) presence not found for user: ", rowData.fullName);
        return true;
    }

    if (typeof _presenceDT.cell(rowIdx, colIndexObj.id).data() === "undefined") {
        console.info("(calculateStatusScale) row was removed");
        return false;
    }

    if (_presenceDT.cell(rowIdx, colIndexObj.id).data() !== rowData.id) {
        console.info("(calculateStatusScale) row wrong");
        return false;
    }

    let hookStatus = scalePresenceRes.hookStatus;
    let paPresence = scalePresenceRes.paPresence;
    let dndActive = scalePresenceRes.dndActive;
    let cfaActive = scalePresenceRes.cfaActive;
    let cfaPhoneNumber = (cfaActive) ? scalePresenceRes.cfaPhoneNumber : "";
    console.info("cfaPhoneNumber", cfaPhoneNumber);

    /* Set Values */
    _presenceDT.cell(rowIdx, colIndexObj.dnd).data(dndActive);  //DND
    _presenceDT.cell(rowIdx, colIndexObj.pa).data(paPresence);  //PA
    _presenceDT.cell(rowIdx, colIndexObj.cfa).data(cfaPhoneNumber);  //CFA


    /* Off-Hook*/
    if (hookStatus === "Off-Hook") {
        _presenceDT.cell(rowIdx, 1).data("Off-Hook");
        return true;
    }

    /* DND */
    if (dndActive) {
        _presenceDT.cell(rowIdx, 1).data("DND");
        return true;
    }

    /* PA */
    if (paPresence !== "" && paPresence !== "None") {
        _presenceDT.cell(rowIdx, 1).data(paPresence);
        return true;
    }

    /* CFA */
    if (cfaActive) {
        _presenceDT.cell(rowIdx, 1).data("CFA");
        return true;
    }

    _presenceDT.cell(rowIdx, 1).data("On-Hook");

    console.debug("(calculateStatusScale) Out");

    return true;
}


function getPhonePresenceText(row) {
    console.debug("(getPhonePresenceText) In", row);

    let returnObj = { title: "Ukendt", color: "ndColorGray", state: "-1" };

    if (typeof row === "undefined") {
        console.debug("(getPhonePresenceText) Out");
        return returnObj;
    }

    switch (row.presencePhone) {
        case "":
            returnObj = { title: "Ukendt", color: "ndColorGray", state: "-1" };
            break;
        case "On-Hook":
            returnObj = { title: "Ledig", color: "ndColorGreen", state: "0" };
            break;
        case "Off-Hook":
            returnObj = { title: "Optaget", color: "ndColorRed", state: "0" };
            return returnObj;
        case "DND":
            returnObj = { title: "DND Aktiv", color: "ndColorRed", state: "2" };
            return returnObj;
        case "CFA":
            returnObj = {
                title: `Viderestillet`, color: "ndColorYellow", state: "1"
            };
            return returnObj;
    }

    /* PA Status */
    if (row.presencePA !== "" && row.presencePA !== "None") {
        returnObj = paStatusDic[row.presencePA];
        return returnObj;
    }

    console.debug("(getPhonePresenceText) Out");
    return returnObj;
}


function getAggPresenceText(data) {
    const returnObj = { title: "Ukendt", color: "ndColorGray" };

    switch (data) {
        case "0":
            returnObj.title = "Ledig", returnObj.color = "ndColorGreen";
            break;
        case "1":
            returnObj.title = "Måske ledig", returnObj.color = "ndColorYellow";
            break;
        case "2":
            returnObj.title = "Optaget", returnObj.color = "ndColorRed";
            break;
    }

    return returnObj;
}


/* Get Scale calculatePresenceDetail */
function calculatePresenceDetail(ndUser) {
    console.debug("(calculatePresenceDetail) In");
    console.info("(calculatePresenceDetail) ndUser", ndUser);

    /* Agg Status */
    const aggPresenceObj = aggStatusDic[ndUser.presenceAggregated];
    $("#dDetailStatus").removeClass("ndColorGray").removeClass("ndColorGray").removeClass("ndColorGreen").removeClass("ndColorYellow").removeClass("ndColorRed");
    $("#dDetailStatus").addClass(aggPresenceObj.color);
    $("#dDetailStatus").attr("title", aggPresenceObj.title);

    /* Phone Presence */
    const phonePresenceObj = getPhonePresenceText(ndUser);
    $("#dPhoneStatus").removeClass("ndColorGray").removeClass("ndColorGray").removeClass("ndColorGreen").removeClass("ndColorYellow").removeClass("ndColorRed");
    $("#dPhoneStatus").addClass(phonePresenceObj.color);
    $("#dPhoneStatus").attr("title", phonePresenceObj.title);

    $("#dMobileStatus").removeClass("ndColorGray").removeClass("ndColorGray").removeClass("ndColorGreen").removeClass("ndColorYellow").removeClass("ndColorRed");
    $("#dMobileStatus").addClass(phonePresenceObj.color);
    $("#dMobileStatus").attr("title", phonePresenceObj.title);

    /* PA */
    const paStatusObj = paStatusDic[ndUser.presencePA];
    let deactivatedTexts = ["", "None", "NotEnabled"];
    console.info("paStatusObj", paStatusObj);
    if (!deactivatedTexts.includes(ndUser.presencePA)) {
        $("#paStatus").html("Aktiv");
        ndTooltip("paStatus", paStatusObj?.title || "");
    }
    else {
        $("#paStatus").html("Ikke aktiv");
        ndTooltip("paStatus");
    }

    /* DND */
    let dndStatus = (ndUser.presenceDND === true) ? "Aktiv" : "Ikke aktiv";
    $("#dndStatus").html(dndStatus);


    /* CFA */
    let cfaActive = ndUser.presenceCFANumber !== "";
    if (cfaActive) {
        $("#cfaNumber").html("Aktiv");
        $("#cfaNumberTxt").val(ndUser.presenceCFANumber);
        ndTooltip("cfaNumber", ndUser.presenceCFANumber.toString());
    }
    else {
        $("#cfaNumber").html("Ikke aktiv");
        $("#cfaNumberTxt").val("");
        ndTooltip("cfaNumber");
    }


    /* MS Teams */
    if (ndUser.presenceTeams !== "") {
        let teamsStatus = ndUser.presenceTeams?.activity || "";
        let teamsStatusMessage = ndUser.presenceTeams.statusMessage?.message.content || "";
        console.info("(presenceTeams) teamsStatus", ndUser.presenceTeams);

        $("#teamsStatus").html(teamsActivity[teamsStatus]);
        ndTooltip("teamsStatus", clearHTMLTags(teamsStatusMessage));

        /* Out of Office */
        let oofActive = ndUser.presenceTeams.outOfOfficeSettings?.isOutOfOffice || false;
        let oofMessage = ndUser.presenceTeams.outOfOfficeSettings?.message || "";

        if (oofActive) {
            oofMessage = oofMessage.replaceAll('\n\n\n', '<br />').replaceAll('\n\n', '<br />')

            ndTooltip("oofStatus", oofMessage);
            $("#oofStatus").html("Aktiv");
        }
        else {
            ndTooltip("oofStatus");
            $("#oofStatus").html("Ikke aktiv");
        }
    }
    else {
        $("#teamsStatus").html(`<span class="ndColorBlue">-</span>`);
        $("#oofStatus").html(`<span class="ndColorBlue">-</span>`);
        ndTooltip("teamsStatus");
        ndTooltip("oofStatus");
    }
}

async function getMyTeamsPresence() {
    console.debug("(getMyTeamsPresence) In");

    if (typeof msTokenRequest === "undefined" || typeof msTokenRequest.accessToken === "undefined") {
        msTokenRequest = await getTokenPopup(tokenRequest);
        return null;
    }

    let tdcJson = await getFromMSGraph(graphEndpointsMe.mePresence, msTokenRequest.accessToken);
    console.info("(getMyTeamsPresence) tdcJson", tdcJson);

    let returnObj = { "availability": tdcJson.availability, "activity": tdcJson.activity };
    console.info("(getMyTeamsPresence) returnObj", returnObj);

    console.debug("(getMyTeamsPresence) Out");

    return returnObj;
}


async function setMyTeamsPresence(stateName, stateObj = {}) {
    console.debug("(setMyTeamsPresence) In");

    if (typeof msTokenRequest === "undefined" || typeof msTokenRequest?.accessToken === "undefined") {
        msTokenRequest = await getTokenPopup(tokenRequest);
    }

    switch (stateName) {
        case "CONNECTED":
            msTeamsStateSavedG = await getMyTeamsPresence();
            console.info("(setMyTeamsPresence) Old Presence Saved", msTeamsStateSavedG);
            stateObj = { "availability": "DoNotDisturb", "activity": "DoNotDisturb" };
            break;
        case "HANGUP":
            stateObj = msTeamsStateSavedG;
            break;
        default:
            msTeamsStateSavedG = await getMyTeamsPresence();
            break;
    }

    await postMSGraph(graphEndpointsMe.mePreferedPresenceSet, msTokenRequest.accessToken, stateObj);
    console.info("(setMyTeamsPresence) New presence set to", stateObj);

    console.debug("(setMyTeamsPresence) Out");
}

async function clearMyTeamsPresence() {
    console.debug("(clearMyTeamsPresence) In");

    if (typeof msTokenRequest === "undefined" || typeof msTokenRequest?.accessToken === "undefined") {
        msTokenRequest = await getTokenPopup(tokenRequest);
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${msTokenRequest.accessToken}`);

    const options = {
        method: "POST",
        headers: headers,
    };

    fetch(graphEndpointsMe.mePreferedPresenceClear, options)
        .then(response => {
            console.info("(clearMyTeamsPresence) reponse", response);
        })
        .catch(error => console.error("(clearMyTeamsPresence) error", error));

    console.debug("(clearMyTeamsPresence) Out");
}


async function pollMyTeamsStatus() {
    console.info("pollMyTeamsStatus In", $("#settingMsTeamsBusyDD").val());

    if ($("#settingMsTeamsBusyDD").val() === "DISABLED") {
        clearInterval(myTeamsStatusIntervalG);
        return;
    }

    let currentState = await getMyTeamsPresence();
    console.info("pollMyTeamsStatus MS Status", currentState);

    if (currentState === null) {
        return;
    }

    if (!puzzelStateSavedG && currentState.activity === "InACall") {
        let returnObj = await getMyPuzzelStatus();
        console.info("pollMyTeamsStatus agentStatus", returnObj);

        if (returnObj.userStatus !== "Available" || returnObj.agentCcStatus !== "LoggedOn") {
            console.debug("pollMyTeamsStatus Break");
            return;
        }
        puzzelStateSavedG = true;
        setAgentPause();
    }

    console.info("pollMyTeamsStatus puzzelStateSavedG", puzzelStateSavedG);
    if (puzzelStateSavedG && currentState.activity !== "InACall") {
        console.debug("pollMyTeamsStatus HER1");
        await agentSetAvailable();
        puzzelStateSavedG = false;
    }
}



async function getMyPuzzelStatus() {
    let userStatus = await api.get('agent.userStatus');
    let agentCcStatus = await api.call('agent.contactCentreStatus');

    let returnObj = {
        userStatus: userStatus,
        agentCcStatus: agentCcStatus
    }

    console.info("getMyPuzzelStatus userStatus", returnObj);

    return returnObj;
}

async function setAgentPause(pauseTypeId = 4812) {
    let apiUrl = `${puzzelUrl}${custObj.customerKey}/users/${agentObj.userId}/pauseon`;
    let apiBody = JSON.stringify({ "pauseTypeId": pauseTypeId });  //Busy Teams

    let response = await puzzelApiCall(apiUrl, "POST", apiBody);
    console.info("setAgentPause reponse", response);
}