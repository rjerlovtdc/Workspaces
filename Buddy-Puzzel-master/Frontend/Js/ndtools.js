/**
 * @module ndTools
 */

/* Global Variables */
versionObj.ndtools = 39;

/** @function 
 * @name ndStoragePersistCheck 
 * @async
 * @returns {boolean} isPersisted
 * @description Check for persisted storage
*/
const ndStoragePersistCheck = async () => {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        console.log(`Persisted storage granted: ${isPersisted}`);
        return isPersisted;
    }
}

/** @function 
 * @name ndStoragePersistAsk 
 * @async
 * @returns {boolean} isPersisted
 * @description Request persistent storage for site
*/
const ndStoragePersistAsk = async () => {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persisted storage granted: ${isPersisted}`);
        return isPersisted;
    }
}


/** @function 
 * @name tdcLocalStorageAvailable 
 * @returns {boolean}
 * @description Check for localStorageSupport
*/
function tdcLocalStorageAvailable() {
    try {
        localStorage.setItem("nd_storage_test", "_storage_test_");
        localStorage.removeItem("nd_storage_test");
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&  //Firefox
            (storage && storage.length !== 0);  // QuotaExceededError only if something already stored
    }
}


/** @function 
 * @name tdcSetLocalStorage 
 * @param {string} key Name of storage
 * @param {string} value Value to be set
 * @param {number} [ttl=0] Time To Live in minutes
 * @description Set storage with value
*/
function tdcSetLocalStorage(key, value, ttl = 0) {
    console.debug("(tdcSetLocalStorage) - In");

    if (ttl !== 0) {
        const now = new Date();
        ttl = now.getTime() + (ttl * 60000);
    }

    const item = {
        value: value,
        expiry: ttl
    }

    localStorage.setItem(key, JSON.stringify(item));

    console.debug("(tdcSetLocalStorage) - Out");
}


/** @function 
 * @name tdcGetLocalStorage 
 * @param {string} key Name of storage
 * @returns {string} Value from storage
 * @description Get value from local storage
*/
function tdcGetLocalStorage(key) {
    console.debug("(tdcGetLocalStorage) ", key);

    const itemStr = localStorage.getItem(key);
    let value = "NotSet";

    if (!itemStr) {
        console.debug("(tdcGetLocalStorage) Key Not Found: ", key);
        return value
    }

    console.info("(tdcGetLocalStorage) itemStr", itemStr);

    if (!
        (itemStr.startsWith('{') && itemStr.endsWith('}')) ||
        (itemStr.startsWith('|') && itemStr.endsWith('|'))
    ) {
        console.debug("(tdcGetLocalStorage) NoJson");
        return itemStr;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();
    const itemExpire = item?.expiry || 0;

    console.debug("(tdcGetLocalStorage) item", item);
    console.debug("(tdcGetLocalStorage) itemExpire", itemExpire);

    if (itemExpire !== 0 && now.getTime() > itemExpire) {
        // If the item is expired, delete the item from storage and return NotSet
        localStorage.removeItem(key);
        console.debug("(tdcGetLocalStorage) Key Expired", key);
        return "NotSet";
    }

    value = item.value;
    console.debug(`(tdcGetLocalStorage) ${key}: ${value}`);

    console.debug("(tdcGetLocalStorage) - Out");

    return value;
}


/** @function 
 * @name getFavoritesArr 
 * @async
 * @return {Array} favoritesEmpArr
 * @description Get array of favorites for agent
*/
const getFavoritesArr = async () => {
    console.debug("getFavoritesArr - In");

    if (localStorage.getItem('nd_puzzel_favo_que')) {
        let favoritesQueArrTmp = JSON.parse(localStorage.getItem('nd_puzzel_favo_que'));
        Object.assign(favoritesQueArr, favoritesQueArrTmp);
        console.info("getFavoritesArr favoritesQueArr", favoritesQueArr);
    }

    if (localStorage.getItem('nd_puzzel_favo_emp')) {
        let favoritesEmpArrTmp = JSON.parse(localStorage.getItem('nd_puzzel_favo_emp'));
        Object.assign(favoritesEmpArr, favoritesEmpArrTmp);
        console.info("getFavoritesArr favoritesEmpArr", favoritesEmpArr);
    }

    console.debug("getFavoritesArr - Out");
}


/** @function 
 * @name favoriteChangedQue 
 * @param {string} itemId ID for clicked row
 * @param {boolean} add ID for clicked row
 * @description Favorite state changed on row in Queue overview
*/
function favoriteChangedQue(itemId, add) {
    console.debug("favoriteChangedQue In");

    if (!localStorageAvailableBol) {
        console.warn("favoriteChangedQue localStorage not avaiable");
        return;
    }

    if (add) {
        //Add Favorite
        if (!favoritesQueArr.includes(itemId)) {
            favoritesQueArr.push(itemId);
        }
        console.info("favoriteChangedQue Add", favoritesQueArr);
    }
    else {
        //Remove Favorite
        var indexFound = favoritesQueArr.indexOf(itemId);
        if (indexFound !== -1) {
            favoritesQueArr.splice(indexFound, 1);
        }
        console.info("favoriteChangedQue Remove", favoritesQueArr);
    }


    localStorage.setItem('nd_puzzel_favo_que', JSON.stringify(favoritesQueArr));

    console.debug("(favoriteChangedQue) Out");
}


/** @function 
 * @name favoriteChangedEmp 
 * @async
 * @param {object} data Row data
 * @description Favorite state changed on row in Phonebook overview
*/
const favoriteChangedEmp = async (data) => {
    console.debug("(favoriteChangedEmp) In");
    console.info("(favoriteChangedEmp) data", data);
    let userId = data.id.toString();

    //Add Favorite
    if (data.favorite) {
        if (!favoritesEmpArr.includes(userId)) {
            favoritesEmpArr.push(userId);
        }

        let indexFound = ndUserFavoritesArr.findIndex(x => x.id === userId);
        if (indexFound === -1) {
            let ndUser = "";
            switch (custObj.customerKey) {
                case "2647119":  //Region H
                    ndUser = await getUserFromCBAS(data.id);
                    break;
                default:
                    ndUser = await getUserFromPuzzel(data.id);
                    break;
            }
            ndUserFavoritesArr.push(ndUser);
        }

        console.info("(favoriteChangedEmp) Add", favoritesEmpArr);
        console.info("(favoriteChangedEmp) Add", ndUserFavoritesArr);
    }

    //Remove Favorite
    if (!data.favorite) {
        let indexFound = favoritesEmpArr.indexOf(userId);
        if (indexFound !== -1) {
            favoritesEmpArr.splice(indexFound, 1);
        }

        indexFound = ndUserFavoritesArr.findIndex(x => x.id.toString() === userId);
        if (indexFound !== -1) {
            ndUserFavoritesArr.splice(indexFound, 1);
        }

        console.info("(favoriteChangedEmp) Remove", favoritesEmpArr);
        console.info("(favoriteChangedEmp) Remove", ndUserFavoritesArr);
    }


    if (!localStorageAvailableBol) {
        console.warn("(favoriteChangedEmp) localStorage not avaiable");
        return;
    }

    localStorage.setItem('nd_puzzel_favo_emp', JSON.stringify(favoritesEmpArr));

    console.debug("(favoriteChangedEmp) Out");
}


/** @function 
 * @name agentObjActive 
 * @return {boolean} 
 * @description Check if agent is active
*/
function agentObjActive() {
    return !(typeof agentObj == "undefined" || (Object.keys(agentObj).length === 0 && agentObj.constructor === Object))
}


/** @function 
 * @name sendEmail 
 * @param {name} name - Name of Employee
 * @param {email} email Email adresse to receive phone message
 * @description Send email
 * @since 1.0.0.0
*/
function sendEmail(name, email) {
    $("#hrefDummy").attr("href", getEmailMessageString(name, email));
    $('#hrefDummy')[0].click();
    //document.getElementById('emailDummy').click();
    $("#hrefDummy").attr("href", "#");
}


/** @function 
 * @name sendImChat 
 * @param {name} name - Name of Employee
 * @param {email} email Email adresse to receive chat message
 * @param {string} [advanced=false] Advanced chat via teams.microsoft.com
 * @description Start Chat
 * @since 1.0.0.0
*/
function sendImChat(name, email, advanced = false) {
    const number = callObj?.caller || "";

    if (!advanced) {
        $("#hrefDummy").attr("href", `im:${email}`);
        $('#hrefDummy')[0].click();
        $("#hrefDummy").attr("href", "#");
    }
    else {
        let windowFeatures = "left=0, top=0, width=500, height=500, location=no, scrollbars=no, status=no";
        let popupUrl = `https://teams.microsoft.com/l/chat/0/0?users=${email}&topicName=Telefonbesked%0D%0A`;
        popupUrl += `&message=Telefonbesked%0D%0ARing%20til:%20%0D%0ATelefon:%20${number}`;

        let myWindow = window.open(popupUrl, "_blank", windowFeatures);
        setTimeout(function () { myWindow.close() }, 10000);
    }
}


