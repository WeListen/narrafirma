"use strict";

// Currently BROKEN -- and unused

define([
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/registry",
    "dojo/string",
    "dijit/layout/ContentPane",
    "dijit/form/Select",
    "dijit/form/SimpleTextarea",
    "dojox/layout/TableContainer",
    "dojo/domReady!"
], function(
    array,
    connect,
    domConstruct,
    domStyle,
    registry,
    string,
    ContentPane,
    Select,
    SimpleTextarea,
    TableContainer
){
    // questionTable support
    
    function newSpecialSelect(table, id, options) {
        var theOptions = [];
        // TODO: Translate label for no selection
        theOptions.push({label: " -- select -- ", value: ""});
        array.forEach(options, function(option) {
            //console.log("newSpecialSelect option", id, option);
            theOptions.push({label: option, value: option});
        });
        var select = new Select({
            id: id,
            options: theOptions,
            // TODO: Width should be determined from content using font metrics across all dropdowns
            width: "150px"
        });
        table.addChild(select);
        select.startup();
        return select;
    }
    
    function newSpecialTextArea(table, id) {
        var textarea = new SimpleTextarea({
            id: id,
            rows: "6",
            cols: "30",
            style: "width:auto;"
        });
        table.addChild(textarea);
        textarea.startup();
        return textarea;
    }
    
    function insertQuestionsTable(pseudoQuestion, pagePane, pageDefinitions) {
        // console.log("insertQuestionsTable start", pseudoQuestion);
        
        var groupHeader1 = new ContentPane({"content": "<i>N/A</i>", "colspan": 1});
        var groupHeader2 = new ContentPane({"content": "<i>N/A</i>", "colspan": 1});
        var groupHeader3 = new ContentPane({"content": "<i>N/A</i>", "colspan": 1});
        
        function updateRole1(newValue) {
            if (newValue === "") newValue = "N/A";
            groupHeader1.set("content", "<b><i>" + newValue + "</i></b>");
        }

        function updateRole2(newValue) {
            if (newValue === "") newValue = "N/A";
            groupHeader2.set("content", "<b><i>" + newValue + "</i></b>");
        }
        
        function updateRole3(newValue) {
            if (newValue === "") newValue = "N/A";
            groupHeader3.set("content", "<b><i>" + newValue + "</i></b>");
        }
        
        var groupIDs = pseudoQuestion.options.split(";");
        // TODO: Make all these consistent with semicolon
        if (groupIDs.length == 1) {
            groupIDs = pseudoQuestion.options.split(",");
            console.log("WARNING: options should be seperated by semicolon", pseudoQuestion);
        }
        // console.log("groupIDs", groupIDs);
        
        var widget1 = registry.byId(groupIDs[1]);
        if (!widget1) return console.log("ERROR: insertQuestionsTable widget 1 not found", groupIDs[0], pseudoQuestion);
        widget1.on("change", updateRole1);
        
        var widget2 = registry.byId(groupIDs[2]);
        if (!widget2) return console.log("ERROR: insertQuestionsTable widget 2 not found", groupIDs[1], pseudoQuestion);
        widget2.on("change", updateRole2);
        
        var widget3 = registry.byId(groupIDs[3]);
        if (!widget3) return console.log("ERROR: insertQuestionsTable widget 3 not found", groupIDs[2], pseudoQuestion);
        widget3.on("change", updateRole3);
        
        var questionDefinitionPage = groupIDs[0];
        
        if (!pageDefinitions[questionDefinitionPage]) return console.log("ERROR: no page definitions found for referenced page", questionDefinitionPage, pseudoQuestion);
        // console.log("questionDefinitionPage", questionDefinitionPage);
        var questions = pageDefinitions[questionDefinitionPage].questions;
        
        var table = new TableContainer({
            cols: 4,
            showLabels: false,
            spacing: 10
        });
        
        var columnHeader1ContentPane = new ContentPane({"content": "<i>Question</i>", "colspan": 1, "align": "right"});
        table.addChild(columnHeader1ContentPane);
        columnHeader1ContentPane.startup();
        
        table.addChild(groupHeader1);
        groupHeader1.startup();
        
        table.addChild(groupHeader2);
        groupHeader2.startup();
        
        table.addChild(groupHeader3);
        groupHeader3.startup();
        
        array.forEach(questions, function(question) {
            // console.log("question", question);
            if (question.type === "header") {
                var content = "<b>" + question.text + "</b>";
                var headerContentPane = new ContentPane({"content": content, "colspan": 1, "align": "right"});
                table.addChild(headerContentPane);
                headerContentPane.startup();
                // Add three blank panes to fill out row
                table.addChild(new ContentPane());
                table.addChild(new ContentPane());
                table.addChild(new ContentPane());
            } else if (question.type === "select"){
                var questionContentPane = new ContentPane({"content": question.text, "colspan": 1, "align": "right"});
                table.addChild(questionContentPane);
                questionContentPane.startup();
                
                // TODO: Translation
                var options = question.options.split("\n");
                // console.log("insertQuestionsTable options", question.id, options);

                // TODO: Maybe should do this to get styling and div id right? questionEditor.insertQuestionIntoDiv(question, page.containerNode);
                //newSpecialSelect(table, question.id + "_" + 1, options);
                // newSpecialSelect(table, question.id + "_" + 2, options);
                // newSpecialSelect(table, question.id + "_" + 3, options);
                var select1 = widgets.newSelect(question.id + "_" + 1, null, question.options);
                table.addChild(select1);
                var select2 = widgets.newSelect(question.id + "_" + 2, null, question.options);
                table.addChild(select2);
                var select3 = widgets.newSelect(question.id + "_" + 3, null, question.options);
                table.addChild(select3);
            } else if (question.type === "textarea") {
                var textAreaContentPane = new ContentPane({"content": question.text, "colspan": 1, "align": "right"});
                table.addChild(textAreaContentPane);
                textAreaContentPane.startup();
                
                newSpecialTextArea(table, question.id + "_" + 1);
                newSpecialTextArea(table, question.id + "_" + 2);
                newSpecialTextArea(table, question.id + "_" + 3);
                
            } else {
                console.log("ERROR: unsupported type for questionsTable:", question.type);
            }
        });
        
        pagePane.addChild(table);
        
        table.startup();
        // console.log("insertQuestionsTable finished");
    }
    
    return {
        "insertQuestionsTable": insertQuestionsTable
    };
    
});