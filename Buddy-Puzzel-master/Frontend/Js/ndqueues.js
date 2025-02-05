/* Global Variables */
versionObj.ndqueues = 37;

/* Document Variables */
var QueuesArr = [];
var QueuesDT;
var alarmTimeout = 0;

/* Document Ready */
$(function () {
    QueuesDT = getDataTableQue([]);
});


/* List Queues */
const ndRequestQueues = async (skipApiCall = false, forceLoad = false) => {
    console.debug("(ndRequestQueues) In");
    
    if (QueuesArr === null || !skipApiCall) {
        console.log("(ndRequestQueues) From Server");

        //const apiUrl = `${puzzelUrl}${custObj.customerKey}/visualqueues/stateinformation/UserRelevant?userId=${agentObj.userId}`;
        const apiUrl = `${puzzelUrl}${custObj.customerKey}/visualqueues/stateinformation/All`;

        QueuesArr = await puzzelApiCall(apiUrl);
        if (QueuesArr === null || QueuesArr.length === 0) {
            $('#tableQueId').DataTable().clear().draw();
            console.error("(ndRequestQueues) Error In Api Call");
            return;
        }
        console.info("(ndRequestQueues) QueuesArr", QueuesArr);
    }

    let QueuesArr2 = [];
    let tdcAlarmFlag = false;
    let settingQueueAlarm = $("#settingQueuesAlarmDD").val();

    $.each(QueuesArr, function (index, queue) {
        let queueId = queue.id.toString();
        queue.nodeId = "";
        queue.label = "";
        queue.nodeType = "";
        queue.favorite = favoritesQueArr.includes(queue.id);

        if (queueIdsMapDicG.size !== 0) {
            if (queueIdsMapDicG.has(queue.id)) {
                queue.nodeId = queueIdsMapDicG.get(queue.id).nodeId;
                queue.label = queueIdsMapDicG.get(queue.id).label;
                queue.nodeType = queueIdsMapDicG.get(queue.id).nodeType;
            }
        }

        if (settingQueueAlarm !== "NONE") {
            if (alarmQueuesArr.includes(queueId) && queue.alarmFlag === 1) {
                tdcAlarmFlag = true; //Alarm Flag
            }
        }

        if (!hideQueuesArr.includes(queueId)) {
            QueuesArr2.push(queue);
            
        }
    });

    console.info("(ndRequestQueues) tdcAlarmFlag", tdcAlarmFlag);

    if (settingQueueAlarm !== "NONE" && tdcAlarmFlag) {
        switch (settingQueueAlarm) {
            case "BLINK":
                $("#queueAlarmIconID").html("&nbsp;");
                $("#queueAlarmIconID").removeClass("tdcStatic").addClass("fas fa-bell").addClass("tdcBlink");
                break;
            case "STATIC":
                $("#queueAlarmIconID").html("&nbsp;");
                $("#queueAlarmIconID").removeClass("tdcBlink").addClass("fas fa-bell").addClass("tdcStatic");
                break;
        }
    }
    else {
        $("#queueAlarmIconID").html("&nbsp;&nbsp;&nbsp;");
        $("#queueAlarmIconID").removeClass("fas fa-bell");
    }
    console.info("(ndRequestQueues) QueuesArr2", QueuesArr2);

    /* Only Run on Queues page */
    if (!$("#navItemQueues").hasClass("active") && !forceLoad) {
        console.log("(ndRequestQueues) Tab Not Active");
        return;
    }

    QueuesDT.clear();
    QueuesDT.rows.add(QueuesArr2);

    QueuesDT.columns().search('');

    if ($("#queuesShowFavOnly").prop("checked")) {
        QueuesDT.column(8).search(true);
    }

    if ($("#queuesShowRelevantOnly").prop("checked")) {
        if (serviceLabelsMapG.size !== 0) {
            QueuesDT.column(26).search("^\\S+$", true);  //Hide queues with no nodeId
        }

        if ($("#settingQueueShowNoAgentDD").val() === "0") {
            QueuesDT.column(6).search("^(?!0)", true);  //Hide queues with no agents
        }
    }


    let searchValue = $("#searchInputQue").val() || "";
    if (searchValue !== "") {
        QueuesDT.column(2).search(searchValue);
    }


    QueuesDT.draw();

    let rowData = QueuesDT.row(0).data();

    console.info("(ndRequestQueues) rowData", rowData);
    console.debug("(ndRequestQueues) Out");
}