/** @function 
 * @name getEmailMessageString
 * @param {string} name Name of employee
 * @param {string} number Callers phone number
 * @param {string} email Email for employee
 * @return {string} emailURL 
 * @description Returns phone message string to be sent from Outlook
*/
function getEmailMessageString(name, email) {
    const emailURL = []
    const agentName = $('#userInfoName').val();
    const newLine = "%0D%0A";
    const space = "%20";

    let number = callObj?.caller || "";
    //number = "30550517";

    switch (custObj.customerKey) {
        case "454335":  //Scanvaegt
            emailURL.push(`mailto:${email}?Subject=Telefonbesked fra Receptionen`);
            emailURL.push(`&Body=Hej${space}${name}${newLine}${newLine}`);
            emailURL.push(`Vil${space}du${space}ringe${space}til:${space}${newLine}`);
            emailURL.push(`Telefon:${space}${number}${newLine}`);
            emailURL.push(`Angående:${space}${newLine}${newLine}`);
            emailURL.push(`Venlig${space}hilsen,${newLine}${agentName}`);
            break;
        case "454014":  //ITF
            emailURL.push(`mailto:${email}?Subject=Telefonbesked`);
            emailURL.push(`&Body=`);
            emailURL.push(`Vil${space}du${space}ringe${space}til:${space}${newLine}`);
            emailURL.push(`Til${space}orientering:${space}${newLine}`);
            emailURL.push(`${space}${newLine}`);
            emailURL.push(`Navn:${space}${newLine}`);
            emailURL.push(`CPR/CVR/Firma:${space}${newLine}`);
            emailURL.push(`Telefonnummer:${space}${number}${newLine}`);
            emailURL.push(`Vedr:${space}${newLine}${newLine}`);
            emailURL.push(`Øvrige bemærkninger:${space}${newLine}`);

            if (agentObj?.groupName !== "") {
                emailURL.push(`${newLine}Venlig hilsen,${newLine}${agentObj?.groupName}`);
            }
            break;
        case "4517111": //HelsinFor
            emailURL.push(`mailto:${email}?Subject=Telefonbesked`);
            emailURL.push(`&Body=* Telefonbesked *${newLine}${newLine}`);
            emailURL.push(`Du${space}bedes${space}ringe${space}til:${space}${newLine}`);
            emailURL.push(`Telefon:${space}${number}${newLine}`);
            emailURL.push(`Angående:${space}${newLine}${newLine}`);
            break;
        //case "4054040":
        case "4517222": //Munck Gruppen
            emailURL.push(`mailto:${email}?Subject=Telefonbesked`);
            emailURL.push(`&Body=Hej${space}${name}${newLine}${newLine}`);
            emailURL.push(`Du${space}bedes${space}ringe${space}til${space}NAVN${space}`);
            emailURL.push(`på${space}tlf.${space}${number}${newLine}${newLine}`);
            emailURL.push(`Vedr.:${space}${newLine}${newLine}`);
            emailURL.push(`Mvh${newLine}${agentName}${space}i${space}receptionen`);
            break;
        case "454056":  //Odense
            emailURL.push(`mailto:${email}?Subject=Telefonbesked`);
            emailURL.push(`&Body=* Telefonbesked *${newLine}${newLine}`);
            emailURL.push(`Du${space}bedes${space}ringe${space}til:${space}${newLine}`);
            emailURL.push(`Telefon:${space}${number}${newLine}`);
            emailURL.push(`Angående:${space}${newLine}${newLine}`);
            emailURL.push(`Venlig${space}hilsen,%0DKontaktcenter`);
            break;
        default:
            emailURL.push(`mailto:${email}?Subject=Telefonbesked`);
            emailURL.push(`&Body=* Telefonbesked *${newLine}${newLine}`);
            emailURL.push(`Du${space}bedes${space}ringe${space}til:${space}${newLine}`);
            emailURL.push(`Telefon:${space}${number}${newLine}`);
            emailURL.push(`Angående:${space}${newLine}${newLine}`);
            emailURL.push(`Venlig${space}hilsen,%0DOmstillingen`);
            break;
    }

    return emailURL.join('');
}


/** @function 
 * @name getPhoneMessageSignature 
 * @param {emailUrl} email Email adresse to receive phone message
 * @description Add signature to Email phone message string
 * @returns {string}
 * @since 1.0.0.0
*/
function getPhoneMessageSignature(emailUrl) {
    let groupName = agentObj?.groupName || "";

    if (groupName !== "") {
        emailUrl.push(`${newLine}${newLine}`);
        emailUrl.push(`Venlig hilsen,${newLine}`);
        emailUrl.push("groupName");
        return emailUrl;
    }
}


/** @function 
 * @name ndPageReload 
 * @description Check if page reload 
 * @returns {boolean}
 * @since 1.0.0.0
*/
function ndPageReload() {
    //check for window.performance support in browser
    if (window.performance) {
        console.info("(ndPageReload) window.performance OK");

        let navigationType = performance.getEntriesByType("navigation")[0].type;
        console.info("(ndPageReload) navigationType", navigationType);

        return navigationType === "reload";
    }
}


