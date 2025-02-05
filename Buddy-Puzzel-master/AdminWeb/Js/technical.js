// Shorthand for $( document ).ready()
$(function () {
    console.debug("(Ready) In");

    tdcBindings();
    loadData();

    /* Popovers */
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

    console.debug("(Ready) Out");
});

function tdcBindings() {
    $('#searchOverviewTable').on('click', 'th', function () {
        console.debug("(searchOverviewTable) onClick In")

        let cellIndex = $(this).index();
        console.info("(searchOverviewTable) cellIndex", cellIndex);
        showInfoForTdIndex(cellIndex);
        console.debug("(searchOverviewTable) onClick Out")
    });
}

function showInfoForTdIndex(index) {
    console.debug("(showInfoForTdIndex) In");
}

async function loadData() {
    console.debug("(loadData) In");

    const response = await fetch("Res/searchOverviewData.json");
    const rows = await response.json();
    console.info("(loadData) rows", rows);


    $.each(rows, function (index, row) {
        console.info("(loadData) row", row);
        let rowHtml = `
                    <tr>
                        <td class="text-center">
                            <span title="${row.presenceAggregatedLabel}" class="fas fa-circle ndColor${row.presenceAggregatedColor}" />
                        </td>
                        <td class="text-center">
                            <span title="${row.presenceMobileLabel}" class="fas fa-circle ndColor${row.presenceMobileColor}" />
                        </td>
                        <td class="text-center">
                            <span title="${row.isCalenderBusyLabel}" class="fas fa-circle ndColor${row.isCalenderBusyColor}" />
                        </td>
                        <td class="text-center">
                            <span title="${row.presenceTeamsLabel}" class="fas fa-circle ndColor${row.presenceTeamsColor}" />
                        </td>
                        <td class="text-center">
                            <span title="${row.rowLabel}" class="fas fa-square-full ndColor${row.rowColor}" />
                        </td>
                        <td title="${row.fullName}">${row.fullName}</td>
                        <td title="${row.title}">${row.title}</td>
                        <td title="${row.departmentName}">${row.departmentName}</td>
                        <td title="${row.streetAddress}">${row.streetAddress}</td>
                        <td>${row.phone}</td>
                        <td>${row.mobile}</td>
                        <td><span class="fa-star ${row.favorite}"></span></td>
                    </tr>`;
        $("#searchOverviewTable tbody").append(rowHtml);

    });
}