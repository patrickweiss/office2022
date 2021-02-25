import { BusinessModel } from "../../officeone/BusinessModel";
import { DriveConnector, oooVersion } from "./driveconnector";
import { copyTemplates, createNewOfficOneFolders, getDevOpsFolder } from "./newOfficeOneVersion";
import { dataRangeByKeyFromColumn } from "./onEditRechnung";
import { cell } from "./rechnungSchreiben";
import { linkFormula } from "./SimbaExportErstellen";
import numeral from "numeral";

interface agent {
    order: string;
    event: GoogleAppsScript.Events.SheetsOnFormSubmit;
    kundeRange: GoogleAppsScript.Spreadsheet.Range;
    kundenName: string;
    clientFolder: GoogleAppsScript.Drive.Folder;
}


export function installTestsystemTest() {
    let e = {
        namedValues: {
            "Geben Sie die E-Mail des Google Accounts ein für den die Rechnungsvorlage in Google Drive freigegeben werden soll:": "drromanjiang@gmail.com",
            "Geben Sie hier Ihren Namen ein": "Roman Jiang",
            "Was bieten Sie an oder auch wie nennen Sie Ihr Unternehmen?": "Dr. Roman Jiang - Unternehmensberatung",
            "Straße": "Filderbahnstrasse",
            "Hausnummer": "54",
            "PLZ": "70567",
            "Ort": "Stuttgart",
            "Telefonnummer": "0160 949 20 288",
            "Ihre E-Mail": "drromanjiang@gmail.com",
            "Ihre Steuernummer:": "0122345",
            "IBAN": "DE 1234 5678 9012",
            "Name der Bank": "Commerzbank AG"
        }
    }
    testFromForm(e);
}



export function testFromForm(e) {
    //Kunden dürfen nicht von meheren Threads parallel angelegt werden
    //der zweite Kunde überschreibt sonst den Status des ersten....
    //Die SAW Bibliothek ist nicht Multithreading fähig!!!

    var lock = LockService.getDocumentLock();
    lock.waitLock(200000);
    // Logger.log("formularAnfrage funktioniert");
    let gmail = e.namedValues["Geben Sie die E-Mail des Google Accounts ein, für den ein Enterprise.Office in Google Drive freigegeben werden soll:"].toString()
    let name = "Wilhelma Weinessig";
    let eventTestInstallation = {
            namedValues: {
                "Geben Sie die E-Mail des Google Accounts ein für den die Rechnungsvorlage in Google Drive freigegeben werden soll:": gmail,
                "Geben Sie hier Ihren Namen ein": name ,
                "Was bieten Sie an oder auch wie nennen Sie Ihr Unternehmen?": "Wilhelma Weinessig - Unternehmensberatung",
                "Straße": "Krikrag Strasse",
                "Hausnummer": "99",
                "PLZ": "99999",
                "Ort": "Erde",
                "Telefonnummer": "0160 123 456 78",
                "Ihre E-Mail": gmail,
                "Ihre Steuernummer:": "01234567",
                "IBAN": "DE 1234 5678 9012",
                "Name der Bank": "Commerzbank AG"
            }
        }


    eMailMitLink(gmail,name, eventTestInstallation);
    // Logger.log("nach eMailMitLink");
    lock.releaseLock();
}
/* Lösung: Trigger musst von 007@saw-office.net gelegt sein   
Exception in Zeile:4 in Datei:link (saw) Stacktrace:        
at link (saw):4 (eMailFromLinkCell)
at formularAnfrage:24 (eMailMitLink)
at formularAnfrage:8 (formularAnfrage)
*/

