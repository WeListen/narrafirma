// Generated from design
"use strict";

define([
    "../widgetBuilder"
], function(
    widgets
) {

    function addWidgets(contentPane, model) {
        widgets.add_label(contentPane, model, "project_collectionDesignStartLabel");
        widgets.add_textarea(contentPane, model, "project_generalNotes_collectionDesign");
    }

    var questions = [
        {"id":"project_collectionDesignStartLabel", "type":"label", "isReportable":false, "isHeader":false},
        {"id":"project_generalNotes_collectionDesign", "type":"textarea", "isReportable":true, "isHeader":false}
    ];

    return {
        "id": "page_collectionDesign",
        "name": "Collection design",
        "type": "page",
        "isHeader": true,
        "addWidgets": addWidgets,
        "questions": questions
    };
});