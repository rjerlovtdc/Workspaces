/**
 * @module ndStart
 */
"use strict";

// #region Global Variables
const versionObj = { ndstart: 37 };
const versionAll = "3.4.5.4";

const puzzelUrl = "https://api.puzzel.com/ContactCentre5/";
const webexUrl = "https://netdesign-buddy-dev.northeurope.cloudapp.azure.com:8443/WebExBackend/api/";
const apiUrlCbas = "https://omstilling.service.cbas.regionh.top.local/api/PhoneBook";

var ndBuddyUrl = "https://netdesign-buddy-prod.northeurope.cloudapp.azure.com:8443/api/";

const custLayoutObj = { fullNameWidth: 25 }
const colIndexObj = {}, callObj = { callProgress: "HANGUP" };
const favoritesQueArr = [], favoritesEmpArr = [];
var shownQueuesArr = [], hideQueuesArr = [], alarmQueuesArr = [], waitTimeThresholdsArr = [];
var serviceLabelsArrG = [], phoneTemplatesArr = [];
var searchWordLength = 3, ciscoFinesse = false;

var api;

var localStorageAvailableBol = true;

var nodeIdsMapDic = new Map(), queueIdsMapDicG = new Map(), parkQueuesDic = new Map();
var serviceLabelsMapG = new Map(), serviceLabelsUserMapG = new Map();

var msToken = "", myDomain = "", testingConfig = "";
var miscRowsArr = [];

/**
 * @typedef {Object} custObj
 * @property {number} customerKey - Puzzel customer key
 * @property {number} customerId - Puzzel customer id
 * @property {string} accessToken - Cached access token
 * @property {boolean} [azureAd=true"] - Integrated with Azure AD
 * @property {string} UserName - Username for testing
 * @property {string} Password - Password for testing
 * @property {string} [msalConfig="DEFAULT"] - Teams delegated config
 */
const custObj = {
    customerKey: "",
    customerId: "",
    accessToken: "",
    azureAd: true,
    UserName: "",
    Password: "",
    msalConfig: "DEFAULT"
}


/**
 * @typedef {Object} agentObj
 * @property {number} userId - User id
 * @property {string} userName - Puzzel customer id
 * @property {string} firstName - Cached access token
 * @property {string} lastName - Username for testing
 * @property {string} groupName - Password for testing
 * @property {string} eMail - Password for testing
 * @property {string} [orgPath="DEFAULT"] - Organizational path for sub configurations
 * @property {string} [msalConfig="DEFAULT"] - MSAL config for sub configurations
 */
const agentObj = {
    userId: "",
    userName: "",
    firstName: "",
    lastName: "",
    groupName: "",
    eMail: "",
    orgPath: "DEFAULT",
    msalConfig: "DEFAULT"
}


/**
 * @typedef {Object} presenceObj
 * @property {boolean} [enabled=true] - Enable presence view i Buddy
 * @property {number} [timer=20] - Timer between presence updates
 * @property {boolean} [calendar=true] - Enable Puzzel calendar presence
 * @property {boolean} [tdcScale=false] - Enable TDC Scale mobile presence
 * @property {boolean} [msTeams=false] - Enable Microsoft Teams presence
 */
const presenceObj = {
    enabled: true,
    timer: 20,
    calendar: true,
    tdcScale: false,
    msTeams: false
}

/**
 * @typedef {Object} appDataObj
 * @property {number} [tokenCustomerKey=""] - Saved token for customer key
 * @property {number} [tokenSessionId=""] - Saved session for customer id
 */
const appDataObj = {
    tokenCustomerKey: "",
    tokenSessionId: "",
};

// #endregion Global Variables


/** @function 
 * @name documentReady
 * @description Document Ready for ndstart
 * @since 1.0.0.0
*/
$(function () {
    console.debug("(DocumentReady) In");
    
    let myPath = window.location.pathname;

    console.info("(DocumentReady) myPath", myPath);

    myDomain = window.location.hostname.toLowerCase();
    console.info("(DocumentReady) myDomain", myDomain);

    switch (myDomain) {
        case "localhost":
            ndBuddyUrl = `https://${myDomain}:8443/Puzzel/api/`;
            break;
        default:
            ndBuddyUrl = `https://${myDomain}:8443/api/`;
            break;
    }

    console.log("ndBuddyUrl", ndBuddyUrl);

    $('#ndBuddyAppServer').val(myDomain.split('.')[0]);
    $('#ndBuddyAppServerSubSite').val(myPath.split('/')[1]);

    moment.locale('da');

    calendarNowMark();

    let ndReloadBol = ndPageReload();

    /* Detect Fullscreen */
    const mql = window.matchMedia("(display-mode: fullscreen)");

    mql.addEventListener("change", (e) => {
        console.log("(DocumentReady) Fullscreen event", e.matches);
        setTimeout(() => {
            $('#tableFavId').DataTable().destroy();
            ndDataTableInit("#tableFavId", ndUserFavoritesArr);
            setWindowHeight(e.matches);
        }, 500);


    });
    console.debug("(DocumentReady) Out");
});


/** @function 
 * @name windowsLoad
 * @description Window Load for ndstart
 * @since 1.0.0.0
*/
$(window).on("load", function () {
    console.debug("(load) In");
    
    Mousetrap.bind(['alt+a'], function () {
        console.debug("Mousetrap Alt+A");
    });

    /* Tooltip */
    $('[data-bs-toggle="tooltip"]').tooltip();
    tdcGetPhoneMessageTemplates();

    console.debug("(load) Out");
});