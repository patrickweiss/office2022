import { alleAusgabenFolderScannen, ausgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { alleGutschriftenFolderScannen } from "../officeone/gutschriftenFolderScannen";
import { getTestDatum, sendStatusMail } from "./sendStatusMail";
import { currentOOversion, office, ooTables, ooVersions, systemMasterProperty, triggerModes } from "./systemEnums";
import * as OO2021 from "../../officeone/BusinessModel";
import { DriveConnector } from "../officeone/driveconnector";



export function weekly(){
    return true;
}

export function monthly(){
    return true;
}

export function yearly(){
    return true;
}


export function installSystem(rootId:string) {
    try {
      //  const bm = new BusinessModel(fileId, table, version);

        // Deletes all triggers in the current project.
        let triggers = ScriptApp.getProjectTriggers();
        for (let i = 0; i < triggers.length; i++) {
            ScriptApp.deleteTrigger(triggers[i]);
        }

        const triggerMode = DriveConnector.getOfficeProperty(rootId, office.triggerMode, currentOOversion)
        if (triggerMode === triggerModes.test) ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().everyMinutes(1).create()
        if (triggerMode === triggerModes.production) ScriptApp.newTrigger("tryUpdateWithoutParameters").timeBased().atHour(0).everyDays(1).create()

    }
    catch (e) {
    }
}
export function daily(rootId:string): boolean {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1)) return;
    try {
        const bm2021 = new OO2021.BusinessModel(rootId,"");
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
        lock.releaseLock();
        return false;
    }
    catch (e) {
        SpreadsheetApp.flush();
        lock.releaseLock();
    }
}

