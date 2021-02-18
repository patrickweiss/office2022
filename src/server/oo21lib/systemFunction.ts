import { ToastBody } from "react-bootstrap";
import { BusinessModel } from "./businessModel";
import { office, ooTables, ooVersions } from "./enums0055";

export function installSystem(fileId:string,table:ooTables,version:ooVersions){
    const bm = new BusinessModel(fileId,table,version);
}
export function tryCodeUpdate(fileId:string,table:ooTables,version:ooVersions):boolean{
    const bm = new BusinessModel(fileId,table,version);
    if (bm.getDriveConnector().isDeprecated()){
        bm.getDriveConnector().archiveHostFile();
        const data = bm.getDriveConnector().getTableData(table);
        const newBm = new BusinessModel("",table,version);
        const newSubversion = newBm.getDriveConnector().getOfficeProperty(office.subversion);
        newBm.getDriveConnector().saveTableData(table,data);
        newBm.getDriveConnector().setOfficeProperty(office.subversion,newSubversion);
        return true;
    }
    return false;
}