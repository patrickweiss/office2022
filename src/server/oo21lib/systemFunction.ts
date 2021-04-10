import { alleAusgabenFolderScannen, ausgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { alleGutschriftenFolderScannen } from "../officeone/gutschriftenFolderScannen";
import { getTestDatum, sendStatusMail } from "./sendStatusMail";
import { currentOOversion, office, ooTables, ooVersions, systemMasterProperty, triggerModes } from "./systemEnums";
import * as OO2021 from "../../officeone/BusinessModel";
import { DriveConnector } from "../officeone/driveconnector";
import { getSystemFolderIds } from "../officeone/directDriveConnector";



export function weekly() {
    return true;
}
export function monthly() {
    return true;
}
export function yearly() {
    return true;
}
export function installTrigger() {
    try {
        // Deletes all triggers in the current project.
        let triggers = ScriptApp.getProjectTriggers();
        for (let i = 0; i < triggers.length; i++) {
            ScriptApp.deleteTrigger(triggers[i]);
        }
        // ScriptApp.newTrigger("daily").timeBased().everyMinutes(1).create()
        // ScriptApp.newTrigger("daily").timeBased().atHour(0).everyDays(1).create()
    }
    catch (e) {
    }
}
export function daily() {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1)) return;
    const folderIds = getSystemFolderIds();
    try {
        for (let rootId of folderIds) {
            const bm2021 = new OO2021.BusinessModel(rootId, "daily");
            try {
                alleAusgabenFolderScannen(bm2021);
                alleGutschriftenFolderScannen(bm2021);
                bm2021.kontoSummenAktualisieren();
                bm2021.save();
                //wenn neue Belege gefunden wurden, Mail schicken
                if (
                    bm2021.getAusgabenTableCache().loadRowCount < bm2021.getAusgabenTableCache().dataArray.length ||
                    bm2021.getGutschriftenTableCache().loadRowCount < bm2021.getGutschriftenTableCache().dataArray.length ||
                    getTestDatum().getDate() === 1) {
                    //Mail schicken, mit aktuellem Status
                    sendStatusMail(bm2021);
                }
                SpreadsheetApp.flush();
                bm2021.saveLog("daily")
                lock.releaseLock();
            } catch (e) {
                bm2021.saveError(e)
            }
        }
    }
    catch (e) {
        SpreadsheetApp.flush();
        lock.releaseLock();
    }
}

