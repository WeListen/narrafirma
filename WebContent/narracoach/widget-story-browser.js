"use strict";

define([
    "dojo/_base/array",
    "dojo/_base/connect",
    "narracoach/domain",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/query",
    "narracoach/question_editor",
    "dijit/registry",
    "dojo/string",
    "narracoach/widgets",
    "narracoach/widget-grid-table",
    "dojo/_base/window",
    "dijit/layout/ContentPane",
    "dojo/store/Memory",
    "dijit/form/MultiSelect",
    "dijit/form/Select",
    "dojox/layout/TableContainer",
    "dojo/domReady!"
], function(
    array,
    connect,
    domain,
    domConstruct,
    domStyle,
    lang,
    query,
    questionEditor,
    registry,
    string,
    widgets,
    widgetGridTable,
    win,
    ContentPane,
    Memory,
    MultiSelect,
    Select,
    TableContainer
){
    // story browser support
    
    function newSpecialSelect(id, options) {
        var theOptions = [];
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
        return select;
    }
    
    function setOptionsInMultiSelect(widget, options) {
        console.log("setOptionsInMultiSelect", widget, options);
        query('option', widget.domNode).forEach(function(node, index, arr) {
            console.log("node", node);
            domConstruct.destroy(node);
        }); 
        
        for (var i in options){
            var c = win.doc.createElement('option');
            c.innerHTML = options[i].label;
            c.value = options[i].value;
            widget.domNode.appendChild(c);
        }
        console.log("done");
    }
    
    function newMultiSelect(id, options) {
        var widget = new MultiSelect({
            "id": id + "answers1",
            "size": 12
            //"options": options
        });
        
        setOptionsInMultiSelect(widget, options);
        
        // selectWidget.on("change", mainSelectChanged);
        
        return widget;
    }
    
    function questionChanged(questionsById, multiSelect, data, newValue) {
        console.log("event", newValue);
        var question = questionsById[newValue];
        //console.log("question", question);
        var options = optionsFromQuestion(question, data);
        setOptionsInMultiSelect(multiSelect, options);
    }
    
    function optionsFromQuestion(question, data) {
        var options = [];
        
        // Compute how many of each answer -- assumes typically less than 200-1000 stories
        var totals = {};
        array.forEach(data, function(item) {
            var oldValue = totals[item[question.id]];
            if (!oldValue) oldValue = 0;
            totals[item[question.id]] = oldValue + 1;
        });
        
        var count;
        var each;
        
        if (question.type === "select") {
            console.log("select", question, question.options);
            array.forEach(question.options.split("\n"), function(each) {
                // console.log("option", id, each);
                count = totals[each];
                if (!count) count = 0;
                options.push({label: each + " (" +  count + ")", value: each});
            });
        } else if (question.type === "slider") {
            console.log("slider", question, question.options);
            for (each = 0; each <= 100; each++) {
                count = totals[each];
                if (!count) count = 0;
                options.push({label: each + " (" +  count + ")", value: each});
            }
        } else if (question.type === "boolean") {
            // TODO; Not sure this will really be right with true/false as booleans instead of strings
            array.forEach([true, false], function(each) {
                // console.log("option", id, each);
                count = totals[each];
                if (!count) count = 0;
                options.push({label: each + " (" +  count + ")", value: each});
            });
        } else if (question.type === "text") {
            for (each in totals){
                if (totals.hasOwnProperty(each)) {
                    count = totals[each];
                    if (!count) count = 0;
                    options.push({label: each + " (" +  count + ")", value: each});                    
                }
            }
        } else {
            // not supported
            options.push({label: "*ALL*" + " (" +  data.length + ")", value: "*ALL*"});
        }
        return options;
    }
    
    function createFilterPane(id, questionsById, questionOptions, data, pagePane) {
        var contentPane = new ContentPane({
            id: id + "_content",
        });
        
        pagePane.addChild(contentPane);
        
        contentPane.startup();
        
        var question = widgets.newSelect(id + "_question", questionOptions, null, contentPane);
        
        contentPane.domNode.appendChild(domConstruct.toDom('<br>'));
        
        var answers = newMultiSelect(id + "_answers", []);
        contentPane.addChild(answers);
        answers.startup();

        question.on("change", lang.partial(questionChanged, questionsById, answers, data)); 
        
        return {"contentPane": contentPane, "question": question, "answers": answers};
    }
    
    function insertStoryBrowser(pseudoQuestion, pagePane, pageDefinitions) {
        console.log("insertStoryBrowser", pseudoQuestion);

        var label = widgets.newLabel(pseudoQuestion.id + "label", pseudoQuestion.text, pagePane.domNode);

        var popupPageDefinition = {
             "id": "testDogQuestions",
             "questions": domain.testDogQuestions   
        };
        
        var data = domain.testDogStories;
        var dataStore = new Memory({
            // "data": [],
            "data": data,
            // TODO: what should this be, if anything?
            // idProperty: "name",
        }); 
        
        var questionOptions = [];
        var questionsById = {};
        array.forEach(popupPageDefinition.questions, function (question) {
            questionOptions.push({label: question.text, value: question.id});
            questionsById[question.id] = question;
        });
       
        var firstFilter = createFilterPane(pseudoQuestion.id + "_1", questionsById, questionOptions, data, pagePane);
        // var secondFilter = createFilterPane(pseudoQuestion.id + "_2", questionsById, questionOptions, data, pagePane);

        // pagePane.domNode.appendChild(domConstruct.toDom('<br>'));
        
        var storyList;
        
        // TODO: Translate
        var filterButton = widgets.newButton(pseudoQuestion.id + "_filter", "Filter", pagePane, function () {
            console.log("filter pressed");
            var question1Value = firstFilter.question.get("value");
            var answers1Value = firstFilter.answers.get("value");
            console.log("question", question1Value, "answers", answers1Value);
            storyList.grid.set("query", function (item) {
                var questionValue = "" + item[question1Value];
                var match = answers1Value.indexOf(questionValue) != -1;
                return match;
            });
        });
            
        storyList = widgetGridTable.insertGridTableBasic(pseudoQuestion.id + "grid", pagePane, popupPageDefinition, dataStore, true);
        
        console.log("insertStoryBrowser finished");
    }
    
    return {
        "insertStoryBrowser": insertStoryBrowser
    };
    
});