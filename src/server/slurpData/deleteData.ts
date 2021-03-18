import { DataFileTableCache, GdpduTableCache } from "../../officeone/BusinessDataFacade";
import { ooTables } from "../oo21lib/systemEnums";

export function deleteData(){
    const rootId =  SpreadsheetApp.getActiveSpreadsheet().getRangeByName(ooTables.OfficeRootID).getValue().toString();
    const dataTableCache = new GdpduTableCache(rootId);
    dataTableCache.reset();
    dataTableCache.save();
    const dataFileCache = new DataFileTableCache(rootId);
    dataFileCache.reset();
    dataFileCache.save();
}