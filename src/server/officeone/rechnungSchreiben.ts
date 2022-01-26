import { RechnungSchreiben,EinnahmenRechnung, EinnahmenRechnungTableCache, Kunde, KundenTableCache, PositionenarchivTableCache, RechnungSchreibenTableCache } from "../../officeone/BusinessDataFacade";
interface agent {
  rootId: string;
  positionenCache: RechnungSchreibenTableCache;
}

export function mrechnungErstellen() {
  var spreadSheet = SpreadsheetApp.getActive();
  
  //Prüfen ob alle notwendigen Felder im Rechnugskopf ausgefüllt sind
  var rangeNamenArray = spreadSheet.getNamedRanges();
  for (var index in rangeNamenArray) {
    if (rangeNamenArray[index].getName().substring(0, 2) == "RS") {
      //prüfen ob ein Wert eingedeben wurde, wenn nicht dann Fehlermeldung ausgeben
      var wert = rangeNamenArray[index].getRange().getValue().toString();
      if (wert === "" && (rangeNamenArray[index].getName() != "RSAdresszusatz" && rangeNamenArray[index].getName() != "RSHausnummer")) {
        rangeNamenArray[index].getRange().activate();

        var ui = SpreadsheetApp.getUi(); // Same variations.
        var result = ui.alert('Bitte alle notwendigen Daten eingeben',
          'Es sind nicht alle Daten für eine gültige Rechnung eingegeben. Bitte geben sie \"' + rangeNamenArray[index].getName() + '\" ein.', ui.ButtonSet.OK
        );
        return;
      }
    }
  }

  const rootId = spreadSheet.getRangeByName("OfficeRootID").getValues()[0][0].toString();
  const rootFolder = DriveApp.getFolderById(rootId);
  const positionenCache = new RechnungSchreibenTableCache(rootId);
  let a: agent = {
    rootId: rootId,
    positionenCache:positionenCache
  };

  const positionenRowArray = positionenCache.getRowArray();
  //Prüfen ob alle notwendigen Felder in den Rechnungspositionen ausgefüllt sind
  for (let positionsRow of positionenRowArray) {

    //liest die einzelne Positionen der Rechnung im positionenCache(Rechnung schreiben)
    var beschreibungPosition = positionsRow.getValue("Beschreibung");
    var mengePosition = positionsRow.getValue("Menge");
    var einheitPosition = positionsRow.getValue("Einheit");
    var einzelPreisPosition = positionsRow.getValue("Einzelpreis");
    var uStPosition = positionsRow.getValue("USt.%");

    if (
      beschreibungPosition !== "" ||
      mengePosition !== "" ||
      einheitPosition !== "" ||
      einzelPreisPosition !== "" ||
      uStPosition !== ""

    ) if (

        beschreibungPosition !== "" &&
        mengePosition !== "" &&
        einheitPosition !== "" &&
        einzelPreisPosition !== "" &&
        uStPosition !== ""

      ) { } else {

        var ui = SpreadsheetApp.getUi();
        var result = ui.alert('Bitte alle notwendigen Daten eingeben',
          'Es sind nicht alle Daten für eine gültige Rechnung eingegeben. Bitte vervollständigen Sie die Positionen.', ui.ButtonSet.OK
        );
        return;
      }

  }

  //Alle Bedingungen erfüllt, es wird eine neue Rechnung erstellt und eingetragen
  const rechnungenCache = new EinnahmenRechnungTableCache(rootId);
  const einnahmenOrdner = rootFolder.getFoldersByName("1 Einnahmen").next();
  const kundenRootOrdner = einnahmenOrdner.getFoldersByName("1 Kunden").next();
  const rechnungOrdner = einnahmenOrdner.getFoldersByName("3 Rechnungen").next();

  //richtige Rechnungsvorlage auswählen
  const rechnungVorlage = DriveApp.getFileById(
    DocumentApp.openByUrl(URLFromLinkCell(spreadSheet.getRangeByName("Rechnungsvorlagelink"))).getId()
  );

  const rechnungsNummer = spreadSheet.getRangeByName("RSRechnungsnummer").getValue().toString();
  const rechnungsDatum = spreadSheet.getRangeByName("RSRechnungsdatum").getValue() as Date;
  const rechnungsKunde = spreadSheet.getRangeByName("RSFirma").getValue().toString();
  const neueRechnungRow = rechnungenCache.createNewRow();

  neueRechnungRow.setValue("Status", "erstellt");
  neueRechnungRow.setValue("Rechnungs-Nr", rechnungsNummer);

  neueRechnungRow.setValue("Name", rechnungsKunde);
  neueRechnungRow.setValue("Adresszusatz", spreadSheet.getRangeByName("RSAdresszusatz").getValue().toString());      //Adresszusatz
  neueRechnungRow.setValue("Datum", rechnungsDatum);
  neueRechnungRow.setValue("Leistung von", spreadSheet.getRangeByName("RSLeistungszeitraumVON").getValue() as Date);
  neueRechnungRow.setValue("Leistung bis", spreadSheet.getRangeByName("RSLeistungszeitraumBIS").getValue() as Date);
  
  const rechnungsSummen = SpreadsheetApp.getActive().getRangeByName("RechnungSchreibenSummen").getValues();
  neueRechnungRow.setValue("Summe netto", Number(rechnungsSummen[0][0]));
  neueRechnungRow.setValue("Summe Umsatzsteuer", Number(rechnungsSummen[1][1]));
  neueRechnungRow.setValue("Rechnungsbetrag", Number(rechnungsSummen[2][0]));
  neueRechnungRow.setValue("Strasse", spreadSheet.getRangeByName("RSStrasse").getValue().toString());
  neueRechnungRow.setValue("Hausnummer", spreadSheet.getRangeByName("RSHausnummer").getValue().toString());
  neueRechnungRow.setValue("PLZ", spreadSheet.getRangeByName("RSPLZ").getValue().toString());
  neueRechnungRow.setValue("Ort", spreadSheet.getRangeByName("RSOrt").getValue().toString());
  neueRechnungRow.setValue("Zahlungsziel", spreadSheet.getRangeByName("RSZahlungsziel").getValue().toString());
  neueRechnungRow.setValue("Gegenkonto", "offene Forderung");

  var dokumentName = "Rechnung" + "_"
    + rechnungsNummer
    + "_" + formatDate(neueRechnungRow.getDatum())
    + "_" + formatMoney(neueRechnungRow.getBetrag())
    + "_" + neueRechnungRow.getValue("Name")
    + "_Leistungszeitraum:"
    + formatDate(neueRechnungRow.getLeistungvon())
    + "-" + formatDate(neueRechnungRow.getLeistungbis());

  //   var neueRechnung =  DocumentApp.openById(rechnungVorlage.makeCopy("Rechnung_"+rechnungsDatum+"_"+rechnungsNummer+"_"+rechnungsKunde, rechnungOrdner).getId());
  var neueRechnung = DocumentApp.openById(rechnungVorlage.makeCopy(dokumentName, rechnungOrdner).getId());
  var neueRechnungId = neueRechnung.getId();

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Version 0032 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
  mPositionsZeilenArchivieren(a, neueRechnung);
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Version 0032 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  mpositionsZeilenBearbeiten(a, neueRechnung);
  replaceDocumentVariablesByRechnungenData(neueRechnung, neueRechnungRow);
  neueRechnungRow.createLink(neueRechnungId, dokumentName);
  neueRechnungRow.setFileId(neueRechnungId);

//Rechnungssheet wieder löschen für nächste Rechnung
  spreadSheet.getRangeByName("RSRechnungsnummer").setValue(rechnungenCache.getData()[0][0]);//Nummer
  spreadSheet.getRangeByName("RSRechnungsdatum").setValue("");
  spreadSheet.getRangeByName("RSLeistungszeitraumVON").setValue("");
  spreadSheet.getRangeByName("RSLeistungszeitraumBIS").setValue("");

  spreadSheet.getRangeByName("RSFirma").setValue("");
  spreadSheet.getRangeByName("RSAdresszusatz").setValue("");
  spreadSheet.getRangeByName("RSStrasse").setValue("");
  spreadSheet.getRangeByName("RSHausnummer").setValue("");
  spreadSheet.getRangeByName("RSPLZ").setValue("");
  spreadSheet.getRangeByName("RSOrt").setValue("");

  rechnungenCache.save();

  //Formatierung erste Positionszeile
  SpreadsheetApp.getActiveSheet().getRange("C26:K26").setBorder(true,true,true, true, true, true,"#b7b7b7", SpreadsheetApp.BorderStyle.SOLID);

  //Summen Formeln wieder hinbiegen
  SpreadsheetApp.getActiveSheet().getRange("J29:K30").setFormulas([["=SUM(J26:J27)", ""], ["", "=SUM(K26:K27)"]]);

  //Rechnungslink bei Kunde eintragen, ggf. neuen Kunden anlegen
  var kundenCache = new KundenTableCache(rootId);
  var kundenHash = kundenCache.getOrCreateHashTable("Name");
  var aktuellerKunde = kundenHash[neueRechnungRow.getValue("Name")as string] as Kunde;
  if (aktuellerKunde != undefined) {
    //Kunden auswählen
    aktuellerKunde.setValue("Auswahl", "Ja");
    aktuellerKunde.farbeAuswahlJa();
    aktuellerKunde.setFormula("Aktuelles Dokument", neueRechnungRow.getValue("Link")as string);
  } else {
    //neuen Kunden anlegen und auswählen
    aktuellerKunde = kundenCache.createNewRow();
    aktuellerKunde.setValue("Auswahl", "Ja");
    aktuellerKunde.farbeAuswahlJa();
    aktuellerKunde.setFormula("Aktuelles Dokument", neueRechnungRow.getValue("Link")as string);
    aktuellerKunde.setValue("Name", neueRechnungRow.getValue("Name"));
    aktuellerKunde.setValue("Strasse", neueRechnungRow.getValue("Strasse"));
    aktuellerKunde.setValue("Hausnummer", neueRechnungRow.getValue("Hausnummer"));
    aktuellerKunde.setValue("Adresszusatz", neueRechnungRow.getValue("Adresszusatz"));
    aktuellerKunde.setValue("PLZ", neueRechnungRow.getValue("PLZ"));
    aktuellerKunde.setValue("Ort", neueRechnungRow.getValue("Ort"));
    aktuellerKunde.setValue("E-Mail", neueRechnungRow.getValue("E-Mail"));
    //neuen Ordner für Kunden anlegen
    var kontaktId = kundenRootOrdner.createFolder(neueRechnungRow.getValue("Name")as string).getId();
    aktuellerKunde.setFolderId(kontaktId);
    aktuellerKunde.createLink(kontaktId,neueRechnungRow.getValue("Name")as string );
  }

  kundenCache.save();

  //Link auf Rechnung in Kontaktordner des Kunden eintragen
  var kundenOrdner = DriveApp.getFolderById(aktuellerKunde.getValue("ID")as string);
  kundenOrdner.addFile(DriveApp.getFileById(neueRechnung.getId()));
  resizeValidationRange("KundenNamen", "Name");
  var datenValidierung = SpreadsheetApp.newDataValidation()
    .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName("KundenNamen"), true)
    .setAllowInvalid(true)
    .build();
  spreadSheet.getRangeByName("RSFirma").setDataValidation(datenValidierung);
  SpreadsheetApp.getActive().getSheetByName("Rechnungen").activate();

}

