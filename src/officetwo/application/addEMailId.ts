import { ooTables } from "../../server/oo21lib/systemEnums";
import { processEmailIdForm } from "./processEmailIdForm";

export const addEmailId = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
    const rootId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(ooTables.OfficeRootID).getValue().toString();
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