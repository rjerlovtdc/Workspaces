/* Global Variables */
versionObj.tdcInitializing = 37;


/* Windows Load */
$(window).on("load", function () {
    console.debug("(tdcInitializing) Load In");

    setVersion();

    console.debug("(tdcInitializing) Load Out");
});


/* Initialize Queues*/
function initializeQueues() {

}


/* Initialize Employees*/
function initializeEmployees() {
    console.debug("(initializeEmployees) In");

    if (typeof EmployeesDT === "undefined") {
        console.debug("(initializeEmployees) undefined");
        setTimeout(ndDataTableInit, 200, "#tableEmpId");
        setTimeout(() => {
            EmployeesDT.columns.adjust();
        }, 1000);
    }
    else {
        EmployeesDT.columns.adjust();
    }

    console.debug("(initializeEmployees) Out");
}


/* Initialize Favorites */
function initializeFavorites() {
    console.debug("(initializeFavorites) In");

    if (typeof FavoritesDT === "undefined") {
        setTimeout(ndDataTableInit, 200, "#tableFavId", ndUserFavoritesArr);
        setTimeout(() => {
            FavoritesDT.columns.adjust();
            FavoritesDT.cell(':eq(0)', colIndexObj.name).focus();
        }, 500);
    }
    else {
        FavoritesDT.clear().rows.add(ndUserFavoritesArr).draw();
        FavoritesDT.columns.adjust();
        FavoritesDT.cell(':eq(0)', colIndexObj.name).focus();
    }

    console.debug("(initializeFavorites) Out");
}


/** Set Version
 * @returns {void}
 */
async function setVersion() {
    versionObj.defaulthtm = $("figcaption.ndLogoFont.vMaster").html();

    $("figcaption.ndLogoFont").each(function () {
        $(this).html(`&nbsp;BUDDY&nbsp;${versionAll}`);
    });
    $('#ndBuddyVersionTxt').val(versionAll);

    const response = await fetch('Res/tdcVersions.json');
    const versionServerObj = await response.json();
    let mismatchVersionBol = false;
    let cssClass = "ndColorGreen";

    console.log("(setVersion) versionObj", versionObj);
    console.log("(setVersion) versionServerObj", versionServerObj);

    /* Master version */
    if (versionAll !== versionServerObj.masterVersion) {
        cssClass = "ndColorRed";
        mismatchVersionBol = true;
    }
    $('#versionTableBodyId').append(
        `<tr id="versionMasterTableId">
                <td>Master version</td>
                <td><span class="${cssClass}">${versionAll}</span></td>
                <td><span>${versionServerObj.masterVersion}</span></td>
            </tr>`)
    $('#versionTableBodyId').append(`<tr><td colspan="3">&nbsp;</td></tr>`);

    $.each(versionServerObj.fileVersions, function (key, value) {

        let fileName = (key === "defaulthtm") ? "default.htm" : key + ".js";
        cssClass = "ndColorGreen";
        console.log(`(setVersion)  ${key} = ${value}`);
        
        if (value.toString() !== versionObj[key].toString()) {
            mismatchVersionBol = true;
            cssClass = "ndColorRed";
        }

        $('#versionTableBodyId').append(
            `<tr>
                <td>${fileName}</td>
                <td><span class="${cssClass}">${versionObj[key].toString().padStart(3, '0')}</span></td>
                <td><span>${value.toString().padStart(3, '0')}</span></td>
            </tr>`)
    });

    if (mismatchVersionBol) {
        //TODO
    }
}