export function mneuePosition() {
    var sheet = SpreadsheetApp.getActive().getSheetByName("Rechnung schreiben");
    var positionsRange = SpreadsheetApp.getActive().getRangeByName("RechnungSchreibenD");
    var zeilePosition = positionsRange.getRow()+positionsRange.getNumRows()-1;
    sheet.insertRowAfter(zeilePosition);
    sheet.getRange(zeilePosition+1, 3, 1, 3).merge(); 
    sheet.getRange(zeilePosition+1, 3).activate();
    sheet.getRange(zeilePosition+1, 3,1,9).setBorder(true,true,true, true, true, true,"#b7b7b7", SpreadsheetApp.BorderStyle.SOLID);
    
    
    sheet.getRange(zeilePosition+1, 10, 1, 2).setFormulasR1C1([["=Round((R[0]C[-4]*R[0]C[-2])*100)/100","=Round((R[0]C[-1]*R[0]C[-2])*100)/100"]]);
    SpreadsheetApp.getActive().setNamedRange("RechnungSchreibenD", 
                                             sheet.getRange(
                                               positionsRange.getRow(),
                                               positionsRange.getColumn(),
                                               positionsRange.getNumRows()+1,
                                               positionsRange.getNumColumns()));    
}

export function URLFromLinkCell(cell) {
  var formel = cell.getFormula();
  var url = formel.match("\"(.*?)\"");
  try {
    return url[1];
  } catch (e) {
    SpreadsheetApp.getUi().alert('Um diese Funktion korrekt auszuführen muss in "' + cell.getA1Notation()
      + '" in Tabelle "' + cell.getSheet().getName() + '" ein Dokument verlinkt sein');
  }
}

