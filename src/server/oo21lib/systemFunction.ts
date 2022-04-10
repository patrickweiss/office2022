import { alleAusgabenFolderScannen } from "../officeone/ausgabenFolderScannen";
import { alleGutschriftenFolderScannen } from "../officeone/gutschriftenFolderScannen";
import { getTestDatum, sendStatusMail } from "./sendStatusMail";
import { getSystemFolderIds } from "../officeone/directDriveConnector";
import { currentOOversion, ServerFunction, subscribeRestEndpoint } from "./systemEnums";
import { getPreviousVersion, updateDrive } from "../officeone/updateDrive";
import { BusinessModel } from "../../officeone/BusinessModel";
import { string } from "prop-types";
import { UStVAbuchenBM } from "../officeone/UStVAbuchen";



export function weekly() {
    return true;
}
export function monthly() {
    return true;
}
export function yearly() {
    return true;
}

interface ITriggerPost{
    user:string,
    folderIds:string[],
    folderNames:string[],
    action:string
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
            const rootFolderIds = daily();
            if (rootFolderIds.length===0){
                //entweder keine Instanzen oder keine Instanzen mit eigenem Benutzer, oder es wurden nur Updates durchgeführt
                //das sollte dem Benutzer noch irgendwie angezeigt werden ...
                result.triggers = "0";
                return;
            }
            const rootFolderNames:string[]=new Array<string>();
            rootFolderIds.forEach((folderId:string) => {
                rootFolderNames.push(DriveApp.getFolderById(folderId).getName())
            })
            installTrigger();
            // Make a POST request with a JSON payload.

            const data:ITriggerPost = {
                user: Session.getEffectiveUser().getEmail(),
                folderIds: rootFolderIds,
                folderNames: rootFolderNames,
                action: "installTrigger"
            }
            subscriptionPost(data);
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
    //update Trigger status in subscription
    const rootFolderIds = getSystemFolderIds().filter(folderId => folderIsOwnedCurrentByUserAndCurrentVersion(folderId));
    console.log(Session.getEffectiveUser().getEmail(),"deleteTriggers", rootFolderIds)

    const rootFolderNames:string[]=new Array<string>();
    rootFolderIds.forEach((folderId:string) => {
        rootFolderNames.push(DriveApp.getFolderById(folderId).getName())
    })
    const data:ITriggerPost = {
        user: Session.getEffectiveUser().getEmail(),
        folderIds: rootFolderIds,
        folderNames: rootFolderNames,
        action: "deleteTrigger"
    }
    subscriptionPost(data);

}

export function daily(): string[] {
    const folderIds = getSystemFolderIds().filter(folderId => folderIsOwnedCurrentByUserAndCurrentVersion(folderId));
    console.log(Session.getEffectiveUser().getEmail(),"daily", folderIds)
    try {
        for (let rootId of folderIds) {
            const bmServer = new BusinessModel(rootId, `Buchungsautomatik von ${Session.getEffectiveUser().getEmail()}`);
            try {
                bmServer.addLogMessage("Beginn daily()")

                alleAusgabenFolderScannen(bmServer);
                const anzahlAusgabenVorher = bmServer.getAusgabenTableCache().loadRowCount;
                const anzahlAusgabenNachher = bmServer.getAusgabenTableCache().dataArray.length;
                bmServer.addLogMessage( `${anzahlAusgabenNachher - anzahlAusgabenVorher}alle Ausgaben Ordner scannen`)

                alleGutschriftenFolderScannen(bmServer);
                const anzahlGutschriftenVorher = bmServer.getGutschriftenTableCache().loadRowCount;
                const anzahlGutschriftenNachher = bmServer.getGutschriftenTableCache().dataArray.length;
                bmServer.addLogMessage( `${anzahlGutschriftenNachher - anzahlGutschriftenVorher}alle Gutschriften Ordner scannen`)

                UStVAbuchenBM(bmServer);
                bmServer.kontoSummenAktualisieren();
                bmServer.save();
                //wenn neue Belege gefunden wurden, Mail schicken
                if (
                    anzahlAusgabenVorher < anzahlAusgabenNachher ||
                    anzahlGutschriftenVorher < anzahlGutschriftenNachher ||
                    getTestDatum().getDate() === 1) {
                    //Mail schicken, mit aktuellem Status
                    sendStatusMail(bmServer);
                }
                SpreadsheetApp.flush();
                bmServer.saveLog("daily")
            } catch (e) {
                bmServer.saveError(e)
                deleteTriggers()
            }
        }
    }
    catch (e) {
        SpreadsheetApp.flush();
    }
    return folderIds;
}

function folderIsOwnedCurrentByUserAndCurrentVersion(folderId: string) {
    const folder = DriveApp.getFolderById(folderId);
    const folderOwnerUser = folder.getOwner();
    if (Session.getEffectiveUser().getEmail() !== folderOwnerUser.getEmail()) return false;
    //Nur bei eigenen Instanzen erfolgt ein automatisches Update durch Daily, weil das Update immer mit dem eigenen Benutzer durchgeführt werden muss
    //Damit der Benutzer Eigentümer der Template Files wird
    let driveVersion = folder.getName().substr(-4);
    if (getPreviousVersion() === driveVersion) {
        //folder has to be updated first
        updateDrive(folderId);
        //Workaround für das Problem, dass mehrere Updates fehlen, weil ich nicht weiß wie ich den Fehler besser behandeln kann
        return false;
    }
    //throw error if version is still wrong
    //driveVersion = folder.getName().substr(-4);
    //if (currentOOversion !== driveVersion) throw new Error("OO Instance with ID" + folderId + " could not be updated to version " + currentOOversion);
    return true
}


function subscriptionPost(data:ITriggerPost) {
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        // Convert the JavaScript object to a JSON string.
        'payload': JSON.stringify(data)
    };
    UrlFetchApp.fetch(subscribeRestEndpoint, options);
}

