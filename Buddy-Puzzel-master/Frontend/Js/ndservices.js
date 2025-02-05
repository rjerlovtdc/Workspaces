/**
 * @module ndServices
 */

/* Global Variables */
versionObj.ndservices = 37;



/** @function 
 * @name getVisualQueues
 * @async
 * @returns {object[]}
 * @description Get list of visual queues
*/
const getVisualQueues = async () => {
    console.debug("(getVisualQueues) In");
    queueIdsMapDicG.clear();
    parkQueuesDic.clear();

    const url = `${puzzelUrl}${custObj.customerKey}/visualqueues`;

    var visualQueuesArr = await puzzelApiCall(url);

    if (visualQueuesArr == null) {
        console.error("(getVisualQueues) Error In Api Call");
        return;
    }
    console.info("(getVisualQueues) visualQueuesArr", visualQueuesArr);
    let ParkedCallArr = [];

    $.each(visualQueuesArr, function (index, visualQueue) {
        //console.info("(getVisualQueues) visualQueuesArr" + index, visualQueue.description);
        let queueCount = visualQueue.queues?.length || 0;
        if (queueCount === 1) {
            let nodeObj = serviceLabelsMapG.get(visualQueue.queues[0].id);
            //console.info("(getVisualQueues) nodeObj", nodeObj);
            if (serviceLabelsMapG.has(visualQueue.queues[0].id)) {
                queueIdsMapDicG.set(visualQueue.id, nodeObj);
            }

            if (visualQueue.description.toUpperCase().includes("PARKER")) {
                parkQueuesDic.set(visualQueue.id, visualQueue.description);
            }
        }
    });

    console.info("(getVisualQueues) queueIdsMapDicG", queueIdsMapDicG);
    console.info("(getVisualQueues) parkQueuesDic", parkQueuesDic);

    if (parkQueuesDic.size > 0) {
        addParkedCallOption(parkQueuesDic);
    }

    console.debug("(getVisualQueues) Out");
}


/** @function 
 * @name getServiceLabels
 * @returns {object[]}
 * @description Get list of labels from current call
*/
const getServiceLabels = async () => {
    console.debug("(getServiceLabels) In");
    let url = `${puzzelUrl}${custObj.customerKey}/users/${agentObj.userId}/session/servicelabel`;

    const serviceLabelsArr = await puzzelApiCall(url);
    console.info("(getServiceLabels) serviceLabelsArr", serviceLabelsArr);

    $.each(serviceLabelsArr, function (index, result) {
        nodeIdsMapDic.set(result.label, result.nodeId);
        //nodeIdsMapDic.set(result.label.replace('Main service - ', ''), result.nodeId);
    });

    console.info("(getServiceLabels) nodeIdsMapDic", nodeIdsMapDic);

    console.debug("(getServiceLabels) Out");
}


/** @function 
 * @name getServiceLabelsFromSearch 
 * @async
 * @returns {object[]}
 * @description Get list of labels
*/
const getServiceLabelsFromSearch = async () => {
    const apiUrl = `${puzzelUrl}${custObj.customerKey}/users/${agentObj.userId}/session/servicelabel/search`;
    let bodyObj = {
        "searchString": "",
        "maxMatches": 500
    };

    const serviceLabelsArr = await puzzelApiCall(apiUrl, "POST", JSON.stringify(bodyObj));
    console.info("(getServiceLabelsFromSearch) serviceLabelsArr", serviceLabelsArr);

    serviceLabelsMapG.clear();
    serviceLabelsMapG = getMapFromArray(serviceLabelsArr);

    console.info("(getServiceLabelsFromSearch) serviceLabelsMapG", serviceLabelsMapG);

    const serviceLabelsArrSerilized = JSON.stringify(serviceLabelsArr);

    console.info("(getServiceLabelsFromSearch) serviceLabelsArrSerilized", serviceLabelsArrSerilized);

    if (tdcGetLocalStorage("serviceLabels") === "NotSet") {
        await getVisualQueues();
        await ndRequestQueues();
    }

    tdcSetLocalStorage("serviceLabels", serviceLabelsArrSerilized, 480);
}