function getDataTableQue(data) {
    let datatable =
        $("#tableQueId").DataTable({
            dom: 't',
            data: data,
            language: {
                "url": "Res/danish.json"
            },
            "initComplete": function (settings, json) {
                //TODO
            },
            responsive: false,
            "bSort": true,
            paging: false,
            autoWidth: false,
            scrollX: false,
            scrollY: "75vh",
            scrollCollapse: true,
            fixedColumns: false,
            order: [[8, "desc"], [2, "asc"]],
            orderClasses: false,
            keys: {
                keys: [13, 38, 40],  //Enter, Up, Down
                blurable: false
            },
            columns: [
                { data: null, width: 20, visible: true, "defaultContent": `<span class="fas fa-circle ndColorGray" />` },
                { data: 'alarmFlag', width: 20, visible: true },
                { data: 'description', width: 150, visible: true },
                { data: 'queueSize', width: 50, visible: true },
                { data: 'queueSizeCiq', width: 50, visible: true },
                { data: 'waitTimeMaxSeconds', width: 100, visible: true },
                { data: 'agentsLoggedOn', width: 50, visible: true },
                { data: 'agentsReady', width: 50, visible: true },
                { data: "favorite", width: 20, visible: true },
                { data: 'queueSizePreferred', width: 50, visible: false },  // Foretrukne agenter
                { data: 'sla', width: 50, visible: false },
                { data: 'waitTimeAverageSeconds', width: 100, visible: false },
                { data: 'agentsInPause', width: 50, visible: false },
                { data: 'agentsReady', width: 50, visible: false },
                { data: 'agentsUnavailable', width: 50, visible: false },
                { data: 'callsOfferedToday', width: 50, visible: false },
                { data: 'callsAnsweredToday', width: 50, visible: false },
                { data: 'ciqsOfferedToday', width: 50, visible: false },
                { data: 'ciqsAnsweredToday', width: 50, visible: false },
                { data: 'callsAnsweredWithinSla', width: 50, visible: false },
                { data: 'ciqScheduled', width: 50, visible: false },  // Planlagte opgaver
                { data: 'callsAbandonedToday', width: 50, visible: false },
                { data: 'callsAbandonedWithinSla', width: 50, visible: false },
                { data: 'id', visible: false },
                { data: 'nodeId', visible: false },
                { data: 'label', visible: false },
                { data: 'nodeType', visible: false }
                //{ data: 'unblockedLoggedIn', width: 50, visible: true },
                //{ data: 'unblockedUnavailable', width: 50, visible: true },
                //{ data: 'silentCallsToday', width: 50, visible: true },
            ],
            'createdRow': function (row, data, dataIndex) {

            },
            columnDefs: [
                {
                    targets: [0],  //Agg status
                    orderable: false,
                    className: "dt-center",
                    render: function (data, type, row) {
                        if (type === 'display') {
                            const returnObj = ndGetAggStatusForQueue(row);
                            return `<span title="${returnObj.title}" class="fas fa-circle ndColor${returnObj.color}" />`;
                        }

                        return data;
                    }
                },
                {
                    targets: [1],  //Alarm
                    className: "dt-center",
                    orderable: false,
                    render: function (data, type) {
                        if (type === "display" && data === 1) {
                            return `<span class="fas fa-bell ndColorRed" />`;
                        }
                        return "";
                    }
                },
                {
                    targets: [2],  //Name
                    render: function (data, type) {
                        return data;
                    },
                    "createdCell": function (td, cellData) {
                        $(td).attr("title", cellData);
                    }
                },
                {
                    targets: [3],  //Queue size Voice
                    className: "dt-center",
                    orderable: false,
                    render: function (data, type) {
                        return data;
                    },
                    "createdCell": function (td, cellData) {
                        if (cellData > 30) {
                            $(td).removeClass("ndColorYellow").addClass("ndColorRed");
                        }
                        else if (cellData > 15) {
                            $(td).removeClass("ndColorRed").addClass("ndColorYellow");
                        }
                        else {
                            $(td).removeClass("ndColorRed").removeClass("ndColorYellow");
                        }
                    }
                },
                {
                    targets: [4],  //Queue size CB
                    className: "dt-center",
                    orderable: false,
                    render: function (data, type) {
                        return data;
                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (cellData > 50) {
                            $(td).removeClass("ndColorYellow").addClass("ndColorRed");
                        }
                        else if (cellData > 25) {
                            $(td).removeClass("ndColorRed").addClass("ndColorYellow");
                        }
                        else {
                            $(td).removeClass("ndColorRed").removeClass("ndColorYellow");
                        }
                    }
                },
                {
                    targets: [5],  //Wait time (sec)
                    className: "dt-center",
                    render: function (data, type) {
                        if (type === "display") {
                            return new Date(data * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
                        }
                        return data;
                    },
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (cellData > 1800) {
                            $(td).removeClass("ndColorYellow").addClass("ndColorRed");
                        }
                        else if (cellData > 900) {
                            $(td).removeClass("ndColorRed").addClass("ndColorYellow");
                        }
                        else {
                            $(td).removeClass("ndColorRed").removeClass("ndColorYellow");
                        }
                    }
                },
                {
                    "targets": [6],  //Agent Logged On
                    className: "dt-center",
                    orderable: false,
                    "createdCell": function (td, cellData, rowData, row, col) {
                        if (cellData <= 0) {
                            $(td).addClass("ndColorGray");
                        }
                    }
                },
                {
                    "targets": [7],  //Agents Ready
                    className: "dt-center",
                    orderable: false
                },
                {
                    targets: [8],  //Favorite
                    orderable: true,
                    className: "dt-left",
                    render: function (data, type) {
                        if (type === 'display') {
                            if (data) {
                                return '<span class="fa-star fas"></span>';
                            }
                            else {
                                return '<span class="fa-star far"></span>';
                            }
                        }
                        return data;
                    }
                }
            ]
        });
    return datatable;
}