import { BusinessModel } from "./businessModel";
import { ooTables, ooVersions } from "./enums0055";

export function installSystem(fileId:string,table:ooTables){
    const bm = new BusinessModel(fileId,table,ooVersions.oo55);
}
export function tryCodeUpdate(fileId:string,table:ooTables){
    const bm = new BusinessModel(fileId,table,ooVersions.oo55);
    if (bm.getDriveConnector().isDeprecated())bm.getDriveConnector().archiveHostFile();
}