/* Popovers  */
function popovers() {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

    const popover = new bootstrap.Popover('.popover-dismiss', {
        trigger: 'focus'
    })
}


$('#dInfo').html(searchWordsArr[0].replaceAll("\\n", "<br>"));


if (custObj.customerKey === "45524905" && number === "112") {
    number = "80620066";
}



//let rowSelect = datatable.rows({ selected: true }).data();
let cellSelect = datatable.cell({ focused: true }).index();

console.debug("(DataTable On Key) cellSelect", cellSelect.row);

setTimeout(() => {
    EmployeesDT.cell.blur();
    FavoritesDT.cell.blur();
}, 1000);

let activeElement = document.activeElement.id;
console.info("(DataTable On Key) activeElement", activeElement);


// Display the keys
for (const key of searchParams.keys()) {
    console.log("(getTestingConfig)", key);
}

/* Update Call Object */
function updateCallObject(call) {
    callObj.sessionId = call.sessionId;
    callObj.caller = call.caller;
    callObj.isConnected = call.isConnected, callObj.isActive = call.isActive;
    callObj.queueKey = call.queueKey;
    callObj.system_caller_transfered = "", callObj.Omstillet_til = "", callObj.cpr_number = "";
    callObj.tdcCustGroupIds = "0";

    let ndVars = ["tdcCustGroupIds", "system_caller_transfered", "Omstillet_til", "cpr_number"];
    let variablesArr = new Map();

    if (call.hasOwnProperty('vars')) {
        console.info("(updateCallObject) vars", call.vars);
        $.each(call.vars, function (key, value) {
            variablesArr.set(key, value);
        });

        $.each(ndVars, function (index, value) {
            if (variablesArr.has(value)) {
                callObj[value] = variablesArr.get(value)
            }
        });
    }

    /* Region Hovedstaden Cust Group */
    $("#searchOrgDD").val(callObj.tdcCustGroupIds);

    /* Returned Call */
    if (callObj.system_caller_transfered === "TRUE" && callObj.Omstillet_til !== "") {
        $("#searchInputEmp").val(callObj.Omstillet_til);
        ndRequestEmployees();
    }

    /* Gribskov CPR >  */
    if (callObj.cpr_number !== "") {
        let target = $('#settingSapaDD').val();
        $('#sapaCpr').val(callObj.cpr_number);
        $('#objektVaerdi1').val(callObj.cpr_number);
        $('#sapaForm').attr("target", target);
        $('#sapaResult').html("?myndighed=29188440&kontekst=PART&objekt1=PART&objektVaerdi1=" + callObj.cpr_number);
    }

    console.info("(updateCallObject) callObj", callObj);
}

setTimeout(() => {
    if (!EmployeesDT.rows().count()) {
        console.warn("(ndRequestEmployees) Empty datatable");
        EmployeesDT.destroy();
        ndDataTableInit("#tableEmpId", ndUserArr);
    }
}, 1000);



$('#tableEmpId').on('click', 'tr', function () {
    console.log("Jacob1 ", EmployeesDT.row(this).data());
});

$('#tableEmpId').on('key-focus key-refocus', function (e, datatable, cell) {
    console.debug("on_key-focus key-refocus");
    //TODO
});


if (callObj.cpr_number !== "") {
    //$('#sapaForm').submit();
}

ndFocusSearchBox();
if (callObj.callerTransfered === "TRUE" && callObj.callerTransferedTo !== "") {
    EmployeesDT.cell(':eq(0)', 4).focus();
}


case "Alt2":
e.preventDefault();
let selected = $('#showOnlineEmpDD').val();
if (selected === "all") {
    $('#showOnlineEmpDD').val("online");
    EmployeesDT.column(0).search('0', true).draw();
}
else {
    $('#showOnlineEmpDD').val("all");
    EmployeesDT.columns().search('', true).draw();
}
break;



function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);

    let puzzelContent = document.getElementById("puzzelDataTextArea")

    puzzelContent.focus();
    puzzelContent.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

let shownRowsHeight = $("#tableEmpId_wrapper").height();




setTimeout(() => {
    let width = $("#detailView").width();
    let div2 = $("#detailView");
    const div = document.getElementById("detailView");

    let overflowActiveB = (div.scrollWidth > div.offsetWidth);
    overflowActiveB = div.scrollWidth > div.clientWidth;

    //console.info("setWindowHeight1 outerWidth", div2.outerWidth());
    //console.info("setWindowHeight1 innerWidth", div2.innerWidth());

    console.info("setWindowHeight1 scrollWidth", div.scrollWidth);
    console.info("setWindowHeight1 offsetWidth", div.offsetWidth);
    //console.info("setWindowHeight1 clientWidth", div.clientWidth);


    //console.info("setWindowHeight1 overflowActiveB", overflowActiveB);

    //let vs = div.scrollHeight > div.clientHeight;
    //let hs = div.scrollWidth > div.clientWidth;

    //$("#detailView").width(width - 10 + "px");
}, 1000);


$("#settingParkDefaultQueue").prop("selectedIndex", 0);
