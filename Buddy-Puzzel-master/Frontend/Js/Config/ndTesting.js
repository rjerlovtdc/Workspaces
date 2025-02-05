/* API values */
const ndTesting = async (customerName) => {
    console.debug("(ndTesting) In");

    /* API values */
    switch (customerName) {
        case "abb":
            custObj.customerKey = "458631";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "630794";
            break;
        case "apcoa":
            custObj.customerKey = "474896";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "662416";
            break;
        case "dab":
            custObj.customerKey = "10117738";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "705383";
            break;
        case "gribskov":
            custObj.customerKey = "474898";
            custObj.UserName = "widgetuser"
            custObj.Password = "123abc"
            agentObj.userId = "597650";
            break;
        case "helsinfor":
            custObj.customerKey = "4517111";
            custObj.UserName = "catsyncuser"
            custObj.Password = "wdre_dfe&12"
            agentObj.userId = "667778";
            break;
        case "itforsyningen":
            custObj.customerKey = "454014";
            custObj.UserName = "jha"
            custObj.Password = "Password1"
            agentObj.userId = "651748";
            break;
        case "morsoekom":
            custObj.customerKey = "454265";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "578744";
            break;
        case "munckgruppen":
            custObj.customerKey = "4517222";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "688693";
            break;
        case "netdesign":
            custObj.customerKey = "4054040";
            //custObj.UserName = "apiuser"
            custObj.UserName = "jha"
            custObj.Password = "Password1"
            agentObj.userId = "528317";

            //shownQueuesArr = "q_backoffice,q_sales,q_support";
            alarmQueuesArr = ["72255", "87486"];
            setTimeout(() => {
                //$('#tdcPopupId')[0].click();
            }, 1000)
            break;
        case "novafos":
            custObj.customerKey = "455160";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "604647";
            break;
        case "odense":
            custObj.customerKey = "454056";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "526483";
            break;
        case "pfa":
            custObj.customerKey = "12820";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "612289";
            break;
        case "regionh":
            custObj.customerKey = "2647119";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "583277";
            //custObj.UserName = "jacobtdc"
            //custObj.Password = "Password1"
            //agentObj.userId = "642703";
            break;
        case "regionsyd":
            custObj.customerKey = "45524905";
            custObj.UserName = "tdcadmin"
            custObj.Password = "9ijnBH"
            agentObj.userId = "654426";
            //custObj.UserName = "jha"
            //custObj.Password = "Password1"
            //agentObj.userId = "654583";
            break;
        case "scanvaegt":
            custObj.customerKey = "454335";
            custObj.UserName = "tdctest"
            custObj.Password = "RingRing123"
            agentObj.userId = "584828";
            break;
        case "vejdirek":
            custObj.customerKey = "1018811";
            custObj.UserName = "tdctest"
            custObj.Password = "9ijnBH"
            agentObj.userId = "645745";
            break;
        case "webex":
            custObj.customerKey = "4054040";
            custObj.UserName = "jha";
            custObj.Password = "Password1";
            agentObj.userId = "528317";
            break;
        default:
            return false;
    }

    console.debug("(ndTesting) Out");
    return true;
}


/* Testing config */
const ndTesting2 = async (customerName) => {
    console.debug("ndTesting2 In");

    switch (customerName) {
        case "abb":
            $("#searchInputEmp").val("brian w");
            ndRequestEmployees();
            presenceObj.enabled = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "apcoa":
            $("#searchInputEmp").val("frances");
            ndRequestEmployees();
            presenceObj.enabled = true;
            presenceObj.tdcScale = true;
            presenceObj.msTeams = true;
            break;
        case "dab":
            break;
        case "gribskov":
            break;
        case "morsoekom":
            //$("#searchInputEmp").val("99707011");
            $("#searchInputEmp").val("line mee");
            ndRequestEmployees();
            break;
        case "munckgruppen":
            $("#searchInputEmp").val("han");
            ndRequestEmployees();
            break;
        case "netdesign":
            searchWordLength = 2;
            presenceObj.timer = 10;
            presenceObj.enabled = false;
            presenceObj.tdcScale = false;
            presenceObj.msTeams = false;
            $("#searchInputEmp").val("59484018");
            //$("#searchInputEmp").val("widget");
            setTimeout(ndRequestEmployees, 500);
            break;
        case "novafos":
            presenceObj.tdcScale = false;
            $("#searchInputEmp").val("44209285");
            setTimeout(ndRequestEmployees, 500);
            break;
        case "odense":
            //$("#searchInputEmp").val("jesper po");
            //$("#searchInputEmp").val("65518500 72b");
            ndRequestEmployees();
            break;
        case "pfa":
            presenceObj.msTeams = true;
            break;
        case "regionh":
            $("#searchInputEmp").val("CIMT")
            const cbasObj = await fetch('Res/cbas_response.json');
            const cbasJon = await cbasObj.json();
            console.info("regionh", cbasJon[4]);
            let ndUser = parseCbasUserResponse(cbasJon[4]);
            console.info("regionh", ndUser);
            ndShowDetails(ndUser);
            break;
        case "regionsyd":
            $("#searchCountDDEmp").val(100);
            $("#searchOrgDD").val("TOP|45524905|OUH");
            ////$("#searchInEmpDD").val("searchWords");
            //$("#searchInputEmp").val("sb ort kir")
            //$("#searchInputEmp").val("Hans Paulsen")
            //setTimeout(() => { ndRequestEmployees(); }, 1000);
            searchWordLength = 3;
            break;
        case "scanvaegt":
            break;
        case "itforsyningen":
            presenceObj.msTeams = true;
            agentObj.groupName = "ALL";
            agentObj.msalConfig = 
            setTimeout(() => {
                $("#searchInputEmp").val("esma basic");
                //$("#searchOrgDD").val("TOP_454014_Allerød");
                ndRequestEmployees();
            }, 1000);
            break;
        case "vejdirek":
            $("#searchInputEmp").val("birkholm")
            setTimeout(() => { ndRequestEmployees(); }, 1000);
            break;
    }

    if (presenceObj.msTeams) {
        $("#settingMsTeamsCard_ID").removeClass("ndHide");
        $("#infoMsTeamsCard_ID").removeClass("ndHide");
    }

    console.debug("ndTesting2 Out");
}


