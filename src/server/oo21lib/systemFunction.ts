import { ausgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { BusinessModel } from "./businessModel";
import { oolog } from "./spreadsheerLogger";
import { office, ooTables, ooVersions, systemMasterProperty, triggerModes } from "./systemEnums";

export function installSystem(fileId: string, table: ooTables, version: ooVersions) {
    oolog.logBeginn("installSystem")
    try {
        const bm = new BusinessModel(fileId, table, version);

        // Deletes all triggers in the current project.
        let triggers = ScriptApp.getProjectTriggers();
        for (let i = 0; i < triggers.length; i++) {
            oolog.addMessage("trigger for function deleted:" + triggers[i].getHandlerFunction());
            ScriptApp.deleteTrigger(triggers[i]);
        }

        const triggerMode = bm.getDriveConnector().getOfficeProperty(office.triggerMode)
        if (triggerMode === triggerModes.test)  ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().everyMinutes(1).create()
        if (triggerMode === triggerModes.production)   ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().atHour(0).everyDays(1).create()

        bm.getDriveConnector().setOfficeProperty(office.OfficeRootID,bm.getDriveConnector().officeFolder.getId());
        oolog.logEnd("System installiert für:" +triggerMode+" "+ bm.getDriveConnector().getOfficeProperty(office.firma));
    }
    catch (e) {
        oolog.logEnd(e.toString())
    }
}
export function tryCodeUpdate(fileId: string, table: ooTables, version: ooVersions): boolean {
    oolog.logBeginn("tryCodeUpdate")
    try {
        const bm = new BusinessModel(fileId, table, version);
        if (bm.getDriveConnector().isDeprecated()) {
            archiveHostfile(bm,table,version);
            oolog.logEnd("Datei wurde archiviert, Trigger gestoppt");
            return true;
        }
        ausgabenFolderScannen(bm.getDriveConnector().officeFolder.getId(),"01");
        oolog.logEnd("Ausgaben wurden gescannt")
        return false;
    }
    catch (e) {
        oolog.logEnd(e.toString())
    }
}

function archiveHostfile(bm:BusinessModel, table: ooTables, version: ooVersions){
    oolog.addMessage( "archiveHostfile");
    bm.getDriveConnector().archiveHostFile();
    //we need a copy of the data, not only a reference ...
    const data = JSON.parse(JSON.stringify(bm.getDriveConnector().getTableData(table)));
    const officeFolder = bm.getDriveConnector().officeFolder
    const templateFolder = DriveApp.getFolderById(bm.getDriveConnector().getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId))
    const hostFileName = bm.getDriveConnector().getFileName(bm.getDriveConnector().hostTable)
    const newHostId = templateFolder.getFilesByName(hostFileName).next().makeCopy(hostFileName, officeFolder).getId();
    const newBm = new BusinessModel(newHostId, table, version);
    const newSubversion = newBm.getDriveConnector().getOfficeProperty(office.subversion);
    newBm.getDriveConnector().saveTableData(table, data);
    newBm.getDriveConnector().setOfficeProperty(office.subversion, newSubversion);
    // Deletes all triggers in the current project.
    let triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
        oolog.addMessage("trigger for function deleted:" + triggers[i].getHandlerFunction());
        ScriptApp.deleteTrigger(triggers[i]);
    }
    bm.getDriveConnector().setOfficeProperty(office.triggerMode,triggerModes.stop);
}