/** @function 
 * @name getMapFromArray 
 * @param {string[]} serviceLabelArr - Array of servicelabels
 * @param {string} [keyName="queueId"] - Key name to map on
 * @returns {map}
 * @description Get list of labels
*/
function getMapFromArray(serviceLabelArr, keyName = "queueId") {
    let serviceLabelsMap = new Map();

    $.each(serviceLabelArr, function (index, serviceLabel) {
        //if (serviceLabel.nodeType === "queue") {
        let serviceLabelObj = {
            "label": serviceLabel.label,
            "nodeId": serviceLabel.nodeId,
            "nodeType": serviceLabel.nodeType
        };
        serviceLabelsMap.set(serviceLabel[keyName], serviceLabelObj);
        //}
    });
    return serviceLabelsMap;
}


/** @function 
 * @name outboundCall
 * @async
 * @param {string} number - Phonenumber
 * @param {string} [fullName=""] Full name
 * @param {string} [department=""] Department
 * @description Outbound call to number
 * @since 1.0.0.0
*/
const outboundCall = async (number, fullName = "", department = "") => {
    console.log("(outboundCall) In", number);

    if (number === "") { return; }

    puzzelUpdateVarsEmp(number, fullName, department, "Outbound");
    puzzelUpdateTags(number, fullName, department, "Outbound");

    api.call('call.outboundCall', number)
        .then(ret => {
            api.call('widget.alert', "Info", "Ringer op til " + number, { "global": false, "timeout": 2000, "icon": "fas fa-phone" });
        })
        .catch(error => {
            let ndErrorText = (typeof ndErrorCodes[error] !== "undefined") ? ndErrorCodes[error] : error;
            popupWarning("error", ndErrorText);
            console.log("(outboundCall) error", error);
        });

    console.log("(outboundCall) Out");
};


/** @function 
 * @name callAnswer
 * @async
 * @param {string} number - Phonenumber
 * @description Answer Call
 * @since 1.0.0.0
*/
const callAnswer = async (number) => {
    api.call('call.callAnswer', callObj.sessionId)
        .then(ret => {
            //TODO
        })
        .catch(error => {
            console.log("(callAnswer) error", error);
        });
};


/** @function 
 * @name callHangup
 * @async 
 * @param {string} number - Phonenumber
 * @description Hang Up Call
 * @since 1.0.0.0
*/
const callHangup = async () => {
    api.call('call.hangUp', callObj.sessionId)
        .then(ret => {
            //TODO
        })
        .catch(error => {
            console.log("(callHangup) error", error);
        });
};


/** @function 
 * @name transferToPhone
 * @async
 * @param {string} number - Phonenumber
 * @param {string} [fullName=""] Full name
 * @param {string} [department=""] Department
 * @description Transfer To Number Cold
 * @since 1.0.0.0
*/
const transferToPhone = async (number, fullName = "", department = "") => {
    console.debug("(transferToPhone) In");

    if (typeof callObj.sessionId === 'undefined' ||
        typeof number === 'undefined' ||
        number === "") {
        return;
    }

    $("#dFullName").attr("lastParkedNumber", number);
    puzzelUpdateVarsEmp(number, fullName, department, "transferCold");
    puzzelUpdateTags(number, fullName, department, "transferCold");

    console.info("(transferToPhone) call.transferToPhone: ", callObj.sessionId, number);

    api.call('call.transferToPhone', callObj.sessionId, number)
        .then(ret => {
            popupWarning("success", "Kald blev omstillet til " + number);
            $('#phoneInput').val("");
            console.log("(transferToPhone) sucess");
        })
        .catch(error => {
            let ndErrorText = (typeof ndErrorCodes[error] !== "undefined") ? ndErrorCodes[error] : error;
            popupWarning("error", ndErrorText);
            console.log("(transferToPhone) error", error);
        });

    console.debug("(transferToPhone) Out");
}


