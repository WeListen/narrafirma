define([
    "lib/d3/d3",
    "dojox/uuid/generateRandomUuid",
    "js/questionnaireGeneration",
    "js/surveyBuilder",
    "js/surveyCollection",
    "dojo/domReady!"
], function(
    d3,
    generateRandomUuid,
    questionnaireGeneration,
    surveyBuilder,
    surveyCollection
){
    "use strict";
    
    // TODO: Fix big kludge of this module level variable across the app!
    var lastQuestionnaireUploaded = null;
    
    var project;

    function initialize(theProject) {
        project = theProject;
    }
 
    function processCSVContents(contents, callbackForItem) {
        console.log("processCSVContents contents", contents);
        
        var rows = d3.csv.parseRows(contents);
        console.log("rows", rows);
        
        var items = [];
        var header;
        
        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            var row = rows[rowIndex];
            // Throw away initial blank lines and comment lines
            if (!row.length || !row[0] || row[0].trim().charAt(0) === ";") {
                console.log("comment", row[0]);
            } else {
                if (!header) {
                    header = [];
                    var headerEnded = false;
                    for (var headerIndex = 0; headerIndex < row.length; headerIndex++) {
                        var label = row[headerIndex];
                        if (label) {
                            // Should be an error if header fields are missing but more show up later
                            if (headerEnded) {
                                console.log("ERROR: header has empty field before end");
                                alert("ERROR: header has empty field before end");
                            }
                            header.push(label);
                        } else {
                            headerEnded = true;
                        }
                    }
                } else {
                    var newItem = callbackForItem(header, row);
                    if (newItem) items.push(newItem);
                }
            }
        }
        // console.log("header", header);
        // console.log("items", items);
        return {header: header, items: items};
    }

    function processCSVContentsForStories(contents) {
        // Throws away line after header which starts with a blank
        var headerAndItems = processCSVContents(contents, function (header, row) {
            var newItem = {};
            for (var fieldIndex = 0; fieldIndex < header.length; fieldIndex++) {
                var fieldName = header[fieldIndex];
                // TODO: Should the value really be trimmed?
                var value = row[fieldIndex].trim();
                if (newItem[fieldName] === undefined) {
                    newItem[fieldName] = value;
                } else {
                    // Handle case where this is a multiple choice question, which is indicated by multiple columns
                    var data = newItem[fieldName];
                    if (data && typeof data === 'object') {
                        if (value !== "") data[value] = true;
                    } else {
                       var newData = {};
                       if (data !== "") newData[data] = true;
                       if (value !== "") newData[value] = true;
                       newItem[fieldName] = newData;
                    }
                }
            }
            return newItem;
        });
        console.log("processCSVContentsForStories headerAndItems", headerAndItems);
        var items = headerAndItems.items;
        for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
            var item = items[itemIndex];
            console.log("item", item);
            // TODO: Copied code from surveyBuilder module! Need a common function with surveyBuilder to make this!!!
            var surveyResult = {
                __type: "org.workingwithstories.QuestionnaireResponse",
                // TODO: Think about whether to include entire questionnaire or something else perhaps
                // TODO: Big kludge to use (module) global here!!!
                questionnaire: lastQuestionnaireUploaded,
                responseID: generateRandomUuid(),
                stories: [],
                participantData: {
                    __type: "org.workingwithstories.ParticipantData",
                    _participantID: generateRandomUuid()
                },
                // TODO: Should have timestamp in CSV file!!!
                timestampStart: "" + new Date().toISOString(),
                timestampEnd: "" + new Date().toISOString(),
                // TODO: this is a kludgy way to get a string and seems brittle
                importedBy: project.userIdentifier.userIdentifier
            };
            
            var story = {};
            // Looks like eliciting question maybe not needed if only one question? Also, should have support for multiple ones if CSV adds them
            story.__survey_elicitingQuestion = lastQuestionnaireUploaded.elicitingQuestions[0].id;
            story.__survey_storyText = item["Story text"];
            story.__survey_storyName = item["Story title"];
            var i;
            var question;
            for (i = 0; i < lastQuestionnaireUploaded.storyQuestions.length; i++) {
                question = lastQuestionnaireUploaded.storyQuestions[i];
                story[question.id] = item[question.id.substring("__survey_".length)];
            }
            surveyResult.stories.push(story);
            for (i = 0; i < lastQuestionnaireUploaded.participantQuestions.length; i++) {
                question = lastQuestionnaireUploaded.participantQuestions[i];
                surveyResult.participantData[question.id] = item[question.id.substring("__survey_".length)];
            }
            console.log("surveyResult", surveyResult);
        }
    }
    
    function processCSVContentsForQuestionnaire(contents) {
        var headerAndItems = processCSVContents(contents, function (header, row) {
            console.log("callback", header, row);
            var newItem = {};
            var lastFieldIndex;
            for (var fieldIndex = 0; fieldIndex < row.length; fieldIndex++) {
                var fieldName = header[fieldIndex];
                if (fieldName) {
                    lastFieldIndex = fieldIndex;
                } else {
                    fieldName = header[lastFieldIndex];
                }
                // TODO: Should the value really be trimmed?
                var value = row[fieldIndex].trim();
                console.log("fieldName, value", fieldName, value);
                if (fieldIndex < header.length - 1) {
                    newItem[fieldName] = value;
                } else {
                    // Handle multiple values for last header items
                    var list = newItem[fieldName];
                    console.log("list", list, fieldIndex, fieldName);
                    if (!list) {
                        list = [];
                        newItem[fieldName] = list;
                    }
                    if (value) list.push(value);
                }
            }
            return newItem;
        });
        console.log("processCSVContentsForQuestionnaire headerAndItems", headerAndItems);
        
        var shortName = prompt("Please enter a short name for this questionnaire");
        if (!shortName) return;
        if (questionnaireGeneration.buildQuestionnaire(project, shortName)) {
            alert('A questionnaire already exists with that name: "' + shortName + '"');
            return;
        }
        
        // For now, no eliciting questions, so the default one would be used
        
        // Add story questions
        // TODO: What if questions with the same shortName but different options already exist?
        
        var questionnaire = {
            title: shortName,
            startText: "",
            image: "",
            elicitingQuestions: [],
            storyQuestions: [],
            participantQuestions: [],
            endText: ""
        };
        
        var items = headerAndItems.items;
        for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
            var item = items[itemIndex];
            var about = item.About;
            if (about === "story") {
                questionnaire.storyQuestions.push(questionForItem(item));
            } else if (about === "participant") {
                questionnaire.participantQuestions.push(questionForItem(item));
            } else {
                console.log("Error: unexpected About type of", about);
            }
        }
        
        questionnaireGeneration.ensureAtLeastOneElicitingQuestion(questionnaire);
        console.log("CSV questionnaire made", questionnaire);
        lastQuestionnaireUploaded = questionnaire;
        return questionnaire;
    }
    
    function questionForItem(item) {
        var valueType = "string";
        var type = "text";
        var valueOptions;
        var displayConfiguration;
        var answers = item["Answers"];
        
        var itemType = item["Type"];
        if (itemType === "Single choice") {
            type = "select";
            valueOptions = answers;
        } else if (itemType === "Scale") {
            valueType = "number";
            type = "slider";
            displayConfiguration = [answers[0], answers[1]];
        } if (itemType === "Multiple choice") {
            type = "checkboxes";
            valueOptions = item["Answers"];
        } else {
            console.log("IMPORT ERROR: unsupported question type: ", itemType);
        }
        return {
            valueType: valueType,
            displayType: type,
            id: "__survey_" + item["Short name"], 
            valueOptions: valueOptions, 
            displayName: item["Short name"], 
            displayPrompt: item["Long name"],
            displayConfiguration: displayConfiguration
        };
    }
    
    function chooseCSVFileToImport(callback) {
        // console.log("chooseFileToImport");
        var cvsFileUploader = document.getElementById("csvFileLoader");
        // console.log("cvsFileUploader", cvsFileUploader);
        cvsFileUploader.onchange = function() {
            var file = cvsFileUploader.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                var contents = e.target.result;
                callback(contents);
            };
            reader.readAsText(file);
        };
        cvsFileUploader.click();
    }
    
    function importCSVStories() {
        if (!lastQuestionnaireUploaded) return alert("You need to upload a questionnaire first");
        chooseCSVFileToImport(processCSVContentsForStories);
    }
    
    function importCSVQuestionnaire() {
        chooseCSVFileToImport(processCSVContentsForQuestionnaire);
    }
    
    return {
        initialize: initialize,
        importCSVStories: importCSVStories,
        importCSVQuestionnaire: importCSVQuestionnaire
    };
});