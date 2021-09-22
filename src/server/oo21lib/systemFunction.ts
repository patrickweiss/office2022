import { alleAusgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { alleGutschriftenFolderScannen } from "../officeone/gutschriftenFolderScannen";
import { getTestDatum, sendStatusMail } from "./sendStatusMail";
import * as OO2021 from "../../officeone/BusinessModel";
import { getSystemFolderIds } from "../officeone/directDriveConnector";
import { currentOOversion, ServerFunction } from "./systemEnums";
import { getPreviousVersion, updateDrive } from "../officeone/updateDrive";



export function weekly() {
    return true;
}
export function monthly() {
    return true;
}
export function yearly() {
    return true;
}

//Wenn ein Trigger installiert ist, dann alle Trigger löschen
//Wenn nicht, dann um Mitternacht die Funktion "daily" triggern
export function kiSwitch(triggerCount) {
    let result = {
        serverFunction: ServerFunction.kiSwitch,
        triggers: "Fehler"
    }
    try {
        if (ScriptApp.getProjectTriggers().length > 0) {
            deleteTriggers();
            result.triggers = "0";
        }
        else {
            daily();
            installTrigger();
            result.triggers = "1";
        }
    } catch (e) {
        result["error"] = e;
        return JSON.stringify(result);
    }
    return JSON.stringify(result);
}

export function installTrigger() {
    // Deletes all user triggers in the current project.
    let triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
    // ScriptApp.newTrigger("daily").timeBased().everyMinutes(1).create()
    ScriptApp.newTrigger("daily").timeBased().atHour(0).everyDays(1).create()
}
export function deleteTriggers() {
    // Deletes all user triggers in the current project.
    let triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
}

export function daily() {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1)) return;
    const folderIds = getSystemFolderIds();
    try {
        for (let rootId of folderIds) {
            if (folderIsOwnedCurrentByUserAndCurrentVersion(rootId)) {
                const bm2021 = new OO2021.BusinessModel(rootId, "daily von id:"+rootId);
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
                    // Deletes all user triggers in the current project.
                    let triggers = ScriptApp.getProjectTriggers();
                    for (let i = 0; i < triggers.length; i++) {
                        ScriptApp.deleteTrigger(triggers[i]);
                    }
                }
            }
        }
    }
    catch (e) {
        SpreadsheetApp.flush();
        lock.releaseLock();
    }
}

function folderIsOwnedCurrentByUserAndCurrentVersion(folderId: string) {
    const folder = DriveApp.getFolderById(folderId);
    const driveVersion = folder.getName().substr(-4);
    if (getPreviousVersion()===driveVersion){
        //folder has to be updated first
        updateDrive(folderId);
    }
    //throw error if version is still wrong
    if (currentOOversion!==driveVersion)throw new Error("OO Instance with ID"+folderId+" could not be updated to version "+currentOOversion);
    const user = folder.getOwner();
    return Session.getEffectiveUser().getEmail() === user.getEmail();
}

