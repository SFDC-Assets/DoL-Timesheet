declare module "@salesforce/apex/PDETimeSheetCtrl.getProjectName" {
  export default function getProjectName(param: {projectId: any}): Promise<any>;
}
declare module "@salesforce/apex/PDETimeSheetCtrl.getCase" {
  export default function getCase(param: {caseid: any}): Promise<any>;
}
declare module "@salesforce/apex/PDETimeSheetCtrl.getStatute" {
  export default function getStatute(param: {sid: any}): Promise<any>;
}
declare module "@salesforce/apex/PDETimeSheetCtrl.duplicatemonth" {
  export default function duplicatemonth(param: {month: any}): Promise<any>;
}
declare module "@salesforce/apex/PDETimeSheetCtrl.getAllocations" {
  export default function getAllocations(param: {contactId: any, startDateStr: any, endDateStr: any}): Promise<any>;
}
declare module "@salesforce/apex/PDETimeSheetCtrl.saveAllocations" {
  export default function saveAllocations(param: {toUpsert: any, toDelete: any}): Promise<any>;
}