async function TestSearching() {
    console.debug("(TestSearching) In");
    $("#searchInputEmp").val("gott");
    ndRequestEmployees();

    await delay(10000);
    $("#searchInputEmp").val("lars");
    ndRequestEmployees();

    await delay(10000);
    $("#searchInputEmp").val("s327g");
    ndRequestEmployees();

    await delay(10000);
    clearSearchAndDetail();

    await delay(10000);
    $("#searchInputEmp").val("hans");
    ndRequestEmployees();

    setTimeout(TestSearching, 10000);
    console.debug("(TestSearching) Out");
}

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function testMarkForm() {
    console.debug("testMarkForm In");
    $("#TestmarkTextAreaHttp").val("");
    let url = $("#TestmarkHttpUrlTxt").val();
    console.info("testMarkForm url", url);

    var xhr = new XMLHttpRequest();
    //xhr.addEventListener("error", XHRErrorHandler);

    xhr.onerror = (event) => {
        console.log("testMarkForm Error", event);
        addTextToControl("TestmarkTextAreaHttp", "ErrorCode: " + event.target.status);
        addTextToControl("TestmarkTextAreaHttp", "ErrorType: " + event.type);
        addTextToControl("TestmarkTextAreaHttp", "ErrorText: Network");
    };

    xhr.onreadystatechange = function () {
        switch (this.readyState) {
            case 1:
                addTextToControl("TestmarkTextAreaHttp", "Running ..\n", false);
                break;
            case 4:
                if (this.status === 200) {
                    addTextToControl("TestmarkTextAreaHttp",
                        `StatusCode: ${this.status} (${ndHttpErrorCodes["en"][this.status].short})`
                    );
                    addTextToControl("TestmarkTextAreaHttp",
                        `StatusText: ${this.responseText}`
                    );
                }
        }
        console.info("testMarkForm this", this);
    }

    try {
        xhr.open("GET", url, false);
        xhr.send();
    }
    catch (exception) {
        console.log("testMarkForm exception", exception)
        addTextToControl("TestmarkTextAreaHttp", exception);
    }

    console.debug("testMarkForm Out");
}


function XHRErrorHandler(event) {
    console.log("XHRErrorHandler Error", event);
}


/* Testmark */
function testMarkHref() {
    let url = $("#TestmarkHttpUrlTxt").val();
    $("#hrefDummy").attr("href", url);
    $('#hrefDummy')[0].click();
    $("#hrefDummy").attr("href", "#");
}


/* Popup URL */
function testMarkPopup() {
    let url = $("#TestmarkHttpUrlTxt").val();
    let timeout = $("#TestmarkHttpAutoCloseTxt").val();
    let params = `scrollbars=no, resizable=no, status=no, location=no, toolbar=no, menubar=no, width=50, height=50, left=4000, top=2000`;

    let newWindow = window.open(url, "TdcPopup", params);

    setTimeout(function () { newWindow.close() }, timeout);
}


function TestmarkHttpClear() {
    $("#TestmarkTextAreaHttp").val("");
}

function TestmarkFormSend() {
    let target = "TdcSapa";
    let myndighed = $('#TestmarkFormMyndighedTxt').val();
    let cprNumber = $('#TestmarkFormCprTxt').val();

    $('#myndighed').val(myndighed);
    $('#objektVaerdi1').val(cprNumber);
    $('#sapaForm').attr("target", target);
    $('#sapaForm').submit();
}