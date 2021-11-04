import { alleAusgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { alleGutschriftenFolderScannen } from "../officeone/gutschriftenFolderScannen";
import { getTestDatum, sendStatusMail } from "./sendStatusMail";
import { getSystemFolderIds } from "../officeone/directDriveConnector";
import { currentOOversion, ServerFunction } from "./systemEnums";
import { getPreviousVersion, updateDrive } from "../officeone/updateDrive";
import { BusinessModel } from "../../officeone/BusinessModel";



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
export function kiSwitch() {
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
            installTrigger();
            daily();
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
    ScriptApp.newTrigger("daily").timeBased().everyDays(1).atHour(0).nearMinute(0).create()
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
                const bmServer = new BusinessModel(rootId, "daily von id:"+rootId);
                try {
                    alleAusgabenFolderScannen(bmServer);
                    alleGutschriftenFolderScannen(bmServer);
                    bmServer.kontoSummenAktualisieren();
                    bmServer.save();
                    //wenn neue Belege gefunden wurden, Mail schicken
                    if (
                        bmServer.getAusgabenTableCache().loadRowCount < bmServer.getAusgabenTableCache().dataArray.length ||
                        bmServer.getGutschriftenTableCache().loadRowCount < bmServer.getGutschriftenTableCache().dataArray.length ||
                        getTestDatum().getDate() === 1) {
                        //Mail schicken, mit aktuellem Status
                        sendStatusMail(bmServer);
                    }
                    SpreadsheetApp.flush();
                    bmServer.saveLog("daily")
                    lock.releaseLock();
                } catch (e) {
                    bmServer.saveError(e)
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
    const folderOwnerUser = folder.getOwner();
    console.log(folderId+" "+driveVersion+" "+Session.getEffectiveUser().getEmail()+" "+folderOwnerUser.getEmail())
    if (getPreviousVersion()===driveVersion){
        //folder has to be updated first
        updateDrive(folderId);
    }
    //throw error if version is still wrong
    if (currentOOversion!==driveVersion)throw new Error("OO Instance with ID"+folderId+" could not be updated to version "+currentOOversion);
    return Session.getEffectiveUser().getEmail() === folderOwnerUser.getEmail();
}

