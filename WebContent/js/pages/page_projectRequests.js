// Generated from design
"use strict";

define([
    "../widgetBuilder"
], function(
    widgets
) {

    function addWidgets(contentPane, model) {
        widgets.add_label(contentPane, model, "project_returnRequestsLabel");
        widgets.add_grid(contentPane, model, "project_returnRequestsList", ["page_addNewReturnRequest"]);
    }

    var questions = [
        {"id":"project_returnRequestsLabel", "type":"label", "isReportable":false, "isHeader":false},
        {"id":"project_returnRequestsList", "type":"grid", "isReportable":true, "isHeader":false}
    ];

    return {
        "id": "page_projectRequests",
        "name": "Respond to requests for post-project support",
        "type": "page",
        "isHeader": false,
        "addWidgets": addWidgets,
        "questions": questions
    };
});