//  Copyright (c) 2023, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause

public class PDETimeSheetCtrl {
   /*
    @AuraEnabled
    public static List<AccountProject__c> getProjects(String parentId){
        return [Select Id, Name, Start_Date__c, Stop_Date__c, Project_manager__c, ProgressF__c,
                Next_step__c, Issue__c, Issue_message__c
                from AccountProject__c where Account__c = :parentId];
    }
    */
    
    
    @AuraEnabled
    public static String getProjectName(Id projectId){
      Timesheet_project__c[] Projects = [SELECT Id, Name FROM Timesheet_project__c
                          WHERE Id = :projectId];
      return Projects[0].Name;
    }
    
    @AuraEnabled
    public static Case getCase(Id caseid){
        return [select id,casenumber,Subject,Account.Name,Statute__r.Name,Client__c from case where id =:caseid];
    }
    
    @AuraEnabled
    public static Statute__c getStatute(Id sid){
        return [select id,name from Statute__c  where id =:sid ];
    }
    
    @AuraEnabled
    public static Boolean duplicatemonth(Integer month){
        
        system.debug('*****'+month);
        
        try{
            List<Time_Allocation__c> allnewallocations = new List<Time_Allocation__c>(); 
            
            for(Time_Allocation__c ta : [select Id,Date__c, Is_a_working_day__c, Quantity__c,
                                         Project__c,
                                         Client__c,Contact__c ,Matter__c, Statute__c, Tasks__c
                                         from Time_Allocation__c where CALENDAR_MONTH(Date__c) = :month
                                        ])
            { 
                    
                Time_Allocation__c newta = ta.clone(false,true,true,false);
                newta.Date__c = newta.Date__c.addMonths(1);
                allnewallocations.add(newta);  
            }
            
            if(allnewallocations.size() > 0)
            	insert allnewallocations;                           
            return true;
        }catch(Exception ex){ 
            return false;
        }
        
    }
    
    @AuraEnabled
    public static List<Project_Allocations> getAllocations(String contactId, String startDateStr, String endDateStr){
        Date startDate = Date.valueOf(startDateStr);
        Date endDate = Date.valueOf(endDateStr);
        Time_Allocation__c[] allAllocations = [SELECT Id, Date__c, Is_a_working_day__c, Quantity__c,
                                                          Project__r.Id, Project__r.Name,
                                               			  Client__c,Contact__c ,Matter__c, Statute__c, Tasks__c,
                                               			  Matter__r.CaseNumber,Matter__r.Subject,Matter__r.Client__c,
                                               			  Matter__r.Statute__r.Name,Statute__r.Name
                                                   FROM Time_Allocation__c
                                                   WHERE Date__c >= :startDate AND Date__c <= :endDate
                                                         AND Contact__r.Id = :contactId ];
        //Get DISTINCT UNIQUE PROJECT IDs
        Set<Id> setProjectIds = new Set<Id>();
        for (Integer i = 0; i< allAllocations.size(); i++)
        {
            setProjectIds.add(allAllocations[i].Project__r.Id); // contains distict accounts
        }
        
        //For each project ID, associate all Time_Allocation__c reccords
        Project_Allocations[] allocationsByProject = new list<Project_Allocations>();
        for (Id projectId : setProjectIds) {
    		Time_Allocation__c[] allocations = new List<Time_Allocation__c>();
            for (Time_Allocation__c TA : allAllocations){
                if (TA.Project__r.Id == projectId){
                   allocations.add(TA); 
                }   
            }
            Project_Allocations PA = new Project_Allocations(projectId,allocations[0].Project__r.Name,allocations);
            allocationsByProject.add(PA);    
            
		}
        
        
        return allocationsByProject; 
    }
    
    @AuraEnabled
    public static Integer saveAllocations(Time_Allocation__c[] toUpsert, Time_Allocation__c[] toDelete){
        //upsert toUpsert;
        delete toDelete;
        
        String listType = 'List<Time_Allocation__c>'; 
        List<Time_Allocation__c> castRecords = (List<SObject>)Type.forName(listType).newInstance();
        Integer numberDays = date.daysInMonth(2019, 6);

        List<Time_Allocation__c> allnewallocations = new List<Time_Allocation__c>();
        
        
        castRecords.addAll(toUpsert);
        
        for(Time_Allocation__c ta : castRecords){ 
            
            Date curr = ta.Date__c.addDays(7);
            Integer currmonth = ta.Date__c.month();
            system.debug('********curr'+curr);
            for(; curr.day() <= numberDays && curr.month() == currmonth; curr = curr.addDays(7)){
                
               	Time_Allocation__c newta = ta.clone(false,true,true,false);
                newta.Date__c = curr;
                allnewallocations.add(newta);
            }
            
        }
        upsert castRecords;
        insert allnewallocations;
        system.debug('****\nallnewallocations :'+allnewallocations);
        
        return 1;
    }
    
    public class Project_Allocations{
        @AuraEnabled 
        public ID projectId;
        @AuraEnabled 
        public String projectName;
        @AuraEnabled 
        public List<Time_Allocation__c> allocations;
        Project_Allocations(ID projectId, String projectName, List<Time_Allocation__c> allocations ){
            this.projectId = projectId; this.projectName = projectName; this.allocations=allocations;
        }
        
        
    }
}