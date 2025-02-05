$(document).ready(function () {
    let searchWords = "Jacobs Noter | \nwidget\nguru\nsøgeord";
    searchWordsArr = searchWords.split('|');

    if (searchWordsArr.length > 1) {
        searchWords = searchWordsArr[1];
    }

    console.log("searchWordsArr", searchWordsArr);
    console.log("searchWords", searchWords);
});


function One() {
    //$('#index').val($('#nddDetail tbody tr').length);
    $('#index').val(12);

    $('#btn0').click(function () {
        var indx = $('#index').val() - 1;
        console.log("indx", indx);

        var newRow = $('<tr><td>New row is added at index ' + $('#nddDetail tbody tr').length + '</td></tr>');
        newRow.insertBefore($('#nddDetail tbody tr:nth(' + indx + ')'));
        console.log("slut");
    });

    $('#btn1').click(function () {
        var indx = $('#index').val();
        var html =
            `<tr id="searchWordRow" class="ndd">
                <td id="dSearchWordHeader" class="ndd ndCenter">Søgeord</td>
                <td colspan="4" class="ndd ndCenter">
                    <div id="dSearchWord" class="nddSearchWord ">&nbsp;</div>
                </td>
            </tr>`
        $('table > tbody > tr#testRow').after(html);
    });
}