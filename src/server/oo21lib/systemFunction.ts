import { BusinessModel } from "./businessModel";
import { log } from "./spreadsheerLogger";
import { office, ooTables, ooVersions, systemMasterProperty } from "./systemEnums";

export function installSystem(fileId: string, table: ooTables, version: ooVersions) {
    const beginn = new Date();
    try {
        const bm = new BusinessModel(fileId, table, version);

        // Deletes all triggers in the current project.
        let triggers = ScriptApp.getProjectTriggers();
        for (let i = 0; i < triggers.length; i++) {
            log(new Date(), "trigger for function deleted:" + triggers[i].getHandlerFunction());
            ScriptApp.deleteTrigger(triggers[i]);
        }

        if (bm.getDriveConnector().getOfficeProperty(office.triggerMode) === "Test")
            ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().everyMinutes(1).create()
        else
            ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().atHour(0).everyDays(1).create()

        log(beginn, "System installiert für:" + bm.getDriveConnector().getOfficeProperty(office.triggerMode)+" "+ bm.getDriveConnector().getOfficeProperty(office.firma));
    }
    catch (e) {
        log(beginn, e.toString())
    }
}
export function tryCodeUpdate(fileId: string, table: ooTables, version: ooVersions): boolean {
    const beginn = new Date();
    try {
        const bm = new BusinessModel(fileId, table, version);
        if (bm.getDriveConnector().isDeprecated()) {
            bm.getDriveConnector().archiveHostFile();
            const data = bm.getDriveConnector().getTableData(table);
            const officeFolder = bm.getDriveConnector().officeFolder
            const templateFolder = DriveApp.getFolderById(bm.getDriveConnector().getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId))
            const hostFileName = bm.getDriveConnector().getFileName(bm.getDriveConnector().hostTable)
            const newHostId = templateFolder.getFilesByName(hostFileName).next().makeCopy(hostFileName, officeFolder).getId();
            const newBm = new BusinessModel(newHostId, table, version);
            const newSubversion = newBm.getDriveConnector().getOfficeProperty(office.subversion);
            newBm.getDriveConnector().saveTableData(table, data);
            newBm.getDriveConnector().setOfficeProperty(office.subversion, newSubversion);
            log(beginn, "tryCodeUpdate: true")
            // Deletes all triggers in the current project.
            let triggers = ScriptApp.getProjectTriggers();
            for (let i = 0; i < triggers.length; i++) {
                log(new Date(), "trigger for function deleted:" + triggers[i].getHandlerFunction());
                ScriptApp.deleteTrigger(triggers[i]);
            }
            return true;
        }
        log(beginn, "tryCodeUpdate: false")
        return false;

    }
    catch (e) {
        log(beginn, e.toString())
    }
}