/*
function getDate(variableData){
  return  variableData.getDate()+"."+(variableData.getMonth()+1)+"."+variableData.getFullYear();
}*/

export function formatMoney(betrag: any) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
}
export function formatDate(date: Date) {
  try{
  return new Intl.DateTimeFormat("de-DE").format(date);
  }catch(e){
    return "unbekannt"
  }
}
export function formatPercent(number:number){
  return (number*100).toFixed(0)+" %";
}

function mPositionsZeilenArchivieren(a, rechnung) {

  var spreadSheet = SpreadsheetApp.getActive();

  // erhält die Daten der Tabelle "Rechnung schreiben" und speichert im positionenCache
  var positionenCache: RechnungSchreibenTableCache = a.positionenCache;

  // erhält die Daten der Tabelle "Positionenarchiv" und speichert im positionenArchivCache
  var positionenArchivCache = new PositionenarchivTableCache(a.rootId);

  Logger.log("Positionszeilen archivieren------------------------");

  for (var index in positionenCache.dataArray) {
    if (index !== "0") {
      var positionsRow = positionenCache.getRowByIndex(index);
      var rechnungsNummer = spreadSheet.getRangeByName("RSRechnungsnummer").getValue();

      //liest die einzelne Positionen der Rechnung im positionenCache(Rechnung schreiben)
      var beschreibungPosition = positionsRow.getValue("Beschreibung");
      var mengePosition = positionsRow.getValue("Menge");
      var einheitPosition = positionsRow.getValue("Einheit");
      var einzelPreisPosition = positionsRow.getValue("Einzelpreis");
      var uStPosition = positionsRow.getValue("USt.%");
      var nettobetragPosition = positionsRow.getValue("Nettobetrag");
      var ustBetragPosition = positionsRow.getValue("USt. Betrag");

      //Wenn nicht leer, dann die einzelne Positionen im positionenArchivCache einfügen
      var neuePositionenArchivRow = positionenArchivCache.createNewRow();          // Positionenarchiv <= Rechnung schreiben
      neuePositionenArchivRow.setValue("Rechnungs-Nr", rechnungsNummer.toString());      // Rechnungs-Nr <= RSRechnungsnummer(NamedRange)
      neuePositionenArchivRow.setValue("Produktname", beschreibungPosition); // Produktname <= Beschreibung
      neuePositionenArchivRow.setValue("Anzahl", mengePosition);             // Anzahl <= Menge
      neuePositionenArchivRow.setValue("Einheit", einheitPosition);          // Einheit <= Einheit
      neuePositionenArchivRow.setValue("Preis pro Einheit netto", einzelPreisPosition); // Preis pro Einheit netto <= Einzelpreis
      neuePositionenArchivRow.setValue("MwSt-Satz", uStPosition);            // MwSt-Satz <= USt.%
      neuePositionenArchivRow.setValue("Preis netto", nettobetragPosition);  // Preis netto <= Nettobetrag
      neuePositionenArchivRow.setValue("MwSt", ustBetragPosition);           // MwSt <= USt. Betrag
      neuePositionenArchivRow.setValue("RPosVon", "0");                     // RPosVon <= X Gibts nicht
      neuePositionenArchivRow.setValue("RPosBis", "0");                     // RPosBis <= X Gibts nicht
      neuePositionenArchivRow.setValue("Beschreibung", "keine");            // Beschreibung <= X Gibts nicht 
    }
  }
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Version 0032 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  positionenArchivCache.save();
}