/** @function 
 * @name consultWithPhone
 * @async
 * @param {string} number - Phonenumber
 * @param {string} [fullName=""] Full name
 * @param {string} [department=""] Department
 * @description Transfer To Number Warm
 * @since 1.0.0.0
*/
const consultWithPhone = async (number, fullName = "", department = "") => {
    console.debug("(consultWithPhone) In");

    if (typeof callObj.sessionId === 'undefined' ||
        typeof number === 'undefined' ||
        number === "") {
        return;
    }
    callObj.tdcLabel = `${number} [${fullName}]`;

    $("#dFullName").attr("lastParkedNumber", number);
    puzzelUpdateVarsEmp(number, fullName, department, "transferWarm");
    puzzelUpdateTags(number, fullName, department, "transferWarm");

    console.info("(consultWithPhone) callObj.sessionId", callObj.sessionId);
    console.info("(consultWithPhone) number", number);

    api.call('call.consultWithPhone', callObj.sessionId, number)
        .then(ret => {
            api.call('widget.alert', "Info", "Ringer op til " + callObj.tdcLabel, { "global": false, "timeout": 2000, "icon": "fas fa-phone" });
            console.log("(consultWithPhone) then");
        })
        .catch(error => {
            let ndErrorText = (typeof ndErrorCodes[error] !== "undefined") ? ndErrorCodes[error] : error;
            popupWarning("error", ndErrorText);
            console.log("(consultWithPhone) error", error);
        });
    console.debug("(consultWithPhone) Out");
};


/** @function 
 * @name transferToConsultee
 * @async
 * @description Tranfer to consultee (complete transfer)
 * @since 1.0.0.0
*/
const transferToConsultee = async () => {
    console.info("(transferToConsultee) callObj", callObj);
    let label = callObj.tdcLabel || "";

    api.call('call.transferToConsultee', callObj.sessionId)
        .then(ret => {
            $('#phoneInput').val("");
            popupWarning("success", "Kald blev omstillet " + label);
        })
        .catch(error => {
            popupWarning("error", "Omstilling var ikke muligt");
            console.error("(transferToConsultee) error", error);
        });
};


/** @function 
 * @name endConsultation
 * @async
 * @description End Consultation (cancel transfer)
 * @since 1.0.0.0
*/
const endConsultation = async () => {
    api.call('call.endConsultation', callObj.sessionId)
        .then(ret => {
            //TODO
        })
        .catch(error => {
            console.log("(endConsultation) error", error);
        });
};


/** @function 
 * @name transferToService
 * @async
 * @param {object} data - Data object
 * @description Transfer To Service (queue, audio etc.))
 * @since 1.0.0.0
*/
const transferToService = async (data) => {
    console.log("(transferToService) In", data);

    if (typeof callObj.sessionId === 'undefined') {
        return;
    }

    await puzzelUpdateVarsQue(data.nodeId, data.label, data.description, "transferService");
    await puzzelUpdateTags(data.nodeId, data.description, data.label, "transferService");

    console.info("(transferToService) call.transferToService: ", callObj.sessionId, data.nodeId);

    api.call('call.transferToService', callObj.sessionId, data.nodeId)
        .then(ret => {
            console.log("(transferToService) sucess");
            popupWarning("success", "Kald blev omstillet til " + data.label, 1);
        })
        .catch(error => {
            popupWarning("error", "Det var ikke muligt at stille om til " + data.label);
            console.log("(transferToService) error", error);
        });

    console.log("(transferToService) Out");
}


/** @function 
 * @name consultWithServiceQueue
 * @async
 * @param {object} data - Data object
 * @description Consult Transfer To Service (queue, audio etc.))
 * @since 1.0.0.0
*/
const consultWithServiceQueue = async (data) => {
    console.log("(consultWithServiceQueue) In", data);

    if (typeof callObj.sessionId === 'undefined') {
        return;
    }
    callObj.tdcLabel = data.label;

    await puzzelUpdateVarsQue(data.nodeId, data.label, data.description, "transferServiceWarm");
    await puzzelUpdateTags(data.nodeId, data.description, data.label, "transferServiceWarm");

    console.info("(transferToService) call.transferToService: ", callObj.sessionId, data.nodeId);

    api.call('call.consultWithServiceQueue', callObj.sessionId, data.nodeId)
        .then(ret => {
            console.log("(consultWithServiceQueue) sucess");
            popupWarning("Info", "Ringer op til " + data.label, 1);
        })
        .catch(error => {
            popupWarning("error", "Det var ikke muligt at stille om til " + data.label);
            console.log("(consultWithServiceQueue) error", error);
        });

    console.log("(consultWithServiceQueue) Out");
}


