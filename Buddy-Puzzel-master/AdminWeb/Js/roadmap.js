/* Global Variables */
var RoadmapDT, rowIndexLast = -1;
var detailRows = [];

/* Document Ready */
$(function () {
    initTable("2024");

    /* NAV Bar changed */
    $('a.nav-link').on('shown.bs.tab', function (event) {
        let year = $(event.target).attr("href").replace('#', '');
        RoadmapDT.ajax.url(`Res/roadmap${year}.json`).load();
    });

    $('#roadmapTable').on('click', 'tr td', function () {
        console.debug("(roadmapTable) In");

        let row = RoadmapDT.row(this);
        let rowIndex = row.index();
        let data = row.data();
        console.info("(roadmapTable) data", data);

        if (rowIndexLast !== -1 && rowIndex !== rowIndexLast) {
            RoadmapDT.row(rowIndexLast).child.hide();
        }

        if (row.child.isShown()) {
            row.child.hide();
        }
        else {
            RoadmapDT.row(rowIndex).child.hide();
            row.child(format(row.data()), 'childRow').show();
        }

        rowIndexLast = row.index();
    });
});


/* Init Table */
function initTable(year) {
    RoadmapDT = new DataTable('#roadmapTable', {
        dom: 'ft',
        //dom: 'Bf<"ndToolbar">t',
        ajax: {
            url: 'Res/roadmap' + year + '.json',
            dataSrc: ''
        },
        language: {
            "url": "Res/danish_org.json"
        },
        bSort: true,
        paging: false,
        scrollY: '60vh',
        scrollCollapse: false,
        order: [
            [1, "asc"], [0, "asc"]
        ],
        columns: [
            { data: 'feature', className: "ndRow" },  // 0
            { data: 'prio', className: 'ndRowRelease1' },  // 1
            { data: 'releaseDate', className: 'ndRowRelease2' },  // 2
            { data: 'descriptionExternal', visible: false },  // 3
            { data: 'descriptionInternal', visible: false },  // 4
            { data: 'isReleased', visible: false }  // 5
        ],
        columnDefs: [
            {
                targets: [0],
                orderable: false,
                render: function (data, type, row) {
                    if (type === 'display') {
                        let statusCss = (row.isReleased) ? "tdcHeaderReleased" : "tdcHeader";
                        return `<span class="${statusCss}">${data}</span><br />${row.descriptionExternal}`;
                    }
                    return data;
                }
            },
            {
                targets: [1, 2],
                orderable: false
            }
        ],
        searchCols: [
            null,
            null,
            null,
            null,
            null,
            { search: false }
        ]
    });
}

/* Child Row */
function format(data) {
    return `<span id="childView">${data.descriptionInternal}</span>`;
}

/* Settings - On Checkbox Click */
$('input:checkbox').on('click', function () {
    let id = $(this).attr("id");
    let value = $(this).prop("checked");

    console.info(`(Checkbox) ${id} = ${value}`);

    if (value) {
        RoadmapDT.column(5).search('').draw();
    }
    else {
        RoadmapDT.column(5).search(false).draw();
    }
});