import { ToastBody } from "react-bootstrap";
import { BusinessModel } from "./businessModel";
import { office, ooTables, ooVersions, systemMasterProperty } from "./systemEnums";

export function installSystem(fileId: string, table: ooTables, version: ooVersions) {
    const bm = new BusinessModel(fileId, table, version);
}
export function tryCodeUpdate(fileId: string, table: ooTables, version: ooVersions): boolean {
    const bm = new BusinessModel(fileId, table, version);
    if (bm.getDriveConnector().isDeprecated()) {
        bm.getDriveConnector().archiveHostFile();
        const data = bm.getDriveConnector().getTableData(table);
        const officeFolder = bm.getDriveConnector().officeFolder
        const templateFolder = DriveApp.getFolderById(bm.getDriveConnector().getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId))
        const hostFileName = bm.getDriveConnector().getFileName(bm.getDriveConnector().hostTable)
        const newHostId = templateFolder.getFilesByName(hostFileName).next().makeCopy(hostFileName,officeFolder).getId();
        const newBm = new BusinessModel(newHostId, table, version);
        const newSubversion = newBm.getDriveConnector().getOfficeProperty(office.subversion);
        newBm.getDriveConnector().saveTableData(table, data);
        newBm.getDriveConnector().setOfficeProperty(office.subversion, newSubversion);
        return true;
    }
    return false;
}