/** @function 
 * @name agentSetAvailable
 * @async
 * @description Set agent avaible
 * @since 1.0.0.0
*/
const agentSetAvailable = async () => {
    let agentCcStatus = await api.call('agent.contactCentreStatus');
    agentCcStatus = agentCcStatus.toUpperCase();
    console.info("(agentSetAvailable) agentCcStatus", agentCcStatus);

    let agentStatus = await api.call('agent.userStatus');
    agentStatus = agentStatus.toUpperCase();
    console.info("(agentSetAvailable) agentStatus", agentStatus);

    if (agentCcStatus === "PAUSE") {
        api.call('agent.unpause')
            .then(ret => {
                console.info("(agentSetAvailable) success", agentCcStatus);
            })
            .catch(error => {
                console.error("(agentSetAvailable) error", error);
            });
        return;
    }

    if (agentStatus === "BUSY" || agentStatus === "NOANSWER" || agentStatus === "WRAPUP") {
        api.call('agent.setAvailable')
            .then(ret => {
                console.info("(agentSetAvailable) success2", agentStatus);
            })
            .catch(error => {
                console.error("(agentSetAvailable) error2", error);
            });
    }
};


/** @function 
 * @name popupWarning
 * @param {string} [type="warning"] - Type 
 * @param {string} [message="invalid number"] - Message to be shown
 * @param {number} timeout - Time that popup is shown  
 * @description Popup Warning
 * @since 1.0.0.0
*/
function popupWarning(type = "warning", message = "Ugyldigt nummer " + $('#phoneInput').val(), timeout = 2) {
    api.call('widget.alert', type, message, { "global": false, "timeout": timeout * 1000, "icon": "fas fa-phone-slash" });
}


/** @function 
 * @name puzzelUpdateVarsEmp
 * @async
 * @param {string} number - Number 
 * @param {string} fullName - Full name
 * @param {number} department - Department 
 * @param {number} type - Transfer type 
 * @description Update Call Variables Employees
 * @since 1.0.0.0
*/
const puzzelUpdateVarsEmp = async (number, fullName, department, type) => {
    let agentName = $("#userInfoName").val();

    let apiUrl = `${puzzelUrl}/customers/${custObj.customerKey}/requests/${callObj.requestId}/update`;
    let variablesArr = [
        {
            "name": "tdcCatFullName",
            "value": fullName
        },
        {
            "name": "tdcCatDepartment",
            "value": department
        },
        {
            "name": "tdcCallingNumber",
            "value": callObj?.caller
        },
        {
            "name": "tdcCatCalledNumber",
            "value": number
        },
        {
            "name": "tdcTransferType",
            "value": type
        },
        {
            "name": "tdcAgentName",
            "value": agentName
        }
    ];

    console.info("(puzzelUpdateVarsEmp) variablesArr", variablesArr);
    let body = JSON.stringify(
        {
            "requestUpdateObject": {
                "variables": variablesArr
            }
        }
    );

    let responseJson = await puzzelApiCall(apiUrl, "POST", body);
}


