// Generated from design
"use strict";

define([
    "../widgetBuilder"
], function(
    widgets
) {

    function addWidgets(contentPane, model) {
        widgets.add_text(contentPane, model, "storyElement_name");
        widgets.add_select(contentPane, model, "storyElement_type", ["character","situation","value","theme","relationship","motivation","belief","conflict"]);
        widgets.add_textarea(contentPane, model, "storyElement_description");
    }

    var questions = [
        {"id":"storyElement_name", "type":"text", "isReportable":true, "isHeader":true},
        {"id":"storyElement_type", "type":"select", "isReportable":true, "isHeader":true},
        {"id":"storyElement_description", "type":"textarea", "isReportable":true, "isHeader":true}
    ];

    return {
        "id": "page_addStoryElement",
        "name": "Add story element",
        "type": "popup",
        "isHeader": false,
        "addWidgets": addWidgets,
        "questions": questions
    };
});