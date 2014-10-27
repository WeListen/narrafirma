// Generated from design
"use strict";

define([
    "../widgetBuilder"
], function(
    widgets
) {

    function addWidgets(contentPane, model) {
        widgets.add_textarea(contentPane, model, "elicitingQuestion_text");
        widgets.add_checkBoxes(contentPane, model, "elicitingQuestion_type", ["what happened","directed question","undirected questions","point in time","event","extreme","surprise","people, places, things","fictional scenario","other"]);
        widgets.add_templateList(contentPane, model, "templates_elicitingQuestions", ["elicitingQuestions"]);
        widgets.add_label(contentPane, model, "templates_elicitingQuestions_unfinished");
    }

    var questions = [
        {"id":"elicitingQuestion_text", "type":"textarea", "isReportable":true, "isHeader":true},
        {"id":"elicitingQuestion_type", "type":"checkBoxes", "isReportable":true, "isHeader":true},
        {"id":"templates_elicitingQuestions", "type":"templateList", "isReportable":true, "isHeader":false},
        {"id":"templates_elicitingQuestions_unfinished", "type":"label", "isReportable":false, "isHeader":false}
    ];

    return {
        "id": "page_addElicitingQuestion",
        "name": "Add story eliciting question",
        "type": "popup",
        "isHeader": false,
        "addWidgets": addWidgets,
        "questions": questions
    };
});