function mpositionsZeilenBearbeiten(a, rechnung) {

  var positionenCache: RechnungSchreibenTableCache = a.positionenCache;

  Logger.log("Positionen bearbeiten------------------------");

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Version 0030 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  

  var rechnungDokument = rechnung;
  var positionsTabelle = rechnungDokument.getBody().getTables()[1];

  for (var index in positionenCache.dataArray) {
    if (index !== "0") {
      var templateZeile = positionsTabelle.getRow(positionsTabelle.getNumRows() - 1).copy();
      Logger.log(templateZeile.getText()); //debugging
      var positionsRow = positionenCache.getRowByIndex(index);

      if (
        positionsRow.getValue("Beschreibung") != "" &&
        positionsRow.getValue("Menge") != "" &&
        positionsRow.getValue("Einheit") != "" &&
        positionsRow.getValue("Einzelpreis") != "" &&
        positionsRow.getValue("USt.%") !== "") {

        replaceDocumentVariablesByRowData(rechnungDokument, positionsRow);
        if (parseInt(index) < positionenCache.dataArray.length - 1) {
          positionsRow = positionenCache.getRowByIndex((parseInt(index, 10) + 1).toString());
          if (
            positionsRow.getValue("Beschreibung") != "" &&
            positionsRow.getValue("Menge") != "" &&
            positionsRow.getValue("Einheit") != "" &&
            positionsRow.getValue("Einzelpreis") != "" &&
            positionsRow.getValue("USt.%") !== "") positionsTabelle.appendTableRow(templateZeile);
        }
      }
    }
  }
  positionenCache.deleteAll();
  var neueLeereZeile = positionenCache.createNewRow();
  neueLeereZeile.setFormula("Nettobetrag", "=Round((R[0]C[-4]*R[0]C[-2])*100)/100");
  neueLeereZeile.setBackground("Nettobetrag", "#a2c4c9");
  neueLeereZeile.setFormula("USt. Betrag", "=Round((R[0]C[-1]*R[0]C[-2])*100)/100");
  neueLeereZeile.setBackground("USt. Betrag", "#76a5af");

  positionenCache.save();

}