/** @function 
 * @name ndSetButtonsDefault 
 * @description Set button state to default (no call active etc.)
 * @since 1.0.0.0
*/
function ndSetButtonsDefault() {
    $('#callOut').prop('disabled', false);
    $('#callHangup').prop('disabled', true);

    $('#transferPhoneCold').prop('disabled', true);
    $('#transferPhoneWarm').prop('disabled', true);
    $('#transferPhoneCancel').prop('disabled', true);
    $('#transferPhoneWarm2').prop('disabled', true);

    $('#transferPhoneCancel').prop('hidden', true);
    $('#transferPhoneWarm2').prop('hidden', true);
    $('#transferPhoneCold').prop('hidden', false);
    $('#transferPhoneWarm').prop('hidden', false);

    $('#searchInputEmp').val("");
    $("#searchInEmpDD").val("all");
}


/** @function 
 * @name truncText 
 * @param {string} text - Text to be truncated
 * @param {number} limit Max characters
 * @param {string} [sliceMark=""] Tailing marks eg. ' ..'
 * @returns {string}
 * @description Trunc text to given limit
 * @since 1.0.0.0
*/
function truncText(text, limit, sliceMark = "") {
    if (typeof text === "undefined" || text === null) {
        return "";
    }

    if (text.length > limit) {
        return text.slice(0, limit) + sliceMark;
    }
    else {
        return text
    }
}


/** @function 
 * @name filterResult 
 * @param {string[]} ndUsersArr - Array of users / employees
 * @param {string} searchValue - Text to seach for
 * @param {string} filterColumn Column name to filter on
 * @param {boolean} [bSame=false] Perform same value search (eg. same Department)
 * @returns {string[]}
 * @description Filter user result
 * @since 1.0.0.0
*/
function filterResult(ndUsersArr, searchValue, filterColumn, bSame = false) {
    searchValue = searchValue.replaceAll("%", "").replaceAll(",", " ").toLowerCase();
    console.info("(filterResult) ndUsersArr", ndUsersArr);
    console.info("(filterResult) searchValue", searchValue);
    console.info("(filterResult) filterColumn", filterColumn);
    console.info("(filterResult) bSame", bSame);

    var returnedUsersArr = [];
    let bInclude = false;
    const searchWordsArr = searchValue.split(" ");
    console.info("(filterResult) searchWordsArr", searchWordsArr);
    switch (filterColumn) {
        case "name":
            returnedUsersArr = ndUsersArr.filter(function (ndUser) {
                bInclude = false;
                if (bSame) {
                    if (ndUser.fullName.toLowerCase().includes(searchValue)) {
                        bInclude = true;
                    }
                }
                else {
                    $.each(searchWordsArr, function (index, filterText) {
                        if (ndUser.fullName.toLowerCase().includes(filterText.toLowerCase())) {
                            bInclude = true;
                        }
                    });
                }
                return bInclude;
            });
            break;
        default:  //departmentName,info,firstName,lastName, organizationName, searchWords, services, streetAddress, title
            returnedUsersArr = ndUsersArr.filter(function (ndUser) {
                bInclude = false;

                if (bSame) {
                    if (ndUser[filterColumn]?.toLowerCase().replaceAll(",", " ").includes(searchValue)) {
                        bInclude = true;
                    }
                }
                else {
                    $.each(searchWordsArr, function (index, filterText) {
                        if (ndUser[filterColumn]?.toLowerCase().includes(filterText.toLowerCase())) {
                            bInclude = true;
                        }
                    });
                }

                return bInclude;
            });
            break;
    }

    console.info("(filterResult) returnedUsersArr", returnedUsersArr);
    return returnedUsersArr;
}


/** @function 
 * @name filterSearchWord 
 * @param {string[]} usersArr - Array of users / employees
 * @param {string} searchValue - Text to seach for
 * @returns {string[]}
 * @description Filter user result from searchWord [Region Syd]
 * @since 1.0.0.0
*/
function filterSearchWord(usersArr, searchValue) {
    console.debug("(filterSearchWord) In");

    searchValue = searchValue.replaceAll("%", "").replaceAll(",", " ").toLowerCase();
    const searchWordsArr = searchValue.split(" ");

    var returnedUsersArr = [];
    let bInclude = false;

    //returnedUsersArr = filterResult(usersArr, searchValue, "searchWords", true)
    console.info("(filterSearchWord) returnedUsersArr", returnedUsersArr);
    //return;
    returnedUsersArr = usersArr.filter(function (ndUser) {
        console.info("(filterSearchWord) ndUser", ndUser);
        bInclude = false;
        let searchWords = ndUser.searchWords.split("|")[1].toLowerCase().replaceAll(",", " ").replaceAll("|", "");
        console.info("(filterSearchWord) searchWords", searchWords);

        if (searchWords.includes(searchValue)) {
            bInclude = true;
        }
        console.info("(filterSearchWord) bInclude", bInclude);

        return bInclude;
    });
    console.info("(filterSearchWord) returnedUsersArr", returnedUsersArr);
    return returnedUsersArr;

}


/** @function 
 * @name calendarNowMark
 * @description Mark current time in calendar view (vertical line)
 * @since 1.0.0.0
*/
function calendarNowMark() {
    console.debug("CalendarNowMark In");

    const dtNow = new Date();
    let hours = dtNow.getHours();
    console.info("CalendarNowMark hours", hours);

    $('#dCurrentTime').html(moment(dtNow).format("DD-MM-YYYY (dddd)"));

    if (hours < 7) {
        document.querySelector(".dayview-now-marker").style.top = "0px";
        return;
    }

    if (hours > 18) {
        document.querySelector(".dayview-now-marker").style.top = "440px";
        return;
    }

    let minutes = dtNow.getMinutes();
    let minutesQuotient = Math.floor(minutes / 15);
    let markerTop = ((hours - 7) * 40) + (minutesQuotient * 10);

    console.info("CalendarNowMark minutes", minutes);
    console.info("CalendarNowMark minutesQuotient", minutesQuotient);
    console.info("CalendarNowMark markerTop", markerTop);

    document.querySelector(".dayview-now-marker").style.top = markerTop + "px";

    console.debug("CalendarNowMark Out");
}


/** @function 
 * @name resetCalendar
 * @description Reset calendar view to current time/day og remove content
 * @since 1.0.0.0
*/
function resetCalendar() {
    $('#dCurrentTime').html(moment().format("DD-MM-YYYY (dddd)"));
    $('#dCalendar').html("");
    calendarNowMark();
}


/** @function 
 * @name calendarBackForward 
 * @param {number} day - Numbers of days
 * @description Scrolls calendar number of days forth or back 
 * @since 1.0.0.0
*/
function calendarBackForward(day) {
    if (day === 0) {
        getCalendarPuzzelFromId();
        return;
    }

    var currentTime = moment($('#dCurrentTime').html(), "DD-MM-YYYY (dddd)");
    var dtSelectedDay = currentTime.add(day, 'days');

    getCalendarPuzzelFromId(dtSelectedDay);
}