function eMailMitLink(kundenEmail, kundenName, e) {
    var agent = {} as agent;
    agent.order = "eMailMitLink";
    agent.event = e;

    var inhalt = "Ihr OfficeOne.System wird jetzt installiert, dies dauert ca. 5 Minuten",
        betreff = inhalt;

    //Email erstellen und verschicken
    GmailApp.sendEmail(kundenEmail, betreff, inhalt);
    //Nachschauen, ob es schon eine Installation zu dieser E-Mail gibt. Wenn ja, dann wird nur ein Link geschickt.
    var aktuelleInstallation;

    try {
        aktuelleInstallation = dataRangeByKeyFromColumn("Testsysteme", kundenEmail, "E-Mail");
    } catch (e) {
        //var aktuelleInstallation;
        aktuelleInstallation = newDataRange("Testsysteme");
        var neueVersionString = oooVersion;
        let clientFolder = DriveApp.getFolderById("0Bww6H6AlfkCfT0Vnc281SU1YR28")
            .createFolder("XXXX " + kundenEmail + ".Office " + oooVersion);
        let bm = new BusinessModel(clientFolder.getId());
        clientFolder.setName(bm.endOfYear().getFullYear() + " " + kundenEmail + ".Office " + oooVersion);


        agent.clientFolder = clientFolder;

        var neuerKundenordnerID = clientFolder.getId();


        cell(aktuelleInstallation, "ID").setValue(neuerKundenordnerID);
        cell(aktuelleInstallation, "Link").setFormula(linkFormula(neuerKundenordnerID));
        cell(aktuelleInstallation, "Name").setValue(kundenName);
        cell(aktuelleInstallation, "E-Mail").setValue(kundenEmail);
        cell(aktuelleInstallation, "Datum").setValue(new Date());
        cell(aktuelleInstallation, "Version").setValue(oooVersion);
        cell(aktuelleInstallation, "Update auf Version").setValue(oooVersion);   
        cell(aktuelleInstallation, "Produkte").setValue("OfficeOne,OfficeBanking");
        cell(aktuelleInstallation, "MIBeruf").setValue(agent.event.namedValues["Was bieten Sie an oder auch wie nennen Sie Ihr Unternehmen?"]);
        cell(aktuelleInstallation, "MIStrasse").setValue(agent.event.namedValues["Straße"]);
        cell(aktuelleInstallation, "MIHausnummer").setValue(agent.event.namedValues["Hausnummer"]);
        cell(aktuelleInstallation, "MIPLZ").setValue(agent.event.namedValues["PLZ"]);
        cell(aktuelleInstallation, "MIOrt").setValue(agent.event.namedValues["Ort"]);
        cell(aktuelleInstallation, "MITelefonnummer").setValue(agent.event.namedValues["Telefonnummer"]);
        cell(aktuelleInstallation, "MIE-Mail").setValue(agent.event.namedValues["Ihre E-Mail"]);
        cell(aktuelleInstallation, "MISteuernummer").setValue(agent.event.namedValues["Ihre Steuernummer:"]);
        //    saw.cell(aktuelleInstallation,"MIZahlungsziel").setValue(agent.event.namedValues["Wie schnell sollen Deine Kunden zahlen?"]);
        cell(aktuelleInstallation, "MIIBAN").setValue(agent.event.namedValues["IBAN"]);
        cell(aktuelleInstallation, "MIBank").setValue(agent.event.namedValues["Name der Bank"]);
        agent.kundeRange = aktuelleInstallation;
        installationStarten(aktuelleInstallation, agent);
    }

    //Link schicken
    DriveApp.getFolderById(cell(aktuelleInstallation, "ID").getValue()).addEditor(kundenEmail);

}

function installationStarten(installationDataRange: GoogleAppsScript.Spreadsheet.Range, agent: agent) {
    if (cell(installationDataRange, "Status").getValue() == "Update abgeschlossen") return;

    //neue, leere Tabelle ins Kunden Office kopieren
    cell(installationDataRange, "Datum").setValue(new Date());
    var versionEUR = oooVersion  //Installationstabell unter neueVersion
    cell(installationDataRange, "Status").setValue("Version " + versionEUR + " in Kundenordner kopieren");

    var kundenName = cell(installationDataRange, "Name").getValue();
    agent.kundenName = kundenName;
    let clientFolder = agent.clientFolder;
    //read from all Tables from new version to make sure all new Spreadsheets get copied
    for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[oooVersion])) {
        if (rangeName !== "ElsterTransferD" && rangeName !== "InstallationenD" && rangeName !== "TestsystemeD") {
            DriveConnector.getNamedRangeData(clientFolder.getId(), rangeName, oooVersion);
        }
    }
    createNewOfficOneFolders(clientFolder.getId());

   // Magic Invoice
   let neuerVorlagenOrdner = clientFolder.getFoldersByName("0 Vorlagen").next();
      
   var rechnungsVorlageMagicInvoice =  getDevOpsFolder().getFoldersByName(oooVersion).next()
   .getFoldersByName("0 Vorlagen").next().getFilesByName("Rechnungsvorlage Magic Invoice").next();
   var neueRechnungsVorlageMagicInvoice = rechnungsVorlageMagicInvoice.makeCopy("Rechnungsvorlage "+agent.event.namedValues["Geben Sie hier Ihren Namen ein"]+" - "+agent.event.namedValues["Was bieten Sie an oder auch wie nennen Sie Ihr Unternehmen?"],neuerVorlagenOrdner);
   replaceDocumentVariablesByRangeData(DocumentApp.openById(neueRechnungsVorlageMagicInvoice.getId()), agent.kundeRange);
   
   var stornorechnungsVorlageMagicInvoice =  getDevOpsFolder().getFoldersByName(oooVersion).next()
   .getFoldersByName("0 Vorlagen").next().getFilesByName("Stornorechnungsvorlage Magic Invoice").next();
   var neueStornorechnungsVorlageMagicInvoice = stornorechnungsVorlageMagicInvoice.makeCopy("Stornorechnungsvorlage "+agent.event.namedValues["Geben Sie hier Ihren Namen ein"]+" - "+agent.event.namedValues["Was bieten Sie an oder auch wie nennen Sie Ihr Unternehmen?"],neuerVorlagenOrdner);
   replaceDocumentVariablesByRangeData(DocumentApp.openById(neueStornorechnungsVorlageMagicInvoice.getId()), agent.kundeRange);
   
   
   
   //Link für Rechnungs- und Stornorechnungsvorlage eintragen, Link auf E-Mailvorlage löschen (muss Benutzer nach Installation selbst erstellen und einfügen)
   DriveConnector.saveFormulaByName(clientFolder.getId(),"Rechnungsvorlagelink",oooVersion,linkFormula(neueRechnungsVorlageMagicInvoice.getId()))
   DriveConnector.saveFormulaByName(clientFolder.getId(),"KundenRechnungsvorlage",oooVersion,linkFormula(neueRechnungsVorlageMagicInvoice.getId()))   
   DriveConnector.saveFormulaByName(clientFolder.getId(),"KundenStornorechnungsvorlage",oooVersion,linkFormula(neueStornorechnungsVorlageMagicInvoice.getId()))
  // DriveConnector.saveFormulaByName(clientFolder.getId(),"KundenEMailVorlageDoc",oooVersion,linkFormula(neueeMailVorlageDoc.getId()))
  // copyTemplates(getDevOpsFolder().getFoldersByName(oooVersion).next().getId(), clientFolder.getId());
}


