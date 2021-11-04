import { DriveConnector } from "../officeone/driveconnector";
import { linkFormula } from "../officeone/SimbaExportErstellen";
//import { BusinessModel } from "./businessModel";
import { currentOOversion, office, ooFolders, ooTables} from "./systemEnums";

export function rechnungsVorlageErstellen() {
    //const bm = new BusinessModel(SpreadsheetApp.getActive().getId(), ooTables.officeConfiguration, currentOOversion);
    const rootFolderId =  SpreadsheetApp.getActiveSpreadsheet().getRangeByName(ooTables.OfficeRootID).getValue().toString();
    const vorlageLeer = DriveApp.getFolderById(rootFolderId).getFoldersByName(ooFolders.vorlagen).next().getFilesByName(ooFolders.rechnung).next()
    const neueVorlage = vorlageLeer.makeCopy("Rechnungsvorlage " + DriveConnector.getOfficeProperty(rootFolderId,office.firma,currentOOversion))

    const properties = [office.taxNumberOffice,
    office.taxNumberDistrict,
    office.taxNumberDistinctionNumber, office.firma, office.name, office.vorname, office.strasse, office.hausnummer,
    office.plz, office.ort, office.telefon, office.email, office.bank, office.iban]
    const stammdaten = {}
    for (let property of properties) {
        stammdaten[property] = DriveConnector.getOfficeProperty(rootFolderId,property,currentOOversion)
    }
    replaceDocumentVariablesByObjectData(DocumentApp.openById(neueVorlage.getId()), stammdaten);
    DriveConnector.saveFormulaByName(rootFolderId,ooTables.Rechnungsvorlagelink,currentOOversion,linkFormula(neueVorlage.getId()))
}

function replaceDocumentVariablesByObjectData(dokument: GoogleAppsScript.Document.Document, datenObject) {
    // Search for all the variables to be replaced, for instance ${"Column name"}

    var inhalt = dokument.getHeader().getText();
    inhalt += " " + dokument.getBody().getText();
    inhalt += " " + dokument.getFooter().getText();
    var templateVars = inhalt.match(/\{[^\}]+\}/g);
    //                        match(/\$\{\"[^\"]+\"\}/g);      

    // Replace variables from the template with the actual values from the data object.
    // If no value is available, replace with the empty string.
    if (templateVars == null) { Logger.log("Vorlage enthält keine Variablen (mehr?)"); return; }
    for (var i = 0; i < templateVars.length; ++i) {
        var spalte = templateVars[i].substring(1, templateVars[i].length - 1);
        var variableData = datenObject[spalte];
        if (variableData) {
            var variableText = variableData;
            try {
                variableText = variableData.getDate() + "." + (variableData.getMonth() + 1) + "." + variableData.getFullYear();
            } catch (e) { }
            dokument.getBody().replaceText(templateVars[i], variableText || "");
            //Falls es Header oder Footer gibt, hier auch Variablen ersetzen
            try {
                dokument.getHeader().replaceText(templateVars[i], variableText || "");
            } catch (e) { };
            try {
                dokument.getFooter().replaceText(templateVars[i], variableText || "");
            } catch (e) { };
        } else {
            Logger.log("Variable nicht vorhanden:" + spalte);
        }
    }
    dokument.getBody().replaceText("{_", "{");
    try {
        dokument.getHeader().replaceText("{_", "{");
    } catch (e) { };
    try {
        dokument.getFooter().replaceText("{_", "{");
    } catch (e) { };

}