/** @function 
 * @name puzzelUpdateVarsQue
 * @async
 * @param {string} nodeId - Node Id 
 * @param {string} label - Label
 * @param {number} description - Description 
 * @param {number} type - Transfer type 
 * @description Update Call Variables Queue
 * @since 1.0.0.0
*/
const puzzelUpdateVarsQue = async (nodeId, label, description, type) => {
    let agentName = $("#userInfoName").val();

    let apiUrl = `${puzzelUrl}/customers/${custObj.customerKey}/requests/${callObj.requestId}/update`;
    let variablesArr = [
        {
            "name": "tdcQueCalledQueueId",
            "value": nodeId
        },
        {
            "name": "tdcQueCalledQueueName",
            "value": label
        },
        {
            "name": "tdcQueCalledQueueDescription",
            "value": description
        },
        {
            "name": "tdcCallingNumber",
            "value": callObj?.caller || ""
        },
        {
            "name": "tdcTransferType",
            "value": type
        },
        {
            "name": "tdcAgentName",
            "value": agentName
        }
    ];

    if (description !== "Park") {
        variablesArr.push("tdcQueLastCalledQueueId", nodeId)
    }

    console.info("(puzzelUpdateVarsQue) variablesArr", variablesArr);
    let body = JSON.stringify(
        {
            "requestUpdateObject": {
                "variables": variablesArr
            }
        }
    );

    let responseJson = await puzzelApiCall(apiUrl, "POST", body);
}


/** @function 
 * @name puzzelUpdateVarsIncoming
 * @async
 * @param {string} queueId - Queue Id 
 * @description Update Call Variables Incoming
 * @since 1.0.0.0
*/
const puzzelUpdateVarsIncoming = async (queueId) => {

    let apiUrl = `${puzzelUrl}/customers/${custObj.customerKey}/requests/${callObj.requestId}/update`;
    let variablesArr = [
        {
            "name": "tdcQueLastCalledQueueId",
            "value": queueId
        }
    ];

    console.info("(puzzelUpdateVarsIncoming) variablesArr", variablesArr);
    let body = JSON.stringify(
        {
            "requestUpdateObject": {
                "variables": variablesArr
            }
        }
    );

    let responseJson = await puzzelApiCall(apiUrl, "POST", body);
}


/** @function 
 * @name puzzelUpdateTags
 * @async
 * @param {string} number - number
 * @param {string} fullName - Full name
 * @param {string} department - Department
 * @param {string} type - Transfer type
 * @description Update Tags on Call
 * @since 1.0.0.0
*/
const puzzelUpdateTags = async (number, fullName, department, type) => {
    let varDict = {
        ndFullName: fullName || "",
        ndDepartment: department || "",
        ndCalledNumber: number,
        ndCallingNumber: callObj?.caller || "",
        ndTransferType: type
    }

    console.info("(puzzelUpdateTags) varDict", varDict);

    api.call('call.updateTags', callObj.sessionId, varDict)
        .then(ret => {
            console.info("(puzzelUpdateTags) sucess");
        })
        .catch(error => {
            console.error("(puzzelUpdateTags) error", error);
        });
}


/** @function 
 * @name puzzelApiCall
 * @async
 * @param {string} apiUrl - URL
 * @param {string} [method="GET"] - Method
 * @param {string} [body=""] - Body content
 * @param {string} [retry=true] - Retry
 * @returns {object}
 * @description Puzzel API Call
 * @since 1.0.0.0
*/
const puzzelApiCall = async (apiUrl, method = "GET", body = "", retry = true) => {
    console.debug("(puzzelApiCall) In");
    console.info("(puzzelApiCall) apiUrl", apiUrl);
    console.info("(puzzelApiCall) method", method);
    console.info("(puzzelApiCall) body", body);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + custObj.accessToken);

    let requestOptions = {
        method: method,
        headers: myHeaders
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(apiUrl, requestOptions);
        console.info("(puzzelApiCall) response", response);

        /* Unauthorized */
        if (response.status === 401) {
            if (retry) {
                await getAccessToken();
                return await puzzelApiCall(apiUrl, method, body, false);
            }
        }

        if (response?.ok) {
            reponseJson = await response.json();
            console.info("(puzzelApiCall) reponseJson", reponseJson);

            if (reponseJson?.code === 0) {
                return reponseJson?.result;
            }
            else {
                console.error("(puzzelApiCall) Code Not 0", reponseJson);
            }
        }
        else {
            console.error("(puzzelApiCall) Response Not OK", response);
        }
    } catch (error) {
        console.error('(puzzelApiCall) error', error);
    }

    console.debug("(puzzelApiCall) Out");
    return null;
}


