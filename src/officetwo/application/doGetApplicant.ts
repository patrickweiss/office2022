import { LastschriftmandatTableCache,Lastschriftmandat, EMailIdTableCache, EMailId } from "../../officeone/BusinessDataFacade";

export function doGetApplicant(e:GoogleAppsScript.Events.DoGet){
    let rootId=e.parameter["r"];
    let mailTC = new EMailIdTableCache(rootId);
 
    let lmhash = mailTC.getOrCreateHashTable("Status");
    let lmtr = lmhash[e.parameter["uuid"]] as EMailId;
    if (lmtr.getEMail()===e.parameter["applicant"]){
        lmtr.setStatus("bestätigt");
        mailTC.save();
        return HtmlService.createHtmlOutput('<b>Thank you for confirming your application and e-mail. We will get in touch with you in the next days.</b>');
    } 
    return HtmlService.createHtmlOutput('<b>Application not found or already confirmed</b>');
}