export function replaceDocumentVariablesByRowData(dokument, positionsRow:RechnungSchreiben) {

  // Search for all the variables to be replaced, for instance ${"Column name"}
  var inhalt = dokument.getText();
  var templateVars = inhalt.match(/\{[^\}]+\}/g);
  //                        match(/\$\{\"[^\"]+\"\}/g);      

  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  if (templateVars == null) { Logger.log("Vorlage enthält keine Variablen (mehr?)"); return; }
  for (var i = 0; i < templateVars.length; ++i) {
    var spalte = templateVars[i].substring(1, templateVars[i].length - 1);

    var variableData = positionsRow.getValue(spalte);
    var format = positionsRow.getFormat(spalte);
    if (format != undefined) {
      // Logger.log("Variable: "+spalte+" Format: "+format);

      if (format == "#,##0.00\\ [$€-1]") variableData = formatMoney(variableData);
      if (format == "0%") {
        Logger.log("Prozent:" + variableData);
        variableData = formatPercent(variableData as number)
      }
      var variableText = variableData;
      try {
        variableText = (variableData as Date).getDate() + "." + ((variableData as Date).getMonth() + 1) + "." + (variableData as Date).getFullYear();
      } catch (e) { }
      dokument.replaceText(templateVars[i], variableText || "");
      //Falls es Header oder Footer gibt, hier auch Variablen ersetzen
      try {
        dokument.getHeader().replaceText(templateVars[i], variableText || "");
      } catch (e) { };
      try {
        dokument.getFooter().replaceText(templateVars[i], variableText || "");
      } catch (e) { };


    }
  }
  dokument.replaceText("{_", "{");
  try {
    dokument.getHeader().replaceText("{_", "{");
  } catch (e) { };
  try {
    dokument.getFooter().replaceText("{_", "{");
  } catch (e) { };

}