/** @function 
 * @name cbasApiCall
 * @async
 * @param {string} [method="GET"] - Method
 * @param {string} [body=""] - Body content
 * @returns {object}
 * @description CBAS API Call
 * @since 1.0.0.0
*/
const cbasApiCall = async (method = "GET", body = "") => {
    console.debug("(cbasApiCall) In");

    console.info("(cbasApiCall) body", body);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
        method: method,
        headers: myHeaders,
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(apiUrlCbas, requestOptions);

        if (response?.ok) {
            console.info("(cbasApiCall) response OK", response);
            var responseJson = await response.json();
            return responseJson;
        }
        else {
            console.error("(cbasApiCall) Response Not OK", response);
        }
    } catch (error) {
        console.error('(cbasApiCall) error', error);
    }

    console.debug("(cbasApiCall) Out");

    return null;
}


/** @function 
 * @name scaleApiCall
 * @async
 * @param {string} resUrl - URL
 * @param {string} [method="GET"] - Method
 * @param {string} [body=""] - Body content
 * @param {string} [token=""] - Token
 * @returns {object}
 * @description Scale Call
 * @since 1.0.0.0
*/
const scaleApiCall = async (resUrl, method = "GET", body = "", token = "") => {
    console.debug("(scaleApiCall) In");
    console.info("(scaleApiCall) resUrl", ndBuddyUrl + resUrl);
    console.info("(scaleApiCall) method", method);
    console.info("(scaleApiCall) body", body);

    var apiHeaders = new Headers();
    apiHeaders.append("Content-Type", "application/json");
    if (token !== "") {
        apiHeaders.append("Authorization", "Bearer " + custObj.accessToken);
    }
    //apiHeaders.append("Authorization", "Basic " + btoa(`${userName}:${userPassword}`));

    let requestOptions = {
        method: method,
        headers: apiHeaders
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(ndBuddyUrl + resUrl, requestOptions);

        if (response?.ok) {
            reponseJson = await response.json();
            console.info("(scaleApiCall) reponseJson: ", reponseJson);

            if (reponseJson?.HasError) {
                console.warn("(scaleApiCall) Has Error: ", reponseJson.ErrorText);
            }
            return reponseJson;
        }
        else {
            console.error("(scaleApiCall) Response Not OK: ", response);
        }
    } catch (error) {
        console.error('(scaleApiCall) error: ', error);
    }

    console.debug("(scaleApiCall) Out");
    return null;
}



/** @function 
 * @name setButtonStatesFromCurrentCall
 * @async
 * @description Set Button States from Current Call
 * @since 1.0.0.0
*/
const setButtonStatesFromCurrentCall = async () => {
    let call = await api.call('call.getCurrentCall');
    console.info("(setButtonStatesFromCurrentCall) call", call);

    ndParseCallState(call, true);
}


/** @function 
 * @name transferOnEnter
 * @param {object} data - Data
 * @param {object} originalEvent - Original event
 * @description Transfer on Enter
 * @since 1.0.0.0
*/
function transferOnEnter(data, originalEvent) {
    console.info("(transferOnEnter) data", data);

    /* Now Allowed */
    if (data.noTransfer) {
        console.info("EnterKey NotAllowed");
        return;
    }

    let number = tdcGetPrimaryNumber(data, originalEvent.shiftKey);

    console.info("EnterKey number", number);

    if (number === "") {
        console.info("EnterKey NoNumber found");
        return;
    }

    /* Outbound call */
    if (!callObj.isConnected) {
        outboundCall(number);
        return;
    }

    /* Warm transfer */
    if ($('.thPhone').hasClass("ndColorLightRed")) {
        consultWithPhone(number, data.fullName, data.departmentName);
        return;
    }

    /* Cold transfer */
    transferToPhone(number, data.fullName, data.departmentName);
}