/** @function 
 * @name calculateGridRow 
 * @param {object} calendar - calendar object
 * @description Calculate grid rows based on calendar object
 * @returns {object} 
 * @since 1.0.0.0
*/
function calculateGridRow(calendar) {
    console.debug("calculateGridRow In");
    console.info("(calculateGridRow) calendar", calendar);
    const gridObj = { start: 0, end: 0, isAvailable: calendar.isAvailable, allDay: false };

    if (calendar.durationMinute >= 1440) {
        gridObj.start = 1;
        gridObj.end = 4;
        gridObj.allDay = true;
        return gridObj;
    }

    let startHour = moment(calendar.beginTime).format("H");
    let startMin = moment(calendar.beginTime).format("m");
    startMin = Math.round(startMin / 15);

    let endHour = moment(calendar.endTime).format("H");
    let endMin = moment(calendar.endTime).format("m");
    endMin = Math.round(endMin / 15);

    console.info("(calculateGridRow) startHour", startHour);
    console.info("(calculateGridRow) endHour", endHour);

    if (startHour >= 7 && endHour <= 18) {
        gridObj.start = ((startHour - 7) * 4) + 1 + startMin;
        gridObj.end = ((endHour - 7) * 4) + 1 + endMin;
    }

    console.debug("calculateGridRow Out");
    return gridObj;
}


/** @function 
 * @name getCalendarPuzzelFromId 
 * @param {datetime} dtSelectedDay - Datetime to get calendar data from
 * @description Get calendar appointments for given day from Puzzel
 * @since 1.0.0.0
*/
const getCalendarPuzzelFromId = async (dtSelectedDay = moment()) => {
    console.debug("getCalendarPuzzelFromId In");

    let userId = $('#dFullName').attr("tdcId");

    const fromTime = moment(dtSelectedDay.set({ "hour": 6, "minute": 0, "second": 0 })).format();
    const toTime = moment(dtSelectedDay.set({ "hour": 19, "minute": 0, "second": 0 })).format();

    console.debug("getCalendarPuzzelFromId dtSelectedDay", dtSelectedDay);

    $('#dCurrentTime').html(moment(dtSelectedDay).format("DD-MM-YYYY (dddd)"));

    let apiUrl = puzzelUrl + custObj.customerKey + "/users/" + agentObj.userId + "/catalog/contacts/" + userId + "/appointments?";
    let urlParams = new URLSearchParams({
        from: fromTime,
        to: toTime
    });

    const calendarArr = await puzzelApiCall(apiUrl + urlParams);

    console.info("(getCalendarPuzzelFromId) calendarArr", calendarArr);

    if (calendarArr === null) {
        console.warn("(getCalendarPuzzelFromId) User not found: ", agentObj.userId);
        console.debug("getCalendarPuzzelFromId Out");
        return;
    }

    let calendarAppointmentsArr = [];
    let cellCss = "";
    let truncTextNum = 38;

    if (calendarArr.length > 10) {
        truncTextNum = 10;
    }
    else if (calendarArr.length > 5) {
        truncTextNum = 25;
    }

    $.each(calendarArr, function (index, calendar) {
        const gridObj = calculateGridRow(calendar);
        console.debug("(getCalendarPuzzelFromId) gridObj", gridObj);

        cellCss = (gridObj.allDay) ? "tdcAllDay" : "";
        cellCss = (gridObj.isAvailable) ? cellCss + " tdcFree" : cellCss;

        let titleTmp = `Emne: ${truncText(calendar.subject, 50)}<br>
        Sted: ${calendar.location}`;
        //titleTmp += `<br>Bemærkning: ${calendar.description}`;

        calendarAppointmentsArr.push(
            `<div id="calPop${calendar.id}" class="dayview-cell dayview-cell-extended ${cellCss}" style="grid-row: ${gridObj.start} / ${gridObj.end}" 
            data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip-calendar" data-bs-html="true" data-bs-title="${titleTmp}">
            <div class="dayview-cell-title">${truncText(calendar.subject, truncTextNum)}</div>
            </div>`
        );
    });

    $('#dCalendar').html(calendarAppointmentsArr.join(""));

    setTimeout(() => {
        /* Initialize Tooltips */
        $('[data-bs-custom-class="custom-tooltip-calendar"]').tooltip();

        calendarAppointmentsArr.length = 0;
    }, 250);


    console.debug("getCalendarPuzzelFromId Out");
}


/** @function 
 * @name getUserFromPuzzel 
 * @param {number} userId - Puzzel user id
 * @description Get Puzzel user object from id
 * @returns {object}
 * @since 1.0.0.0
*/
const getUserFromPuzzel = async (userId = "") => {
    console.debug("(getUserFromPuzzel) In");

    var ndUser = { statusText: "" };

    let apiUrl = puzzelUrl + custObj.customerKey + "/users/" + agentObj.userId + "/catalog/contacts/" + userId;

    let response = await puzzelApiCall(apiUrl);
    console.info("(getUserFromPuzzel) response", response);

    if (typeof response === "undefined" || response === null) {
        /* User Not Found */
        console.warn("(getUserFromPuzzel) User NotFound", userId);
        ndUser.statusText = "NotFound";
        return ndUser;
    }

    ndUser = parsePuzzelUserResponse(response)
    console.info("(getUserFromPuzzel) ndUser", ndUser);

    console.debug("(getUserFromPuzzel) Out");
    return ndUser;
}


/** @function 
 * @name getUserFromCBAS 
 * @param {string} userId - CBAS user id
 * @description Get CBAS user object from id
 * @returns {object}
 * @since 1.0.0.0
*/
const getUserFromCBAS = async (userId) => {
    console.debug("(getUserFromCBAS) In");
    console.info("(getUserFromCBAS) userId", userId);

    var ndUser = { statusText: "" };

    let bodyObj =
    {
        searchItems: [userId],
        searchColumnSetId: 9,
        organizationIds: [0],
        phoneticFlag: 1,
        maximumRows: 100
    };

    let response = await cbasApiCall("POST", JSON.stringify(bodyObj));
    console.info("(getUserFromCBAS) response", response);

    if (typeof response === "undefined" || response === null || response.length === 0) {
        /* User Not Found */
        console.warn("(getUserFromCBAS) User NotFound", userId);
        ndUser.statusText = "NotFound";
        return ndUser;
    }

    ndUser = parseCbasUserResponse(response[0])
    console.info("(getUserFromCBAS) ndUser", ndUser);

    console.debug("(getUserFromCBAS) Out");
    return ndUser;
}


