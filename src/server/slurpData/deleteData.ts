import { DataFileTableCache, GdpduTableCache } from "../../officeone/BusinessDataFacade";
import { DriveConnector } from "../officeone/driveconnector";

export function deleteData(){
    const rootId = DriveConnector.getRootId()
    const dataTableCache = new GdpduTableCache(rootId);
    dataTableCache.reset();
    dataTableCache.save();
    const dataFileCache = new DataFileTableCache(rootId);
    dataFileCache.reset();
    dataFileCache.save();
}