/** @function 
 * @name tdcReadJsonFile
 * @async
 * @param {string} filePath - File path
 * @returns {object}
 * @description Read json content from file
 * @since 1.0.0.0
*/
async function tdcReadJsonFile(filePath) {
    const response = await fetch(filePath);
    const content = await response.json();

    console.info("(tdcReadJsonFile) content", content);
    return content;
}


/** @function 
 * @name tdcFetchUrl
 * @async
 * @param {string} url - URL
 * @param {string} [method=""] - Method
 * @param {string} [body=""] - Body
 * @param {string} [token=""] - Token
 * @returns {object}
 * @description Fetch json from url
 * @since 1.0.0.0
*/
async function tdcFetchUrl(url, method = "GET", body = "", token = "") {
    console.debug("(tdcFetchUrl) In");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (token !== "") {
        myHeaders.append("Authorization", "Bearer " + token);
    }

    let requestOptions = {
        method: method,
        headers: myHeaders
    };

    if (method !== "GET" && body !== "") {
        requestOptions.body = body;
    }

    try {
        var response = await fetch(url, requestOptions);
        console.info("(tdcFetchUrl) response", response);
        if (response?.ok) {
            var responseJson = await response.json();
            console.info("(tdcFetchUrl) responseJson", responseJson);
            return responseJson;
        }
        else {
            console.error("(tdcFetchUrl) Response Not OK", response);
        }
    }
    catch (error) {
        console.error('(tdcFetchUrl) error', error);
    }

    console.debug("(tdcFetchUrl) Out");

    return null;
}


/** @function 
 * @name tdcParkCurrentCall
 * @async
 * @param {boolean} [shiftDown=false] - Shift Down
 * @description Park current call
 * @since 1.0.0.0
*/
async function tdcParkCurrentCall(shiftDown = false) {
    console.debug("(tdcParkCurrentCall) In");

    if (typeof callObj.sessionId === 'undefined') {
        console.warn("(tdcParkCurrentCall) No active call");
        return;
    }

    let tdcid = $("#dFullName").attr("tdcid");
    console.info("(tdcParkCurrentCall) tdcid", tdcid);

    if (tdcid === "") {
        console.warn("(tdcParkCurrentCall) No data");
        return;
    }
    const data = {
        phone: $("#dPhone").text(),
        mobile: $("#dMobile").text(),
        fullName: $("#dFullName").text(),
        departmentName: $("#dDepartmentName").text()
    }
    console.info("(tdcParkCurrentCall) data", data);

    let number = $("#dFullName").attr("lastParkedNumber");
    console.info("(tdcParkCurrentCall) lastParkedNumber", number);

    if (number === "") {
        number = tdcGetPrimaryNumber(data, shiftDown);
    }

    console.info("(tdcParkCurrentCall) number", number);

    let queueId = parseInt($("#settingParkDefaultQueue").val());

    if (!queueIdsMapDicG.has(queueId)) {
        console.warn("(tdcParkCurrentCall) queueId not found", queueId);
        return;
    }

    const dataObj = {
        nodeId: queueIdsMapDicG.get(queueId).nodeId,
        label: queueIdsMapDicG.get(queueId).label,
        description: "Park"
    };

    console.info("(tdcParkCurrentCall) dataObj", dataObj);

    puzzelUpdateVarsEmp(number, data.fullName, data.departmentName, "Park");

    transferToService(dataObj);

    console.debug("(tdcParkCurrentCall) Out");
}


/** @function 
 * @name tdcBuddyPopupWindow
 * @async
 * @param {string} url - URL
 * @param {number} [timeout=1000] - Timeout i ms before auto close
 * @description TDC Popup Window (KMD Easy etc.)
 * @since 1.0.0.0
*/
function tdcBuddyPopupWindow(url, timeout = 1000) {
    console.debug("(tdcBuddyPopupWindow) In");

    let params = `scrollbars=no, resizable=no, status=no, location=no, toolbar=no, menubar=no, width=50, height=50, left=4000, top=2000`;
    let newWindow = window.open(`tdcbuddypopup:${url}`, "TdcBuddyPopup", params);

    setTimeout(function () { newWindow.close() }, timeout);

    console.debug("(tdcBuddyPopupWindow) In");
}