/** @function 
 * @name getUserFromAzure 
 * @param {object} ndUser - ndUser object
 * @param {boolean} [bSimple=false] - Return simple response
 * @description Get user information from Azure
 * @returns {object}
 * @since 1.0.0.0
*/
const getUserFromAzure = async (ndUser, bSimple = false) => {
    console.debug("(getUserFromAzure) In");

    var ndUserAzure = { statusText: "" };
    let orgPath = getOrgPath(ndUser.organizationPath);

    let apiRequestNd = await fetch(`${ndBuddyUrl}User/?email=${ndUser.email}&customerKey=${custObj.customerKey}&orgPath=${orgPath}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.info("(getUserFromAzure) apiRequestNd", apiRequestNd);

    if (bSimple) {
        return apiRequestNd;
    }

    if (!apiRequestNd.ok) {
        /* Error in connecting to API */
        console.warn("(getUserFromAzure) API Error", ndUser.email);
        ndUserAzure.statusText = "NotFound";
        return ndUserAzure;
    }

    let responseJson = await apiRequestNd.json();
    console.info("(getUserFromAzure) responseJson", responseJson);

    if (responseJson === null) {
        /* User Data Not Found */
        ndUserAzure.statusText = "NotFound";
        console.warn("(getUserFromAzure) User NotFound", ndUser.email);
        return ndUserAzure;
    }

    ndUserAzure = parseDataFromAzure(responseJson, ndUser)
    console.info("(getUserFromAzure) ndUserAzure", ndUserAzure);

    console.debug("getUserFromAzure Out");

    return ndUserAzure;
}


/** @function 
 * @name ndGetSpaces 
 * @param {number} number - Number for spaces
 * @returns {string}
 * @description Get number of spaces as string
 * @since 1.0.0.0
*/
function ndGetSpaces(number) {
    let text = "";

    for (let i = 0; i < number; i++) {
        text += "&nbsp;";
    }
    return text;
}


/** @function 
 * @name clearSearchAndDetail 
 * @param {string} [eventName=""] - Eventname to clear on
 * @description Clear search and detail view
 * @since 1.0.0.0
*/
function clearSearchAndDetail(eventName = "") {
    console.info("(clearSearchAndDetail) eventName", eventName);

    $('#phoneInput').val("");
    ndEnableSearchBox(-9);

    if (eventName === "HANGUP") {
        let tabSetting = $("#settingHangupTabDD").val();
        console.info("(clearSearchAndDetail) settingHangupTabDD", tabSetting)
        if (tabSetting !== "DISABLED") {
            setActiveTab(tabSetting);
        }
    }

    if (eventName === "ESCAPE") {
        let tabSetting = $("#settingEscapeTabDD").val();
        console.info("(clearSearchAndDetail) settingEscapeTabDD", tabSetting)
        if (tabSetting !== "DISABLED") {
            setActiveTab(tabSetting);
        }
    }

    let activeTab = getActiveTab();
    switch (activeTab) {
        case "navItemQueues":
            $('#searchInputQue').val("");
            ndRequestQueues();
            break;
        case "navItemEmployees":
            $('#searchInputEmp').val("");
            $("#searchInEmpDD").val("all");
            $("#searchingLblEmp").html('');
            clearEmployeeGrid();
            clearDetailView();
            break;
        case "navItemFavorites":
            initializeFavorites();
            $('#searchInputFav').val("");
            FavoritesDT.search("").draw();
            FavoritesDT.columns.adjust();
            break;
    }
    console.info("(clearSearchAndDetail) activeTab", activeTab)

    ndFocusSearchBox(0, getInputBoxFromActiveTab());
}


/** @function 
 * @name checkForHyperlinks
 * @param {string} text - Text to look in 
 * @param {string} [markupChar=""] - Empty or '#'
 * @description Check for hyperlink markup in text
 * @since 1.0.0.0
*/
function checkForHyperlinks(text, markupChar = "") {
    console.debug("(checkForHyperlinks) In");
    let markupCharStart = (markupChar === "") ? "<a>" : markupChar;
    let markupCharEndEnd = (markupChar === "") ? "</a>" : markupChar;
    let sliceSizeStart = (markupChar === "") ? 3 : 1;
    let sliceSizeEnd = (markupChar === "") ? 4 : 1;

    const returnObj = {
        formattedText: text,
        reminderText: "",
        lastIndex: -9,
    };

    let searchValue = $("#searchInputEmp").val().trim().replaceAll("+", "").replaceAll("-", "");

    let _startIndex = text.indexOf(markupCharStart);
    if (_startIndex != -1) {
        lastIndex = -1;
        let _endIndex = text.indexOf(markupCharEndEnd, _startIndex + 1);

        if (_endIndex != -1) {
            let firstHalf = text.slice(0, _startIndex);
            let secondHalf = text.slice(_endIndex + sliceSizeEnd);
            let urlText = text.slice(_startIndex + sliceSizeStart, _endIndex);
            let urlRef = (urlText.includes("http")) ? urlText : `https://${urlText}`;

            returnObj.formattedText = firstHalf + `<a href="${urlRef}" target="_blank">

            ${urlText
                    .toLowerCase()
                    .replace("http://", "")
                    .replaceAll("https://", "")}</a >`;

            returnObj.reminderText = secondHalf;
            returnObj.lastIndex = _endIndex + sliceSizeEnd;
        }
    }

    console.debug("(checkForHyperlinks) Out");
    return returnObj;
}


/** @function 
 * @name tdcFormatHighlightText
 * @param {string} text - Text to look into
 * @returns {string}
 * @description Format and hightligh text based on search Value
 * @since 1.0.0.0
*/
function tdcFormatHighlightText(text) {
    console.info("(tdcFormatHighlightText) In");

    let returnText = "";
    let searchValue = $("#searchInputEmp").val().trim().replaceAll("+", "").replaceAll("-", "");

    var returnObj = { reminderText: text, lastIndex: 0 };

    if (text.includes("<a>")) {
        while (returnObj.lastIndex >= 0) {
            returnObj = checkForHyperlinks(returnObj.reminderText);
            returnText += returnObj.formattedText;
        }
        returnObj.reminderText = returnText;
        returnObj.lastIndex = 0;
    }

    if (text.includes("#")) {
        returnText = "";

        while (returnObj.lastIndex >= 0) {
            returnObj = checkForHyperlinks(returnObj.reminderText, "#");
            returnText += returnObj.formattedText;
        }
    }

    if (returnText === "") {
        returnText = text;
    }
    if (text.includes(searchValue)) {

        returnText = returnText.replace(new RegExp(searchValue, 'gi'), '<mark>$&</mark>');
    }
    returnText = returnText.trim().replace(/(^(<br>)+)|((<br>)+$)/g, '')  //Remove first row <br>

    console.info("(tdcFormatHighlightText) returnText", returnText);
    console.debug("(tdcFormatHighlightText) Out");

    return returnText;
}


/** @function 
 * @name transferTypeMark
 * @param {string} [type=""] - Empty or 'warm"'
 * @description Change transfer type markup color
 * @since 1.0.0.0
*/
function transferTypeMark(type = "") {
    if (type === "") {
        type = $('#settingTransferTypeDD').val();
    }

    if (type === "warm") {
        $('.thPhone').addClass("ndColorLightRed");
        $("tr.selected").addClass("Warm");
    }
    else {
        $('.thPhone').removeClass("ndColorLightRed");
        $("tr.selected").removeClass("Warm");
    }
}


/** @function 
 * @name ndFocusSearchBox
 * @param {number} [timeout=0] - Delay in seconds before focus is given
 * @param {string} [inputBox="searchInputEmp"] - Name of control to receive focus
 * @returns {number}
 * @description Set focus on inputbox
 */