export function replaceDocumentVariablesByRechnungenData(dokument, positionsRow:EinnahmenRechnung) {

  // Search for all the variables to be replaced, for instance ${"Column name"}
  var inhalt = dokument.getText();
  var templateVars = inhalt.match(/\{[^\}]+\}/g);
  //                        match(/\$\{\"[^\"]+\"\}/g);      

  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  if (templateVars == null) { Logger.log("Vorlage enthält keine Variablen (mehr?)"); return; }
  for (var i = 0; i < templateVars.length; ++i) {
    var spalte = templateVars[i].substring(1, templateVars[i].length - 1);

    var variableData = positionsRow.getValue(spalte);
    var format = positionsRow.getFormat(spalte);
  
    if (spalte === "Rechnungs-Nr") {
      variableData = positionsRow.getId();
      format = "";
    }
    if (format != undefined) {

      if (format == "#,##0.00\\ [$€-1]") variableData = formatMoney(variableData);
      if (format == "0%") {
        variableData = formatPercent(variableData as number);
      }
      var variableText = variableData;
      try {
        variableText = (variableData as Date).getDate() + "." + ((variableData as Date).getMonth() + 1) + "." + (variableData as Date).getFullYear();
      } catch (e) { }
      dokument.replaceText(templateVars[i], variableText || "");
      //Falls es Header oder Footer gibt, hier auch Variablen ersetzen
      try {
        dokument.getHeader().replaceText(templateVars[i], variableText || "");
      } catch (e) { };
      try {
        dokument.getFooter().replaceText(templateVars[i], variableText || "");
      } catch (e) { };


    }
  }
  dokument.replaceText("{_", "{");
  try {
    dokument.getHeader().replaceText("{_", "{");
  } catch (e) { };
  try {
    dokument.getFooter().replaceText("{_", "{");
  } catch (e) { };

}

export function resizeValidationRange(rangeName, ColumnName) {
  var tableSheet = SpreadsheetApp.getActive().getRangeByName(rangeName).getSheet();
  var tableName = tableSheet.getName();
  var firstDataRange = dataRangeFirst(tableName);
  var firstCell = cell(firstDataRange, ColumnName);
  var lastDataRange = dataRangeLast(tableName);
  SpreadsheetApp.getActive().setNamedRange(rangeName,
    tableSheet.getRange(firstCell.getRow(),
      firstCell.getColumn(),
      lastDataRange.getLastRow() - firstCell.getRow() + 1)
  );
}
export function dataRangeFirst(tableName) {
  var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName);
  return ueberschriftRange.getSheet().getRange(
    ueberschriftRange.getRow() + 1, ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
}
export function cell(neueRange, spaltenName) {
  var tabellenName = neueRange.getSheet().getName();
  try {
    // Logger.log("zelleVonSpalte:Tabelle "+tabellenName+" Spalte:"+spaltenName);
    return neueRange.getCell(1, nummerVonSpalte(tabellenName, spaltenName));
  } catch (e) { }
  return null;
}

export function dataRangeLast(tableName) {
  var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName);
  var dataRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName + "D");
  return ueberschriftRange.getSheet().getRange(
    ueberschriftRange.getRow() + dataRange.getNumRows() - 1, ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
}

export function nummerVonSpalte(tabelleName, spaltenName) {
  //Funktion gibt die Spaltenummer von String spaltenName in String tabellenName zurück
  //Die erste Spalte hat die Nummer 1!!!!!
  var tabellenUeberschriften = SpreadsheetApp.getActive().getRangeByName(tabelleName);
  var spaltenNummern = {};
  var spaltenNamen = tabellenUeberschriften.getValues()[0];
  for (var spalteIndex in spaltenNamen) spaltenNummern[spaltenNamen[spalteIndex.toString()]] = spalteIndex;
  return parseInt(spaltenNummern[spaltenName]) + 1;
}  
