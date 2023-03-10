//  Copyright (c) 2023, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause

({

    initAction: function(component, event, helper) {
		
        var clients = [{ 
            			  "label" : 'Bureau of Labor Statistics', "value" : 'Bureau of Labor Statistics' 
        				},
                       {
                          "label" : 'Employment & Training Administration', "value" : 'Employment & Training Administration'  
                       },
                       {
                          "label" : 'Occupational Safety & Health Admin', "value" : 'Occupational Safety & Health Admin'  
                       },
                       { 
            			  "label" : 'Office of Asst. Secy. for Admin. & Mgt', "value" : 'Office of Asst. Secy. for Admin. & Mgt' 
        				},
                       {
                          "label" : 'Office of the Deputy Secretary', "value" : 'Office of the Deputy Secretary'  
                       },
                       {
                          "label" : 'Office of the Inspector General', "value" : 'Office of the Inspector General'  
                       },
                       { 
            			  "label" : 'Solicitor of Labor', "value" : 'Solicitor of Labor' 
        				},
                       {
                          "label" : 'Wage and Hour Division', "value" : 'Wage and Hour Division'  
                       },
                       {
                          "label" : 'Mine Safety and Health Administration', "value" : 'Mine Safety and Health Administration'  
                       }
                      ];
        component.set("v.clientoptions",clients);

        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");

        var dataModel = {};
        var startDate = helper.SF2JSDate(component.get("v.startDate"));
        var endDate = helper.SF2JSDate(component.get("v.endDate"));
        var timePeriod = component.get("v.timePeriod");

        if (timePeriod == "week" || timePeriod == "month") {
            var calculatedDates = helper.calculateTimePeriod(helper, startDate, timePeriod)
            startDate = calculatedDates.startDate;
            endDate = calculatedDates.endDate;
        }


        // GET EXISTING TIME ALLOCATIONS FOR SALESFORCE DATABASE

        var action = component.get("c.getAllocations");
        action.setParams({
            contactId: component.get("v.contactId"),
            startDateStr: helper.JS2SFDate(startDate, 1),
            endDateStr: helper.JS2SFDate(endDate, 1)
        });
        action.setCallback(this, function(response) {

            var state = response.getState();
            if (state === "SUCCESS") {
                var loadData = response.getReturnValue();


                helper.initModel(helper, component, dataModel, startDate, endDate);
                helper.createLines(helper, dataModel, loadData.length);
                helper.loadLines(dataModel, loadData);
                helper.calculateTotals(dataModel);


                component.set("v.dataModel", dataModel);


            }
            $A.util.addClass(spinner, "slds-hide");
        });

        //Let's empty the project box and disabled the add button.
        //component.set("v.projectId",""); Disable because trigger a change loop. I need to find a workaround for this.
        var lookupField=component.find("lookupField");
        lookupField.clearField();
        component.set("v.projectToBeAdded.isValid",false);

        $A.enqueueAction(action);


    },

    saveAction: function(component, event, helper) {

        /*if ((typeof event.getParam === 'function')
           && (event.getParam("parentGID")!=component.get("v.parentGID"))) {*/
        /*Do not handle saveAction if component is alive multiple times in the framework
        /*and parent component firing saveThenRefreshEvent is not the true father of the child.
        /*This prevent having all the timesheet saving themselves when receiving the saveThenRefreshEvent.
        /*This is a workaround until component.find is working for dynamically created component.
        /* When this will be the case, code could be refactored to not use application events anymore
        /* but aura:method
        */
            
            /*console.log('**event gid**',event.getParam("parentGID"));
            console.log('**component gid**',component.get("v.parentGID"));
            console.log('**event.getParam',event.getParam);
        return;
        }*/


        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");

        var dataModel = component.get("v.dataModel");

        var toBeSaved = helper.prepareToBeSavedObject(dataModel);


        var action = component.get("c.saveAllocations");

        action.setParams({
            toUpsert: toBeSaved.toUpsert,
            toDelete: toBeSaved.toDelete
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            //console.log("entering SAVE callback");
            //console.log("state :" + state);
            if (state === "SUCCESS") {
                console.log("SAVE SUCCESS");
                helper.afterSaveCleaning(dataModel);
                component.set("v.dataModel", dataModel);

                if(toBeSaved.toUpsert.length>0 || toBeSaved.toDelete.length>0){
                  helper.toastMessage("success","Success!","Timesheet has been saved successfully.");
              } else if ((typeof event.type !== 'undefined') && (event.type == "click")) {
                  helper.toastMessage("info","Info","Nothing new to be saved...");
              }
                //Let's refresh the view now !
                var refreshEvent = component.getEvent("refreshEvent");
                refreshEvent.fire();
                //console.log("event refresh Fired");
				$A.get('e.force:refreshView').fire();
            } else {
                console.log(response.getError()[0].message);
                $A.util.addClass(spinner, "slds-hide");
                helper.toastMessage("error","Error","Unable to save... Is selected contact or projects still existing ? Try the the refresh button to clean the view");
            }
            //$A.util.addClass(spinner, "slds-hide");
        });
        //console.log("enqueuing SAVE Action");
        $A.enqueueAction(action);

    },




    onCellChange: function(component, event, helper) {
        var dataModel = helper.cloneObj(component.get("v.dataModel"));
        var maxNumberOfHoursADay = parseInt(component.get("v.maxNumberOfHoursADay"));
        var whichOne = event.currentTarget;
        var lineIndex = whichOne.dataset.lineindex;
        var colIndex = whichOne.dataset.colindex;
        var actionType=whichOne.dataset.actiontype;
        var value;
        if (actionType=="add1") {value=dataModel.lines[lineIndex].cells[colIndex].qty+1}
        else if (actionType=="remove1") {value=dataModel.lines[lineIndex].cells[colIndex].qty-1}
        else {value = whichOne.value;}
        value = (value > maxNumberOfHoursADay) ? maxNumberOfHoursADay : value;
        value = (value < 0) ? 0 : value;
        console.log("lineIndex: " + lineIndex + " colIndex: " + colIndex + " value: " + value);
        dataModel.lines[lineIndex].cells[colIndex].qty = value;
        dataModel.lines[lineIndex].cells[colIndex].isModified = true;
        helper.calculateTotals(dataModel);
        console.log(dataModel);
        component.set("v.dataModel", dataModel);


        // cmp.set("v.whichButton", whichOne);
    },


    testTimePeriod: function(component, event, helper) {
        //alert('Fake demo component button ;)');
        var startDate = helper.SF2JSDate(component.get("v.startDate"));
        var test = helper.calculateTimePeriod(helper, startDate, "week");
        console.log("Input startDate: " + component.get("v.startDate"));
        console.log("calculated dates for week and month");
        console.log(helper.calculateTimePeriod(helper, startDate, "week"));
        console.log(helper.calculateTimePeriod(helper, startDate, "month"));
        console.log("contactId: " + component.get("v.contactId"));
        console.log("startDate: " + component.get("v.startDate"));
        console.log("timePeriod: " + component.get("v.timePeriod"));
        console.log("needsRefresh: " + component.get("v.needsRefresh"));
        console.log("project Lookup: " + component.get("v.projectId"));
        console.log("dataModel");
        console.log(component.get("v.dataModel"));
        //console.log("1 st project name: "+component.get("v.dataModel.lines")[0].projectName);

    },

    addLine: function(component, event, helper) {
        var dataModel = helper.cloneObj(component.get("v.dataModel"));
        var projectToBeAdded = component.get("v.projectToBeAdded");
        //ADD THE NEW LINE
        helper.addNewLine(dataModel,projectToBeAdded,component);
        helper.calculateTotals(dataModel);
        console.log(dataModel);
        component.set("v.dataModel", dataModel);
        //DISABLE ADD BUTTON
        projectToBeAdded.isValid=false;
        component.set("v.projectToBeAdded", projectToBeAdded);
        // ERASE LOOKUP FIELD
        var lookupField=component.find("lookupField");
        lookupField.clearField();

		var caselookup = component.find("matterlookupField");
        $A.util.addClass(caselookup,'slds-hide');
        
        
        
        var statutelookup = component.find("statutelookupField");
        $A.util.addClass(statutelookup,'slds-hide');
    }, 
    
    chooseStatuteAction : function(component, event, helper){
        var action = component.get("c.getStatute");
        action.setParams({
            sid : component.get("v.statuteId")
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log("SUCCESS");
                component.set("v.statutetobeadded",response.getReturnValue()); 
            } else {
                console.log(response.getError()[0].message);
            }
        });
        
        $A.enqueueAction(action);
    },
    
    chooseCaseAction : function(component, event, helper){
         
		var action = component.get("c.getCase");
        action.setParams({
            caseid : component.get("v.matterId")
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log("SUCCESS");
                component.set("v.mattertobeadded",response.getReturnValue()); 
            } else {
                console.log(response.getError()[0].message);
            }
        });

        $A.enqueueAction(action);
    },

    chooseProjectAction: function(component, event, helper) {
        var dataModel=component.get("v.dataModel");
        var project = {};
        project.isValid = false;
        project.id=component.get("v.projectId");
        
        
        
        var action = component.get("c.getProjectName");
        action.setParams({
            projectId: project.id
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log("SUCCESS");
                project.name=response.getReturnValue();
                //console.log('**in ',project.id);
                /*console.log('**hey isProjectAlreadyLoaded'+helper.isProjectAlreadyLoaded(dataModel,project.id));
                console.log('*component.get("v.contactId")*',component.get("v.contactId").length > 6));
                console.log('**readonly',component.get("v.readOnly"));*/
                
                if ((helper.isProjectAlreadyLoaded(dataModel,project.id)==false)
                    && (typeof component.get("v.contactId") !== 'undefined')
                    && (component.get("v.contactId").length > 6)
                    && (component.get("v.readOnly")==false)){
                        project.isValid=true;
                }
                
                if(project.name == 'Category 1'){
                    var matterlookup = component.find("matterlookupField");
                    $A.util.removeClass(matterlookup,'slds-hide'); 
                }else if(project.name == 'Category 2'){
                    var statutelookup = component.find("statutelookupField");
                    $A.util.removeClass(statutelookup,'slds-hide'); 
                }
                component.set("v.projectToBeAdded", project);
                console.log('***the selected project',project);

            } else {
                console.log(response.getError()[0].message);
            }
        });
        console.log("enqueuing getName");
        component.set("v.projectToBeAdded", project);
        $A.enqueueAction(action);

    },

    navigateToRecord: function(component, event, helper) {
        var el = event.currentTarget;
        var id = el.dataset.recordid; //id here is from 'data-*' in the element
        //alert(id);
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": id
        });
        navEvt.fire();
    }



})