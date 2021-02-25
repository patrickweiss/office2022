import { DriveConnector } from "../../server/officeone/driveconnector";
import { processEmailIdForm } from "./processEmailIdForm";

export const addEmailId = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
    const rootId = DriveConnector.getRootId()
    console.log("addEmailId called");
    if (event===undefined){
       const debugEvent = {
          namedValues:{
             Zeitstempel: new Date(),
             Name:"Test",
             "e-mail":"patrick.sbrzesny@saw-office.net"
          }
       }
       event = debugEvent as unknown as GoogleAppsScript.Events.SheetsOnFormSubmit
    }
    processEmailIdForm(event,rootId);
 };