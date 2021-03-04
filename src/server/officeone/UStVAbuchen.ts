import { UmbuchungenTableCache } from "../../officeone/BusinessDataFacade";
import { ServerFunction } from "./enums";

export function UStVAbuchen(rootFolderId: string) {

    const mail = searchUStVABeleg()[0];
    markUStVABelegProcessed(mail);
    const belegDaten = mail.getMessages()[0].getBody();
    const subjectArray = mail.getMessages()[0].getSubject().split(" ");
    const jahr = subjectArray[3];
    const kzperiode = subjectArray[4];
    const kzMonatMapping = {
        "01":1,
        "02":2,
        "03":3,
        "04":4,
        "05":5,
        "06":6,
        "07":7,
        "08":8,
        "09":9,
        "10":10,
        "11":11,
        "12":12,
        "41":3,
        "42":6,
        "43":9,
        "44":12
    }
    const periode = kzMonatMapping[kzperiode];

    const umbuchungenTableCache = new UmbuchungenTableCache(rootFolderId);

    const ustvaUmbuchung = umbuchungenTableCache.getOrCreateRowById("Um" + jahr + "UStVA" + kzperiode);

    ustvaUmbuchung.setDatum(new Date(parseInt(jahr,10),parseInt(periode,10)-1));
    ustvaUmbuchung.setKonto("UStVA");
    ustvaUmbuchung.setGegenkonto("Verbindlichkeiten UStVA");
    ustvaUmbuchung.setText(belegDaten);
    ustvaUmbuchung.setBetrag(parseKz83FromUStVA(belegDaten));
    umbuchungenTableCache.save();

    var result = {
        serverFunction: ServerFunction.getNamedRangeData,
        rangeName: "UmbuchungenD",
        namedRangeData: umbuchungenTableCache.getData()
    }
    return JSON.stringify(result);
}

const UStVA_Beleg_PROCESSED_LABEL = "UStVA gebucht";

function searchUStVABeleg(): GoogleAppsScript.Gmail.GmailThread[] {
    let SEARCH_FROM_EMAIL = "patrick.sbrzesny@saw-office.net";
    let SEARCH_SUBJECT = "UStVA Elster Beleg";
    var SEARCH_STRING = `from:${SEARCH_FROM_EMAIL} AND (subject:"${SEARCH_SUBJECT}") AND NOT (label:"${UStVA_Beleg_PROCESSED_LABEL}")`;


    return GmailApp.search(SEARCH_STRING);
}

function markUStVABelegProcessed(thread) {
    if (thread == null) {
        throw new Error("ERROR: No emails threads to process.");
    }
    var label = GmailApp.getUserLabelByName(UStVA_Beleg_PROCESSED_LABEL);
    if (label == null) {
        label = GmailApp.createLabel(UStVA_Beleg_PROCESSED_LABEL);
    }
    // Mark the email thread as PROCESSED
    label.addToThread(thread);
    // Mark the email thread as Read
    thread.markRead();
}

function parseKz83FromUStVA(belegHTML:string){
    const beginnIndex = belegHTML.indexOf("Kz83_usb1_1-1-1-1");
    const beginnSteuerStringBisEnde = belegHTML.slice(beginnIndex+19);
    const steuerString = beginnSteuerStringBisEnde.slice(0,beginnSteuerStringBisEnde.indexOf("&"));

    return parseFloat(steuerString.replace(".","").replace(",","."));
}

