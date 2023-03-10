//  Copyright (c) 2023, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause

({
    helperMethod: function() {

    },

    addDays: function(currentDate, days) {
        var dat = new Date(currentDate);
        dat.setDate(dat.getDate() + days);
        return dat;
    },

    getDates: function(helper, startDate, stopDate) {


        var dateArray = new Array();
        var currentDate = startDate;
        var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var monthOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        while (currentDate <= stopDate) {
            currentDate.dayName = daysOfTheWeek[currentDate.getDay()];
            currentDate.dayName3Letters = currentDate.dayName.substring(0, 3);
            currentDate.displaydate = ''+(currentDate.getMonth()+1)+'/'+currentDate.getDate()+'/'+currentDate.getFullYear();
            currentDate.dayNumber = currentDate.getDate();
            currentDate.monthName = monthOfTheYear[currentDate.getMonth()];
            currentDate.monthNumber = currentDate.getMonth() + 1;
            currentDate.cellLabel = currentDate.dayName3Letters + " " + currentDate.dayNumber;
            currentDate.sfFormat = helper.JS2SFDate(currentDate, false);
            currentDate.isWorkingDay = (currentDate.dayName == "Saturday") || (currentDate.dayName == "Sunday") ? false : true;
            dateArray.push(currentDate)
            currentDate = helper.addDays(currentDate, 1);
        }
        return dateArray;
    },

    JS2SFDate: function(date, full) {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        if (full) {
            return year + '-' + month + '-' + day + 'T00:00:00.000Z';
        } else {
            return year + '-' + month + '-' + day;
        }

    },

    SF2JSDate: function(dateAsStr) {
        var d = dateAsStr.split("T");
        var s = d[0].split("-");
        var JSDate = new Date(s[0], parseInt(s[1]) - 1, s[2], 0, 0, 0, 0);
        return JSDate;
    },



    calculateTotals: function(dataModel) {

        var grandTotal = 0;
        var colsTotals = [];


        if (!("lines" in dataModel)) {
            for (var i = 0; i < dataModel.dates.length; i++) {
                var cellColTotal = {};
                cellColTotal.qty=0;
                cellColTotal.cellLabel=dataModel.dates[i].cellLabel;
                colsTotals.push(cellColTotal);
            }
            dataModel.colsTotals = colsTotals;
            dataModel.grandTotal = grandTotal;
            return dataModel;
        }



        for (var i = 0; i < dataModel.lines.length; i++) {
            var sum = 0;
            for (var j = 0; j < dataModel.lines[i].cells.length; j++) {
                sum += parseInt(dataModel.lines[i].cells[j].qty);
            }
            dataModel.lines[i].lineTotal = sum;
            grandTotal += sum;
        }


        for (var i = 0; i < dataModel.dates.length; i++) {
            var sum = 0;
            var cellColTotal = {};
            for (var j = 0; j < dataModel.lines.length; j++) {
                sum += parseInt(dataModel.lines[j].cells[i].qty);
            }
            cellColTotal.qty=sum;
            cellColTotal.cellLabel=dataModel.dates[i].cellLabel;
            colsTotals.push(cellColTotal);
        }
        //console.log(colsTotals);
        dataModel.colsTotals = colsTotals;
        dataModel.grandTotal = grandTotal;
        //console.log(dataModel);
        //console.log(dataModel.colsTotals);
        return dataModel;
    },

    createLines: function(helper, dataModel, linesCount) {

        for (var i = 0; i < linesCount; i++) {
            helper.addNewLine(dataModel);
        }


        return dataModel;
    },

    addNewLine: function(dataModel, projectToAdd,component) {
        if (!("lines" in dataModel)) {
            dataModel.lines = [];
        }

        var line = {};
		
        if (typeof projectToAdd === 'undefined') {
            line = {
                projectName: '- please select a project -',
                projectId: null
            };
        } else {
            line = {
                projectName: projectToAdd.name,
                projectId: projectToAdd.id
            }
        }
        
        /* START : task options */
        
        if(projectToAdd != undefined){
            if(projectToAdd.name == 'Category 1'){
                var matterlookup = component.find("matterlookupField");
                $A.util.removeClass(matterlookup,'slds-hide');
                
                var taskoptions = [];
                
                var taskoption1 = {};
                taskoption1.label = 'Legal Services';
                taskoption1.value = 'Legal Services';
                
                var taskoption2 = {};
                taskoption2.label = 'Non-Legal Services';
                taskoption2.value = 'Non-Legal Services';
                
                taskoptions.push(taskoption1);
                taskoptions.push(taskoption2);
                line.taskoptions = taskoptions;
                
            }else if(projectToAdd.name == 'Category 2'){
                var taskoptions = [];
                
                var taskoption1 = {};
                taskoption1.label = 'Legal Services';
                taskoption1.value = 'Legal Services';
                
                var taskoption2 = {};
                taskoption2.label = 'Non-Legal Services';
                taskoption2.value = 'Non-Legal Services';
                
                var taskoption3 = {};
                taskoption3.label = 'Training Program Related – Giving';
                taskoption3.value = 'Training Program Related – Giving';
                
                var taskoption4 = {};
                taskoption4.label = 'Training Program Related – Participating';
                taskoption4.value = 'Training Program Related – Participating';
                
                taskoptions.push(taskoption1);
                taskoptions.push(taskoption2);
                taskoptions.push(taskoption3);
                taskoptions.push(taskoption4);
                line.taskoptions = taskoptions;
                
            }else if(projectToAdd.name == 'Category 3'){
                
                var taskoptions = [];
                var taskoption1 = {};
                taskoption1.label = 'General Administration';
                taskoption1.value = 'General Administration';
                
                var taskoption2 = {};
                taskoption2.label = 'Professional Development';
                taskoption2.value = 'Professional Development'; 
                
                taskoptions.push(taskoption1);
                taskoptions.push(taskoption2);
                line.taskoptions = taskoptions;
            }
        }
        
        /* END : task options */

        if(component != undefined){
            line.matter = component.get('v.mattertobeadded');
            line.statute = component.get('v.statutetobeadded');
            line.selectedClientValue = component.get('v.selectedClientValue');
            component.set('v.matterId','');
            component.set('v.statuteId','');
            component.set('v.mattertobeadded','');
            component.set('v.statutetobeadded','');
            component.set("v.selectedClientValue",'');
        }
        	

        var cells = [];
        var i = dataModel.lines.length;
        for (var j = 0; j < dataModel.dates.length; j++) {
            var cell = {
                id: null,
                lineIndex: i,
                colIndex: j,
                qty: 0,
                isWorkingDay: dataModel.dates[j].isWorkingDay,
                isModified: false,
                cellLabel: dataModel.dates[j].cellLabel
            };
            cells.push(cell);
        }
        line.cells = cells;
        line.lineTotal = 0;
        /*
        console.log("dataModel.lines before pushing");
        console.log(dataModel.lines);
        console.log("line to be pushed");
        console.log(line);*/
        dataModel.lines.push(line);
        /*console.log("dataModel.lines after pushing");
        console.log(dataModel.lines);*/
        return dataModel;

    },

    initModel: function(helper, component, dataModel, startDate, endDate) {

        var dates = helper.getDates(helper, startDate, endDate);
        dataModel.dates = dates;
        dataModel.datesLength = dates.length;
        dataModel.contactId=component.get("v.contactId");
        dataModel.startDate=helper.JS2SFDate(startDate);
        dataModel.endDate=helper.JS2SFDate(endDate);
        var classSizeCell = (dates.length > 7) ? "fixedCell" : "autoCell";
        component.set("v.classSizeCell",classSizeCell)

        return dataModel;
    },

    cloneObj: function(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    },

    loadLines: function(dataModel, loadData) {
        console.log('****the load data is',loadData);
        for (var i = 0; i < loadData.length; i++) {
            dataModel.lines[i].projectName = loadData[i].projectName;
            
            dataModel.lines[i].projectId = loadData[i].projectId;
            for (var j = 0; j < loadData[i].allocations.length; j++) {
                for (var k = 0; k < dataModel.dates.length; k++) {
                    if (loadData[i].allocations[j].Date__c == dataModel.dates[k].sfFormat) {
                        dataModel.lines[i].cells[k].qty = loadData[i].allocations[j].Quantity__c;
                        dataModel.lines[i].cells[k].id = loadData[i].allocations[j].Id;
                        dataModel.lines[i].cells[k].isWorkingDay = loadData[i].allocations[j].Is_a_working_day__c;
                        break;
                    }
                }
                
                if(dataModel.lines[i].projectName == 'Category 1' && loadData.length > 0 && loadData[i].allocations[j]!= undefined){
                    //dataModel.lines[i].matter.CaseNumber = loadData[i].allocations[j].Matter__r.CaseNumber;                    
                    console.log('**subject',loadData[i].allocations[j].Matter__r.Statute__r.Name);
                    dataModel.lines[i].matter = {};
                    dataModel.lines[i].matter.Id = loadData[i].allocations[j].Matter__c;
                    dataModel.lines[i].matter.CaseNumber = loadData[i].allocations[j].Matter__r.CaseNumber;
                    dataModel.lines[i].matter.Subject = loadData[i].allocations[j].Matter__r.Subject;
                    dataModel.lines[i].matter.Client__c = loadData[i].allocations[j].Matter__r.Client__c;
                    dataModel.lines[i].matter.Statute__c = loadData[i].allocations[j].Matter__r.Statute__c;
                    dataModel.lines[i].matter.Statute__r = {};
                    dataModel.lines[i].matter.Statute__r.Name = loadData[i].allocations[j].Matter__r.Statute__r.Name;
                
                    var taskoptions = [];
                    
                    var taskoption1 = {};
                    taskoption1.label = 'Legal Services';
                    taskoption1.value = 'Legal Services';
                    
                    var taskoption2 = {};
                    taskoption2.label = 'Non-Legal Services';
                    taskoption2.value = 'Non-Legal Services';
                    
                    taskoptions.push(taskoption1);
                    taskoptions.push(taskoption2);
                    dataModel.lines[i].taskoptions = taskoptions;
                }
                else if(dataModel.lines[i].projectName == 'Category 2' && loadData.length > 0 && loadData[i].allocations[j].Statute__r != undefined){
                    dataModel.lines[i].statute = {};
                    dataModel.lines[i].statute.Id = loadData[i].allocations[j].Statute__c;
                    dataModel.lines[i].statute.Name = loadData[i].allocations[j].Statute__r.Name;
                    dataModel.lines[i].selectedClientValue = loadData[i].allocations[j].Client__c;
                    
                    var taskoptions = [];
                    
                    var taskoption1 = {};
                    taskoption1.label = 'Legal Services';
                    taskoption1.value = 'Legal Services';
                    
                    var taskoption2 = {};
                    taskoption2.label = 'Non-Legal Services';
                    taskoption2.value = 'Non-Legal Services';
                    
                    var taskoption3 = {};
                    taskoption3.label = 'Training Program Related – Giving';
                    taskoption3.value = 'Training Program Related – Giving';
                    
                    var taskoption4 = {};
                    taskoption4.label = 'Training Program Related – Participating';
                    taskoption4.value = 'Training Program Related – Participating';
                    
                    taskoptions.push(taskoption1);
                    taskoptions.push(taskoption2);
                    taskoptions.push(taskoption3);
                    taskoptions.push(taskoption4);
                    dataModel.lines[i].taskoptions = taskoptions;
                    
                }else if(dataModel.lines[i].projectName == 'Category 3'){
                    var taskoptions = [];
                    var taskoption1 = {};
                    taskoption1.label = 'General Administration';
                    taskoption1.value = 'General Administration';
                    
                    var taskoption2 = {};
                    taskoption2.label = 'Professional Development';
                    taskoption2.value = 'Professional Development'; 
                    
                    taskoptions.push(taskoption1);
                    taskoptions.push(taskoption2);
                    dataModel.lines[i].taskoptions = taskoptions;
                }
                
                
                dataModel.lines[i].selectedValue = loadData[i].allocations[j].Tasks__c;
                
            }
        }

        return dataModel;
    },

    prepareToBeSavedObject: function(dataModel) {
        var toBeSaved = {
            toUpsert: [],
            toDelete: []
        };

        if (!("lines" in dataModel)) {
            return toBeSaved;
        }

        for (var i = 0; i < dataModel.lines.length; i++) {
            for (var j = 0; j < dataModel.lines[i].cells.length; j++) {
                if (dataModel.lines[i].cells[j].isModified) {
                    //var id = dataModel.lines[i].cells[j].id.length > 0 ? dataModel.lines[i].cells[j].id null;
                    var obj = {
                        Contact__c: dataModel.contactId,
                        Date__c: dataModel.dates[j].sfFormat,
                        Is_a_working_day__c: dataModel.lines[i].cells[j].isWorkingDay,
                        Project__c: dataModel.lines[i].projectId, 
                        Quantity__c: parseInt(dataModel.lines[i].cells[j].qty),
                        Id: dataModel.lines[i].cells[j].id,
                        sobjectType: "Time_Allocation__c"
                    };
                    
                    if(dataModel.lines[i].projectName == 'Category 1'){
                        if(dataModel.lines[i].matter != undefined){
                            obj.Matter__c = dataModel.lines[i].matter.Id;
                            obj.Statute__c = dataModel.lines[i].matter.Statute__c;
                            obj.Client__c = dataModel.lines[i].matter.Client__c;
                        }
                        if(dataModel.lines[i].selectedValue != undefined){
                            obj.Tasks__c = dataModel.lines[i].selectedValue;
                        }	
                        
                    }else if(dataModel.lines[i].projectName == 'Category 2'){
                        if(dataModel.lines[i].statute != undefined){
                            obj.Statute__c = dataModel.lines[i].statute.Id;
                        }
                        if(dataModel.lines[i].selectedClientValue != undefined){
                            obj.Client__c = dataModel.lines[i].selectedClientValue;
                        }
                        if(dataModel.lines[i].selectedValue != undefined){
                            obj.Tasks__c = dataModel.lines[i].selectedValue;
                        }
                    }else if(dataModel.lines[i].projectName == 'Category 3'){
                        if(dataModel.lines[i].selectedValue != undefined){
                            obj.Tasks__c = dataModel.lines[i].selectedValue;
                        }
                    }

                    if (!(dataModel.lines[i].projectId)) {
                        continue
                    }

                    if (parseInt(dataModel.lines[i].cells[j].qty) == 0) {
                        if (dataModel.lines[i].cells[j].id.length > 6) {
                            toBeSaved.toDelete.push(obj);
                        }
                    } else {
                        toBeSaved.toUpsert.push(obj);
                    }
                }
                // DO SOMETHING dataModel.lines[i].cells[j].X
            }
        }
        console.log('****toBeSaved',toBeSaved);
        return toBeSaved;

    },

    afterSaveCleaning: function(dataModel) {
        if (!("lines" in dataModel)) {
            return dataModel;
        }

        for (var i = 0; i < dataModel.lines.length; i++) {
            for (var j = 0; j < dataModel.lines[i].cells.length; j++) {
                if (dataModel.lines[i].cells[j].isModified) {
                    dataModel.lines[i].cells[j].isModified = false;
                    if (parseInt(dataModel.lines[i].cells[j].qty) == 0) {
                        dataModel.lines[i].cells[j].id = null;
                    }
                }
            }
        }
        return dataModel;
    },

    calculateTimePeriod: function(helper, startDate, timeInterval) {
        //
        var returnObject = {};
        var firstDay;
        var lastDay;
        var curr = new Date(startDate);

        if (timeInterval == "week") {

            var day = curr.getDay() - 1; // The -1 is to make the start date of the week on Monday instead of sunday.
            if (day < 0) {
                day = day + 7
            };
            firstDay = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000); // will return firstday of the week
            lastDay = new Date(firstDay.getTime() + 60 * 60 * 24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday of week
        }
        if (timeInterval == "month") {
            var month = curr.getMonth();
            var year = curr.getFullYear();
            firstDay = new Date(year, month, 1);
            lastDay = new Date(year, month + 1, 0);
        }
        returnObject.startDate = firstDay;
        returnObject.endDate = lastDay;

        return returnObject;
    },

    isProjectAlreadyLoaded: function(dataModel,projectId){
        console.log('***isProjectAlreadyLoaded');
      if (!("lines" in dataModel)) {
          return false;
      }

      for (var i = 0; i < dataModel.lines.length; i++) {
        if(dataModel.lines[i].projectId==projectId){
          return true;
        }
      }
      return false;
    },

    toastMessage : function(whatType,whatTitle,whatMessage){
      var toastEvent = $A.get("e.force:showToast");
      toastEvent.setParams({
          "title": whatTitle,
          "message": whatMessage,
          "mode":"pester",
          "type":whatType,
          "duration":"4000"
      });
      toastEvent.fire();
    }


})