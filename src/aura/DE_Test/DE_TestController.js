//  Copyright (c) 2023, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause

({
    doinit : function(cmp,event,helper){
        cmp.find("selectmonth").set("v.value",9);
        helper.setweeks(cmp,event,helper);
    },
    
    retrievelastmonth : function(component,event,helper){
        var action = component.get("c.duplicatemonth");
        var sm = parseInt(component.find("selectmonth").get("v.value"));
        action.setParams({
            month: sm
        });
        action.setCallback(this, function(response) {
            
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('',response.getReturnValue());
                helper.setweeks(component,event,helper);
            }
            
        }); 
        $A.enqueueAction(action);
    },
    
    disable : function(component,event,helper){
        console.log('**in disable');
      	component.set("v.disableeverything",true);
        
    },
    
    setweeks : function(component,event,helper){
        helper.setweeks(component,event,helper);
    },
    
    handleShowActiveSectionName: function (cmp, event, helper) {
        alert(cmp.find("accordion").get('v.activeSectionName'));
    },
    handleToggleSectionD: function (cmp) {
        cmp.set('v.isDVisible', !cmp.get('v.isDVisible'));
    }
});