function ndFocusSearchBox(timeout = 0, inputBox = "searchInputEmp") {
    console.info("(ndFocusSearchBox) inputBox", inputBox);
    let timeoutId = 0;

    switch (timeout) {
        case 0:
            $('#' + inputBox).trigger('focus');
            break;
        case -1:
            $('#searchInputQue').trigger('blur');
            $('#phoneInput').trigger('blur');
            $('#searchInputQue').trigger('blur');
            $('#searchInputEmp').trigger('blur');
            $('#searchInputFav').trigger('blur');
            break;
        default:
            timeoutId = setTimeout(() => {
                if (callObj.callProgress !== "HANGUP" && callObj.callProgress !== "ABORTED") {
                    $('#' + inputBox).trigger('focus');
                }
            }, timeout * 1000);
    }

    return timeoutId;
}


/** @function 
 * @name ndEnableSearchBox
 * @param {number} [timeout=0] - Delay in seconds before control is enabled
 * @param {string} [inputBox="searchInputEmp"] - Name of control to be enabled
 * @description Enable inputbox
 */
function ndEnableSearchBox(timeout = 0, inputBox = "searchInputEmp") {
    console.debug("(ndEnableSearchBox) In");

    console.info("(ndEnableSearchBox) inputBox", inputBox);

    if (timeout === 0) {
        $('#' + inputBox).prop('disabled', false);
        return;
    }

    if (timeout === -1) {
        $('#searchInputQue').prop('disabled', true);
        $('#phoneInput').prop('disabled', true);
        $('#searchInputEmp').prop('disabled', true);
        $('#searchInputFav').prop('disabled', true);
        return;
    }

    if (timeout === -9) {
        $('#searchInputQue').prop('disabled', false);
        $('#phoneInput').prop('disabled', false);
        $('#searchInputEmp').prop('disabled', false);
        $('#searchInputFav').prop('disabled', false);
        return;
    }

    if (timeout <= -9) {
        setTimeout(() => {
            $('#searchInputQue').prop('disabled', false);
            $('#phoneInput').prop('disabled', false);
            $('#searchInputEmp').prop('disabled', false);
            $('#searchInputFav').prop('disabled', false);
        }, (Math.abs(timeout) - 10) * 1000);
        return;
    }

    setTimeout(() => {
        $('#' + inputBox).prop('disabled', false);
    }, timeout * 1000);

    console.debug("(ndEnableSearchBox) Out");
}


/** @event
 * @name favoritesExport
 * @description Exports favorites to csv file
 */
function favoritesExport() {
    console.log("favoritesExport In");

    let tempLink = document.createElement("a");
    let text = favoritesEmpArr;
    let textBlob = new Blob([text], { type: 'text/plain' });

    tempLink.setAttribute('href', URL.createObjectURL(textBlob));
    tempLink.setAttribute('download', `puzzel_favorites_${agentObj.userId}.buddy`);
    tempLink.click();

    setTimeout(function () {
        URL.revokeObjectURL(tempLink.href)
    }
        , 1000);

    console.log("favoritesExport Out");
}


/** @event
 * @name favoritesImportSelectedFile
 * @async
 * @param {string} text - Test to import favorites from
 * @description Import favorites from string
 */
const favoritesImportSelectedFile = async (text) => {
    console.debug("(favoritesImportSelectedFile In", text);
    let favoritesImportedArr = text.split(',');

    $.each(favoritesImportedArr, function (index, favorite) {
        if (!favoritesEmpArr.includes(favorite)) {
            favoritesEmpArr.push(favorite);
        }
    });
    console.debug("(favoritesImportSelectedFile favoritesEmpArr", favoritesEmpArr);
    await buildFavoritesList();

    $('#tableFavId').DataTable().clear().rows.add(ndUserFavoritesArr).draw();
    FavoritesDT.columns.adjust();
    FavoritesDT.cell(':eq(0)', colIndexObj.name).focus();

    localStorage.setItem('nd_puzzel_favo_emp', JSON.stringify(favoritesEmpArr));
}


/** @function 
 * @name urlExists
 * @param {string} url - Url
 * @returns {boolean}
 * @description Check if url exists
 * @since 1.0.0.0
*/
function urlExists(url) {
    console.debug("(urlExists) In");
    var http = new XMLHttpRequest();

    http.open('GET', url, false);
    http.send();

    console.info("(urlExists) httpStatus", http.status);
    console.debug("(urlExists) Out");

    return (http.status != 404)
}


/** @function 
 * @name getOrgPath
 * @param {string} organizationPath - Organization path
 * @returns {string}
 * @description Get org path form customer key
 * @since 1.0.0.0 
*/
function getOrgPath(organizationPath) {
    let orgPath = "DEFAULT";

    switch (custObj.customerKey) {
        case "454014":  //IT-Forsyningen
            orgPath = organizationPath.split("|")[2] || "";
            orgPath = orgPath.replaceAll(" ", "_");
            break;
    }

    return orgPath;
}


/** @function 
 * @name writeClipboardText
 * @async
 * @param {string} text - Text to write
 * @description Write text to clipboard
 * @since 1.0.0.0 
*/
async function writeClipboardText(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.debug("(writeClipboardText) OK");
    }
    catch (error) {
        console.error("(writeClipboardText) Error", error.message);
    }
}


/** @function 
 * @name addTextToControl
 * @param {string} controlName - Name of control
 * @param {string} textToAdd - Text to add
 * @param {boolean} [bNewLine=true] - Add text on new line
 * @description Add text to text area
 * @since 1.0.0.0 
*/
function addTextToControl(controlName, textToAdd, bNewLine = true) {
    let linebreak = (bNewLine) ? "\n" : "";
    let control = $("#" + controlName);
    let currentValue = control.val();
    let newValue = currentValue + linebreak + textToAdd;
    control.val(newValue);
}


/** @function 
 * @name solteqPopup
 * @param {cprNumber} text - CPR number
 * @description Popup Solteq from CPR number
 * @since 1.0.0.0 
*/
function solteqPopup(cprNumber) {
    console.debug("solteqPopup In");

    let url = "http://localhost:1100/openpatient?patientCpr=" + cprNumber;

    var xhr = new XMLHttpRequest();
    xhr.onerror = (event) => {
        console.error("solteqPopup Error", event);
    };

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.info("solteqPopup response", this.responseText);
        }
    }

    try {
        xhr.open("GET", url, false);
        xhr.send();
    }
    catch (exception) {
        console.error("solteqPopup exception", exception)
    }

    console.debug("solteqPopup Out");
}



/** @function 
 * @name ndTooltip 
 * @param {string} control - Name of control
 * @param {string} [text=""] - Text to show
 * @returns {void}
 * @description Configure Bootstrap Tooltip
*/
function ndTooltip(control, text = "") {
    const _control = "#" + control;
    const tooltipTeams = bootstrap.Tooltip.getInstance(_control);

    if (text !== "") {
        $(_control).addClass("tdcLink");
        tooltipTeams.enable();
        tooltipTeams.setContent({ '.tooltip-inner': text });
    }
    else {
        $(_control).removeClass("tdcLink");
        tooltipTeams.disable();
        tooltipTeams.setContent({ '.tooltip-inner': " " });
    }
}


