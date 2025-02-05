/* Document Ready */
$(function () {
    console.debug("(Ready) In");

    let idFromHash = window.location.hash.substring(1);
    console.info("(Ready) idFromHash", idFromHash);

    if (idFromHash === "") {
        window.location.hash = "versions";
        $("#tdcContent").load("versions.htm");
        return;
    }

    let menusArr = ["download", "prices", "roadmap", "technical", "versions"];
    if (!menusArr.includes(idFromHash)) {
        window.location.hash = "versions";
        $("#tdcContent").load("versions.htm");
        //window.history.pushState('MainPage', 'TDC Erhverv - BUDDY Puzzel', '');
        return;
    }

    $("#tdcMenu .nav-link").removeClass("active");
    $("#" + idFromHash + "_ID").addClass("active");
    $("#tdcContent").load(idFromHash + ".htm");

    console.debug("(Ready) Out");
});


/* Menu Click */
$('#tdcMenu a').on('click', async function (e) {
    console.debug("(Menu Click) In");

    let id = $(this).attr("id");
    let fileName = id.replace("_ID", ".htm");

    console.info("(Menu Click) fileName", fileName);
    $("#tdcMenu .nav-link").removeClass("active");
    $("#" + id).addClass("active");

    $("#tdcContent").load(fileName);

    console.debug("(Menu Click) Out");
});