function newDataRange(tableName) {
    var ueberschriftenRange = SpreadsheetApp.getActive().getRangeByName(tableName);
    var tabelle = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
    try {
        tabelle.insertRowBefore(ueberschriftenRange.getRow() + 1);
    } catch (e) {
        tabelle.insertRowAfter(ueberschriftenRange.getRow());
        var newRange = tabelle.getRange(ueberschriftenRange.getRow() + 1, ueberschriftenRange.getColumn(), 1, ueberschriftenRange.getNumColumns());
        newRange.setFontWeight("normal");
    }
    var newRange = tabelle.getRange(ueberschriftenRange.getRow() + 1, ueberschriftenRange.getColumn(), 1, ueberschriftenRange.getNumColumns());
    newRange.setFontWeight("normal");
    //  newRange.setBackground('#ffffff');
    newRange.setBorder(true, true, true, true, true, true);
    return newRange;
}

function replaceDocumentVariablesByRangeData(dokument, datenRange){
    numeral.locale('de');
    // Search for all the variables to be replaced, for instance ${"Column name"}
    var inhalt = dokument.getText();
    var templateVars = inhalt.match(/\{[^\}]+\}/g);
    //                        match(/\$\{\"[^\"]+\"\}/g);      
    
    // Replace variables from the template with the actual values from the data object.
    // If no value is available, replace with the empty string.
    if (templateVars==null){Logger.log("Vorlage enthält keine Variablen (mehr?)");return;}
    for (var i = 0; i < templateVars.length; ++i) {
      var spalte = templateVars[i].substring(1,templateVars[i].length-1);
  
      try{
      var variableData = cell(datenRange,spalte).getValue();
      var format = cell(datenRange,spalte).getNumberFormat();
      Logger.log("Variable: "+spalte+" Format: "+format);
      if (format=="#,##0.00\\ [$€-1]")variableData=numeral(variableData).format("0,0.00 $");
      if (format=="0%")variableData=numeral(variableData).format("0%");
      var variableText = variableData;
      try{
        variableText=variableData.getDate()+"."+(variableData.getMonth()+1)+"."+variableData.getFullYear();
      }catch (e){}
      dokument.replaceText(templateVars[i], variableText || "");
        //Falls es Header oder Footer gibt, hier auch Variablen ersetzen
        try{
          dokument.getHeader().replaceText(templateVars[i], variableText || "");
        }catch(e){};
        try{
          dokument.getFooter().replaceText(templateVars[i], variableText || "");
        }catch(e){};
      }catch(e){     
        var ausnahme=e;
        Logger.log("Variable nicht vorhanden:"+spalte);
        Logger.log(ausnahme);
     }
    }
    dokument.replaceText("{_","{");
    try{
      dokument.getHeader().replaceText("{_","{");
    }catch(e){};
    try{
      dokument.getFooter().replaceText("{_","{");
    }catch(e){};
    
  }
  
  