/** @function 
 * @name copyTextToClipboardOld 
 * @param {string} controlId - ID of control to copy from
 * @description Copy data from control to clipboard
*/
function copyTextToClipboardOld(controlId) {
    let returnValue = false;
    let controlObj = document.getElementById(controlId);

    controlObj.focus();
    controlObj.select();

    try {
        returnValue = document.execCommand('copy');
    }
    catch (error) {
        console.error('(copyTextToClipboardOld) Error', error);
    }

    console.info('(copyTextToClipboardOld) returnValue', returnValue);

    return returnValue;
}


/** @function 
 * @name tdcFullscreen 
 * @description Fullscreen
*/
function tdcFullscreen() {
    console.debug("tdcFullscreen");
    var elem = document.getElementById("bodyId");
    elem.requestFullscreen();
}


/** @function 
 * @name calendarShow 
 * @param {boolean} show
 * @description Show or hide calendar
*/
function calendarShow(show) {
    console.debug("calendarShow In");

    if (show) {
        $("#calendarContainer").removeClass("ndHide");
        $("#infoContainerHeader_ID").html("Kalenderaftaler");
        $("#infoContainer").addClass("ndHide");
    }
    else {
        $("#calendarContainer").addClass("ndHide");
        $("#infoContainerHeader_ID").html("Noter");
        $("#infoContainer").removeClass("ndHide");
    }

    console.debug("calendarShow Out");
}


/** @function 
 * @name prefixLocalNumber 
 * @param {number} number
 * @returns {string}
 * @description Transform 5-digit extension to 8-digit phonernumber [Reg Syd]
*/
function prefixLocalNumber(number) {
    console.info("(prefixLocalNumber) In", number);

    /* Alarm numbers */

    if (number === "112") {
        return "0045112";
    }

    if (number === "114") {
        return "0045114";
    }

    if (custObj.customerKey === "45524905" && number.toString().length === 5) {
        if (number === 11069) {
            number = "51409002";
            return number;
        }

        /* Odense */
        if (number >= 11000 && number <= 17999) {
            number = "6541" + number.toString().slice(1);
            return number;
        }

        /* Svendborg */
        if (
            (number >= 21000 && number <= 22799) ||
            (number >= 23300 && number <= 23399) ||
            (number >= 24900 && number <= 24999) ||
            (number >= 25170 && number <= 25199) ||
            (number >= 25200 && number <= 25899)
        ) {
            number = "6320" + number.toString().slice(1);
            return number;
        }

        /* Nyborg */
        if (
            (number >= 22800 && number <= 22999) ||
            (number >= 24800 && number <= 24899)
        ) {
            number = "6331" + number.toString().slice(1);
            return number;
        }

        /* Ærø */
        if (number >= 21400 && number <= 21499) {
            number = "6352" + number.toString().slice(1);
            return number;
        }

        /* Sygehus lillebælt 1 */
        if (number >= 60000 && number <= 63499) {
            number = "7636" + number.toString().slice(1);
            return number;
        }

        /* Sygehus lillebælt 2 */
        if (number >= 64000 && number <= 64799) {
            number = "6348" + number.toString().slice(1);
            return number;
        }

        /* Sygehus lillebælt 3 */
        if (
            (number >= 65000 && number <= 66999) ||
            (number >= 69000 && number <= 69999)
        ) {
            number = "7940" + number.toString().slice(1);
            return number;
        }

        switch (number.toString().substring(0, 3)) {
            case "397":
                return "764" + number;
        }

        switch (number.toString().substring(0, 1)) {
            case "1":
                return "654" + number;
            case "2":
                return "654" + number;
            case "3":
                return "766" + number;
            case "4":
                return "994" + number;
            case "6":
                return "763" + number;
            case "7":
                return "799" + number;
            case "8":
                return "791" + number;
        }
    }
    console.info("(prefixLocalNumber) Out", number);
    return number;
}


/** @function 
 * @name setShownRows 
 * @description Reinitialize datatable based on shown rows setting
*/
function setShownRows() {
    console.debug("setShownRows In");

    $('#tableEmpId').DataTable().destroy();
    ndDataTableInit("#tableEmpId");

    setWindowHeight();

    console.debug("setShownRows Out");
}


/** @function 
 * @name getActiveTab 
 * @returns {string}
 * @description Get name of active Tab
*/
function getActiveTab() {
    let activeTabId = $('a.nav-link.active').attr("id");
    console.info("(getActiveTab) activeTabId", activeTabId);
    return activeTabId;
}


/** @function 
 * @name setActiveTab
 * @param {string} tabName - Name of tab
 * @description Set active tab
*/
function setActiveTab(tabName) {
    console.debug("setActiveTab", tabName);
    $('a.nav-link.active').removeClass('active');
    $('div.tab-pane.active').removeClass('active');

    $('#navItem' + tabName).addClass('active');
    $('#' + tabName).addClass('active');

    ndFocusSearchBox(0.2, 'searchInput' + tabName.slice(0, 3));
}


/** @function 
 * @name getInputBoxFromActiveTab
 * @returns {string}
 * @description Get inputbox from active tab
*/
function getInputBoxFromActiveTab() {
    console.debug("(getInputBoxFromActiveTab) In");
    let activeTabId = getActiveTab();

    switch (activeTabId) {
        case "navItemQueues":
            return "searchInputQue";
        case "navItemEmployees":
            return "searchInputEmp";
        case "navItemFavorites":
            return "searchInputFav";
    }
}


/** @function 
 * @name getPrevNextTab
 * @param {string} direction - LEFT / RIGHT
 * @returns {string}
 * @description Activate previous or next tab
*/
function getPrevNextTab(direction) {
    console.debug("(getPrevNextTab) In");
    let activeTabId = getActiveTab();

    switch (activeTabId) {
        case "navItemQueues":
            return (direction === "RIGHT") ? "Employees" : "Favorites";
        case "navItemEmployees":
            return (direction === "RIGHT") ? "Favorites" : "Queues";
        case "navItemFavorites":
            return (direction === "RIGHT") ? "Queues" : "Employees";
    }
}


/** @function 
 * @name ndGetAggStatusForQueue 
 * @param {object} rowData RowData
 * @returns {object}
 * @description Get aggregated presence from rowData
*/
function ndGetAggStatusForQueue(rowData) {
    console.info("(ndGetAggStatusForQueue) rowData", rowData);
    const returnObj = { title: "Ukendt", color: "Gray" };

    if (rowData.nodeId === "") {
        returnObj.title = "Ikke muligt at stille om"
        returnObj.color = "LightGray"
        return returnObj;
    }

    if (rowData.agentsLoggedOn === 0) {
        returnObj.title = "Ingen påloggede agenter"
        returnObj.color = "Gray"
        return returnObj;
    }

    if (rowData.agentsReady === 0) {
        returnObj.title = "Ingen ledige agenter"
        returnObj.color = "Yellow"
        return returnObj;
    }

    returnObj.title = "Ledig agent"
    returnObj.color = "Green"
    return returnObj;
}


