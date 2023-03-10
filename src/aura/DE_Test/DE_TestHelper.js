//  Copyright (c) 2023, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause

({
    
    setweeks : function(component,event,helper){
        
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        
        var selectedmonth = component.find("selectmonth").get("v.value");
        
        console.log('****before setting week1',component.get("v.week1"));
        console.log('****before setting week2',component.get("v.week2"));
        console.log('****before setting week3',component.get("v.week3"));
        console.log('****before setting week4',component.get("v.week4"));
        console.log('****before setting week5',component.get("v.week5"));
        
        console.log('****dates');
        
        var d1 = new Date();
        d1.setFullYear(2019, selectedmonth, 1);  
        component.set("v.week1",helper.JS2SFDate(d1));
        
        helper.calculateTimePeriod(helper, component.get("v.week5"), 'week');
        
        helper.createTimesheet(component,'week1TimesheetHere',component.get('v.week1'),component.get('v.disableeverything'));
        var d2 = new Date();
        d2.setFullYear(2019, selectedmonth, 8);   
        component.set("v.week2",helper.JS2SFDate(d2));
		helper.createTimesheet(component,'week2TimesheetHere',component.get('v.week2'),component.get('v.disableeverything'));        
        var d3 = new Date();
        d3.setFullYear(2019, selectedmonth, 16);   
        component.set("v.week3",helper.JS2SFDate(d3));
        helper.createTimesheet(component,'week3TimesheetHere',component.get('v.week3'),component.get('v.disableeverything'));        
        var d4 = new Date();
        d4.setFullYear(2019, selectedmonth, 22);   
        component.set("v.week4",helper.JS2SFDate(d4));
        helper.createTimesheet(component,'week4TimesheetHere',component.get('v.week4'),component.get('v.disableeverything'));        
        var d5 = new Date();
        d5.setFullYear(2019, selectedmonth, 29);   
        component.set("v.week5",helper.JS2SFDate(d5));
        helper.createTimesheet(component,'week5TimesheetHere',component.get('v.week5'),component.get('v.disableeverything'));        
        
        $A.util.addClass(spinner, "slds-hide");
        
        console.log('****after setting week1',component.get("v.week1"));
        console.log('****after setting week2',component.get("v.week2"));
        console.log('****after setting week3',component.get("v.week3"));
        console.log('****after setting week4',component.get("v.week4"));
        console.log('****after setting week5',component.get("v.week5"));
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
    
    SF2JSDate: function(dateAsStr) {
        var d = dateAsStr.split("T");
        var s = d[0].split("-");
        var JSDate = new Date(s[0], parseInt(s[1]) - 1, s[2], 0, 0, 0, 0);
        return JSDate;
    },
    
    createTimesheet : function(component,divid,weekdate,disability) {
        
			 $A.createComponent(
					 "c:Timesheet",
					 {
						  	"contactId":component.get("v.ContactId"),
				       		"startDate": weekdate,
                         	"disableeverything": disability,
                         	"timePeriod": "week"
					 },
					 function(newCmp, status, errorMessage){
						  //component.index(newCmp.getLocalId(), newCmp.getGlobalId()); //INDEX COMPONENT. SEE BUG W-2529066 in GUS FOR EXPLANATIONS. WORKAROUND not working with lockerservice
						  /*console.log(newCmp);
							console.log(status);
							console.log(errorMessage);*/
							var content = component.find(divid);
							//var content = $A.getComponent("line1");
							/*console.log("content");
							console.log(content);*/
							 content.set("v.body", newCmp);
					 }
			 );
	 }
})