/** @function 
 * @name clearCallObject 
 * @description Clear call object
*/
async function clearCallObject() {
    console.debug("(clearCallObject) In");

    Object.keys(callObj).forEach(key => {
        delete callObj[key];
    })
    callObj.callProgress = "HANGUP";

    console.debug("(clearCallObject) Out");
}


/** @function 
 * @name tdcGetPrimaryNumber 
 * @param {string} data - User data 
 * @param {string} [shiftDown=false] - Check for shift down
 * @returns {number}
 * @description Get primary number from user
*/
function tdcGetPrimaryNumber(data, shiftDown = false) {
    console.debug("(tdcGetPrimaryNumber) In");

    let number = "";
    if (data.phone !== "" && data.mobile === "") {
        number = data.phone;
    }

    if (data.phone === "" && data.mobile !== "") {
        number = data.mobile;
    }

    if (number === "") {
        let defaultNumber = $("#settingTransferPhoneDD").val();
        /* Shift Down */
        if (shiftDown) {
            defaultNumber = (defaultNumber === "phone") ? "mobile" : "phone";
        }

        number = data[defaultNumber];
    }

    console.info("(tdcGetPrimaryNumber) number", number);
    console.debug("(tdcGetPrimaryNumber) Out");

    return number;
}


/** @function 
 * @name setWindowHeight 
 * @param {string} [bFullscreen=false] - Check for fullsceen 
 * @param {string} [bRecalculate=true] - Recalculate
 * @description Set windows height
*/
function setWindowHeight(bFullscreen = false, bRecalculate = true) {
    console.debug("(setWindowHeight) In");

    //let width = window.innerWidth;
    let height = window.innerHeight;
    let shownRowsSetting = $("#settingShownRowsDD").val() || "";

    if (shownRowsSetting === "") {
        console.warn("(setWindowHeight) shownRowsSetting blank");
        shownRowsSetting = 6;
        $("#settingShownRowsDD").val(6);
    }

    let scrollY = 179 + (shownRowsSetting - 6) * 30;

    console.info("(setWindowHeight) bFullscreen", bFullscreen);
    console.info("(setWindowHeight) height", height);
    console.info("(setWindowHeight) scrollY", scrollY);

    let finalHeight = height - 200 - scrollY;
    console.info("(setWindowHeight) finalHeight", finalHeight);

    if (finalHeight < 250) {
        if (bRecalculate) {
            setTimeout(setWindowHeight, 1000, false, false)
            console.debug("(setWindowHeight) Recalculate");
            return;
        }

        finalHeight = 250;
        console.debug("(setWindowHeight) less than 250");
    }

    $("#detailView").height(finalHeight + "px");
    let div = document.getElementById('detailView');

    if (finalHeight < 533) {
        $("#detailView").width("1114px");
    }
}


/** @function 
 * @name placeSearchWordRow 
 * @param {string} [placement=BOTTOM] - TOP / BOTTOM
 * @description Place searchword row in detail view
*/
function placeSearchWordRow(placement = "BOTTOM") {
    console.debug("(placeSearchWordRow) In");

    let control = (placement === "TOP") ? "phoneHoursRowLine" : "detailMasterLine";
    console.info("(placeSearchWordRow) placement", placement);

    let htmlContent = $("#searchWordRow").html();

    $('#searchWordRow').remove();
    $('#searchWordRowLine').remove();

    $('table > tbody > tr#' + control).after(`<tr id="searchWordRow">${htmlContent}</tr>`);

    let html = `<tr id="searchWordRowLine"><td colspan="5" class="ndd nddUnderline"></td></tr>`

    $('table > tbody > tr#searchWordRow').after(html);

    console.debug("(placeSearchWordRow) Out");
}


/** @function 
 * @name tdcLoadPhoneTemplateText 
 * @description Load content into phone message modal
*/
function tdcLoadPhoneTemplateText() {
    console.debug("(tdcLoadPhoneTemplateText) Out");

    let selectedTemplate = $("#phoneMessageTemplateDD").val();
    let templateObj = phoneTemplatesArr[selectedTemplate];

    let subjectText = templateObj.subject;
    let bodyText = templateObj.bodyText.join("\n");
    let signatureText = templateObj.signature.join("\n");

    subjectText = tdcPhoneTemplateReplaceVariables(subjectText);
    bodyText = tdcPhoneTemplateReplaceVariables(bodyText);
    signatureText = tdcPhoneTemplateReplaceVariables(signatureText);

    $("#phoneMessageSubjectTxt").val(subjectText);
    $("#phoneMessageBodyTxt").text(bodyText + signatureText);

    console.debug("(tdcLoadPhoneTemplateText) Out");
}


/** @function 
 * @name tdcPhoneTemplateReplaceVariables 
 * @param {string} content - Text content
 * @returns {string}
 * @description Replace variables in phone message with content
*/
function tdcPhoneTemplateReplaceVariables(content) {
    /* Dummy Data */
    callObj.caller = "44358336";
    agentObj.groupName = "ALL Tandplejen";
    let fullName = "Jacob Hansen"

    returnText = content
        .replaceAll("{callObj.caller}", callObj.caller)
        .replaceAll("{agentObj.groupName}", agentObj.groupName)
        .replaceAll("{fullName}", fullName);
    return returnText;
}


/** @function 
 * @name tdcIsObjectEmpty 
 * @param {string} objectName - Text content
 * @returns {boolean}
 * @description Check if object is empty
*/
const tdcIsObjectEmpty = (objectName) => {
    return (
        objectName &&
        Object.keys(objectName).length === 0 &&
        objectName.constructor === Object
    );
};


/** @function 
 * @name buildDynamicRow 
 * @param {string} rowHeader - Header name
 * @param {string} cellId - Cell Id, eq. Misc1
 * @param {string} rowAfter - Id of existing row
 * @description Insert new row in detail view
*/
function buildDynamicRow(rowHeader, cellId, rowAfter) {
    let row =
        `<tr>
            <td class="ndd ndCenter">${rowHeader}</td>
            <td colspan="4" tabindex="-1" class="ndd ndCenter">
                <span id="${cellId}">&nbsp;</span>
            </td>
        </tr>`

    $('table > tbody > tr#' + rowAfter).after(row);
}


/** @function
 * @name ClearHTMLTagsSimple
 * @param {string} strToSanitize - String to be sanitized
 * @returns {string} - Sanitized plain text string
 * @description Returns a string containing plain text format by removing HTML tags
*/
const ClearHTMLTagsSimple = (strToSanitize) => {
    return strToSanitize.replace(/(<([^>]+)>)/gi, '');
}

/** @function
 * @name ClearHTMLTags
 * @param {string} strToSanitize - String to be sanitized
 * @returns {string} - Sanitized plain text string
 * @description Returns a string containing plain text format by removing HTML tags
*/
const clearHTMLTags = (strToSanitize) => {
    try {
        let myHTML = new DOMParser().parseFromString(strToSanitize, "text/html");
        return myHTML.body.textContent || strToSanitize;
    } catch (error) {
        console.warning("(clearHTMLTags) Error parsing HTML string", error);
        return strToSanitize;
    }
}