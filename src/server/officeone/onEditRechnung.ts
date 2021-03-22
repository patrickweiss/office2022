import { KundenTableCache, ProdukteTableCache } from "../../officeone/BusinessDataFacade";

export default function onEditRechnung(e) {
    var eventSheetName = e.range.getSheet().getName();
    if (eventSheetName == "Rechnungspositionen") rechnungpositionenEvent(e);
    if (eventSheetName == "Kunden") kundenEvent(e);
    if (eventSheetName == "Produkte") produkteEvent(e);
    if (eventSheetName == "Rechnung schreiben") rechnungSchreibenEvent(e);
}

function rechnungpositionenEvent(e) {
    if (isEventInTableColumn(e, "Rechnungspositionen", "Produktname")) positionAusProduktErgaenzen(e);
    if (isEventInTableColumn(e, "Rechnungspositionen", "Aktion")) rechnungsAktion(e);
}
function positionAusProduktErgaenzen(e) {
    completeDataFromTableForKey("Produkte", e.range);
}
function rechnungsAktion(e) {
    Logger.log("rechnungsAktion- value:" + e.range.getValue());
    if (e.range.getValue() == "neue Position") {
        var rechnungsIdFormel = e.range.getSheet().getRange(e.range.getRow(), e.range.getColumn() + 1).getFormula();
        positionVorbefuellen(rechnungsIdFormel, e.range);
        e.range.setValue("buchen");
    }
}
function positionVorbefuellen(rechnungIdFormel, vorigePositionRange) {
    var positionenSheet = SpreadsheetApp.getActive().getRangeByName("Rechnungspositionen").getSheet();
    //neue Zeile einfügen
    var neuePositionRange;
    if (vorigePositionRange == null)
        neuePositionRange = positionenSheet.getRange(positionenSheet.getLastRow() + 1, 1, 1, SpreadsheetApp.getActive().getRangeByName("Rechnungspositionen").getNumColumns());
    else {
        positionenSheet.insertRowAfter(vorigePositionRange.getRow());
        neuePositionRange = positionenSheet.getRange(vorigePositionRange.getRow() + 1, 1, 1, SpreadsheetApp.getActive().getRangeByName("Rechnungspositionen").getNumColumns());
    }

    neuePositionRange.setFontWeight("normal").setFontColor("Black").setBackground("#FFFFFF").setBorder(true, true, true, true, true, true); //white;

    //Aktion
    cell(neuePositionRange, "Aktion").setValue("buchen");
    //Validator für Aktion
    var datenValidierung = SpreadsheetApp.newDataValidation()
        .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Rechnungspositionsaktionen"), true)
        .setAllowInvalid(false)
        .build();
    cell(neuePositionRange, "Aktion").setDataValidation(datenValidierung);

    //Rechnung
    cell(neuePositionRange, "Link").setFormula(rechnungIdFormel);
    cell(neuePositionRange, "Link").setFontColor("Blue");

    //Validator für Produkt
    var datenValidierung = SpreadsheetApp.newDataValidation()
        .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Produktnamen"), true)
        .setAllowInvalid(true)
        .build();
    cell(neuePositionRange, "Produktname").setDataValidation(datenValidierung);

    //Formel und Format für Preis netto
    cell(neuePositionRange, "Preis netto").setFormula("=ROUND(" + cell(neuePositionRange, "Anzahl").getA1Notation() + "*" + cell(neuePositionRange, "Preis pro Einheit netto").getA1Notation() + ";2)");
    cell(neuePositionRange, "Preis netto").setNumberFormat("#,##0.00\\ [$€-1]");
    //Formel und Format für MwSt
    cell(neuePositionRange, "MwSt").setFormula("=ROUND(" + cell(neuePositionRange, "MwSt-Satz").getA1Notation() + "*" + cell(neuePositionRange, "Preis netto").getA1Notation() + ";2)");
    cell(neuePositionRange, "MwSt").setNumberFormat("#,##0.00\\ [$€-1]");
    //Formel Anzahl
    //saw.cell(neuePositionRange, "Anzahl").setFormula("=("+saw.cell(neuePositionRange,"RPosBis").getA1Notation()+"-"+saw.cell(neuePositionRange,"RPosVon").getA1Notation()+")*24");
    //=(H13-G13)*24

    //Formel und Format für Anzahl - soll später in Tätigkeitsnachweis kommen
    //saw.cell(neuePositionRange,"Anzahl").setFormula("=("+saw.cell(neuePositionRange,"RPosBis").getA1Notation()+"-"+saw.cell(neuePositionRange,"RPosVon").getA1Notation()+")*24");

    //Formel und Format für RPosBis und RPosVon  
    //saw.cell(neuePositionRange,"RPosVon").setValue(new Date());
    cell(neuePositionRange, "Produktname").activate();

    //Datenrange anpassen
    resizeDataRange("Rechnungspositionen");

}
function kundenEvent(e) {
    Logger.log("Ein Kundenevent :-)");
    if (isEventInTableColumn(e, "Kunden", "Auswahl")) {
        var auswahl = e.range.getValue();
        Logger.log("Hallo:" + auswahl);
        if (auswahl == "Ja") dataRangeRed(e.range);
        if (auswahl == "Nein") dataRangeWhite(e.range);
        //if (aktion=="E-Mail versenden")eMailVorlageWaehlen(e);
        //if (aktion=="Rechnung erstellen")rechnungsVorlageWaehlen(e);
        //if (aktion=="neuer Kontakt")neuerKontakt(e);  
    }
    if (isEventInTableColumn(e, "Kunden", "Name")) {
        makeUnique(e.range);
        //Ordner kann leider nicht umbenannt werden, wegen blödem Berechtigungskonzept.....
        //kontaktOrdnerUmbenennen(e.range);
    }

}
function produkteEvent(e) {
    var produkteRange = dataRangeFromEvent(e);
    if (cell(produkteRange, "Produktname").getValue() == "") return;
    if (cell(produkteRange, "Einheit").getValue() == "") return;
    if (cell(produkteRange, "Preis pro Einheit netto").getValue() == "") return;
    if (cell(produkteRange, "MwSt-Satz").getValue() == "") return;

    //Validator in Rechnungspositionen aktualisieren
    var positionenArray = createDataRangeArray("Rechnungspositionen");
    for (var index in positionenArray) {
        cellValidator(positionenArray[index], "Produktname", "Produktnamen");
    }

    produkteRange.setBackground('#eeffee').setBorder(true, true, true, true, true, true); //grün;;
}
function rechnungSchreibenEvent(e) {
    //function neuePositionhinzufuegen(e){
    var eventRange = e.range.getA1Notation();
    var sheet = SpreadsheetApp.getActive().getSheetByName("Rechnung schreiben");
    if (eventRange == SpreadsheetApp.getActive().getRangeByName("RSFirma").getA1Notation()) {
        kundeInRechnungEintragen(e.value, sheet);
        return;
    }
    /*
    if (eventRange=="J11"){
      sheet.getRange("K11").activate();
      return;
    }
    if (eventRange=="K11"){
      sheet.getRange("C26").activate();
      return;
    }
    if (eventRange=="C14"){
      sheet.getRange("E14").activate();
      return;
    }
    if (eventRange=="E14"){
      sheet.getRange("C17").activate();
      return;
    }
    if (eventRange=="C17"){
      sheet.getRange("D17").activate();
      return;
    }
    if (eventRange=="D17"){
      sheet.getRange("C20").activate();
      return;
    }
    if (eventRange=="C20"){
      sheet.getRange("J11").activate();
      return;
    }
    */
    //prüfen ob ein neues Produkt angelegt werden muss, oder eine neue Positionszeile eingefügt werden muss
    if (e.range.getRow() > SpreadsheetApp.getActive().getRangeByName("RechnungSchreiben").getRow()) {
        Logger.log("Position geändert, Column:" + e.range.getColumn());
        if (e.range.getColumn() == 3) produktAktualisieren(e);
        else positionFertig(e);
    }
}

function positionFertig(e){
        var sheet = SpreadsheetApp.getActive().getSheetByName("Rechnung schreiben");
        var positionsRange = sheet.getRange(e.range.getRow(),3,1, 7);
        var positionsValues = positionsRange.getValues();
        Logger.log(positionsValues);
        Logger.log(positionsValues[0][0]+" "+
            positionsValues[0][3]+" "+
            positionsValues[0][4]+" "+
            positionsValues[0][5]+" "+
            positionsValues[0][6]+" ");
    //          sheet.insertRowAfter(e.range.getRow());
    
        //wurde die Zeile gerade vervollständigt?
        if (positionsValues[0][0].toString()!="" &&
            positionsValues[0][3].toString()!="" && 
            positionsValues[0][4].toString()!="" && 
            positionsValues[0][5].toString()!="" &&
            positionsValues[0][6].toString()!="" && e.oldValue == undefined ){
          Logger.log("Eine neue Position wurde vervollständigt ------------------------");
          
       
          //prüfen, ob ein neues Produkt verwendet wurde
          const rootId = SpreadsheetApp.getActive().getRangeByName("OfficeRootID").getValues()[0][0].toString();

          var produkteCache = new ProdukteTableCache(rootId);
          var produkteHash = produkteCache.getOrCreateHashTable("Produktname");
          
          if (produkteHash[positionsValues[0][0].toString()]==undefined){
            Logger.log("Ein neues Produkt solle angelegt werden-----------------------");
            
            //wenn ja, neues Produkt speichern
            var neuesProdukt = produkteCache.createNewRow();
            neuesProdukt.setValue("Produktname",positionsValues[0][0].toString());
            neuesProdukt.setValue("Einheit",positionsValues[0][4].toString());
            neuesProdukt.setValue("Preis pro Einheit netto",positionsValues[0][5] as number);
            neuesProdukt.setValue("MwSt-Satz",positionsValues[0][6]);
            produkteCache.save();
            
            // und Validator aktualisieren
            
            resizeValidationRange("Produktnamen", "Produktname")
            /*
            var datenValidierung = SpreadsheetApp.newDataValidation()
            .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName("KundenNamen"),true)
            .setAllowInvalid(true)
            .build();
            sheet.getRange(e.range.getRow(),3).setDataValidation(datenValidierung);
             //damit das neue Produkt für weitere Rechnungen auch ausgewählt werden kann, denn Validator immer auch bei der ersten Rechungsposition setzen
            sheet.getRange("C26").setDataValidation(datenValidierung);
            */
          } 
          //jetzt erst neue Positionszeile einfügen, damit das neue Produkt schon ausgewählt werden kann
          
          
          /* geht jetzt durch klicken auf "+"
          sheet.insertRowAfter(e.range.getRow());
          sheet.getRange(e.range.getRow()+1, 3, 1, 3).merge(); 
          sheet.getRange(e.range.getRow()+1, 3).activate();
          sheet.getRange(e.range.getRow()+1, 3,1,9).setBorder(true,true,true, true, true, true);
          
          
          sheet.getRange(e.range.getRow()+1, 10, 1, 2).setFormulasR1C1([["=Round((R[0]C[-4]*R[0]C[-2])*100)/100","=Round((R[0]C[-1]*R[0]C[-2])*100)/100"]]);
          var positionsRange = SpreadsheetApp.getActive().getRangeByName("RechnungSchreibenD");
          SpreadsheetApp.getActive().setNamedRange("RechnungSchreibenD", 
                                                   sheet.getRange(
                                                     positionsRange.getRow(),
                                                     positionsRange.getColumn(),
                                                     positionsRange.getNumRows()+1,
                                                     positionsRange.getNumColumns()));
                                                     */
        }
        
       
      
    }
function produktAktualisieren(e) {

        //prüfen, ob ein neues Produkt verwendet wurde
        const rootId = SpreadsheetApp.getActive().getRangeByName("OfficeRootID").getValues()[0][0].toString();

        var produkteCache = new ProdukteTableCache(rootId);
        var produkteHash = produkteCache.getOrCreateHashTable("Produktname");

        var produkt = e.range.getValue();

        if (produkteHash[produkt] != undefined) {
            Logger.log("Produktdaten: " + produkteHash[produkt]);

            //Produktdaten eintrag
            var produktRow = produkteHash[produkt];
            //      Logger.log("Produktrow: "+JSON.stringify(produktRow));

            var produktValues = [
                [produktRow.getValue("Einheit"), produktRow.getValue("Preis pro Einheit netto"), produktRow.getValue("MwSt-Satz")]
            ];
            //************************************************************************
            var einheitValues = [
                [produktRow.getValue("Einheit")]
            ];
            //************************************************************************  
            Logger.log("produktValues: " + produktValues);

            var sheet = SpreadsheetApp.getActive().getSheetByName("Rechnung schreiben");
            var positionsRange = sheet.getRange(e.range.getRow(), 7, 1, 3);
            Logger.log("Range");
            positionsRange.setValues(produktValues);

        }

 }


function kundeInRechnungEintragen(name, sheet) {

    var spreadSheet = SpreadsheetApp.getActive();
    const rootId = spreadSheet.getRangeByName("OfficeRootID").getValues()[0][0].toString();

    var kundenCache =new KundenTableCache(rootId);
    var kundenHash = kundenCache.getOrCreateHashTable("Name");
    if (kundenHash[name] != undefined) {
        // sheet.getRange("J11").activate();
        spreadSheet.getRangeByName("RSRechnungsdatum").setValue(new Date());

        //sheet.getRange("C20").setValue(kundenHash[name].getValue("E-Mail"));
        spreadSheet.getRangeByName("RSAdresszusatz").setValue(kundenHash[name].getValue("Adresszusatz"));

        spreadSheet.getRangeByName("RSStrasse").setValue(kundenHash[name].getValue("Strasse"));
        spreadSheet.getRangeByName("RSHausnummer").setValue(kundenHash[name].getValue("Hausnummer"));
        spreadSheet.getRangeByName("RSPLZ").setValue(kundenHash[name].getValue("PLZ"));
        spreadSheet.getRangeByName("RSOrt").setValue(kundenHash[name].getValue("Ort"));
        //Beschreibung der ersten Rechnungsposition aktivieren
    } else {
        // sheet.getRange("C14").activate();
        spreadSheet.getRangeByName("RSRechnungsdatum").setValue(new Date());
        spreadSheet.getRangeByName("RSAdresszusatz").setValue("");
        spreadSheet.getRangeByName("RSStrasse").setValue("");
        spreadSheet.getRangeByName("RSHausnummer").setValue("");
        spreadSheet.getRangeByName("RSPLZ").setValue("");
        spreadSheet.getRangeByName("RSOrt").setValue("");
    }
}

function isEventInTableColumn(e, tabelle, spalte) {
    //Logger.log("Tabelle:"+tabelle+" Spalte:"+spalte);
    try {
        //gibt true zurück, wenn eine Zelle aus der vorgegebenen "spalte" der vorgegebenen "tabelle" geändert wurde
        var eTabelle = e.range.getSheet().getName();
        //falsche Tabelle:return false
        if (tabelle != eTabelle) return false;
        //richtige Tabelle und spalte==spalte von e.range: return true

        var eSpalte = columnName(e.range)
        // Logger.log("eSpalte:"+eSpalte+" Tabelle:"+spalte);
        if (spalte == eSpalte) return true;
    }
    catch (e) { };
    return false;
}

function columnName(range) {
    var rangeName = range.getSheet().getName();
    //Index der einzelnen Datenspalten auslesen. Benutzer können Spaltenreihenfolge ändern und Spalten hinzufügen
    var tabellenUeberschriften = SpreadsheetApp.getActive().getRangeByName(rangeName);
    var spaltenName = tabellenUeberschriften.getCell(1, range.getColumn() - tabellenUeberschriften.getColumn() + 1).getValue();
    return spaltenName;
}

function completeDataFromTableForKey(quellTabelle, schluesselRange) {
    // var logeintrag = logbeginn("completeDataFromTableForKey");

    var schluesselWert = schluesselRange.getValue();
    var schluesselSpalte = columnName(schluesselRange);
    var schluesselTabelle = schluesselRange.getSheet().getName();

    //gesuchte Quell Zeile 

    var quellRange = dataRangeByKeyFromColumn(quellTabelle, schluesselWert, schluesselSpalte);
    //gesuchte Ziel Zeile
    var zielRange = dataRangeByKeyFromColumn(schluesselTabelle, schluesselWert, schluesselSpalte);

    //durch alle Spalten iterieren
    var tabellenUeberschriften = SpreadsheetApp.getActive().getRangeByName(quellTabelle);
    var spalten = {};
    var spaltenNamen = tabellenUeberschriften.getValues()[0];
    for (var spalteIndex in spaltenNamen) {
        var quellCell = cell(quellRange, spaltenNamen[spalteIndex]);
        var zielCell = cell(zielRange, spaltenNamen[spalteIndex]);
        if (zielCell != null) zielCell.setValue(quellCell.getValue());
        var numberFormat = quellCell.getNumberFormat();
        if (numberFormat != "") zielCell.setNumberFormat(numberFormat);
    }

}

export function dataRangeByKeyFromColumn(quellTabelle, schluesselWert, schluesselSpalte) {
    //gesuchte Zeile identifizieren
    Logger.log("rangeVonTabelleMitSchluesselAusSpalte:" + quellTabelle + " " + schluesselWert + " " + schluesselSpalte);

    var schluesselSpaltenNummer = nummerVonSpalte(quellTabelle, schluesselSpalte);
    var quellRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(quellTabelle);
    var schluesselArray = quellRange.getSheet().getRange(quellRange.getRow() + 1, schluesselSpaltenNummer, quellRange.getSheet().getLastRow() - quellRange.getRow() + 1, 1).getValues();
    var quellZeile = -1;
    for (var datenZeile in schluesselArray) {
        if (schluesselArray[datenZeile][0] == schluesselWert) quellZeile = parseInt(datenZeile,10);
    }
    if (quellZeile == -1) {
        var e = new Error('Der Wert "' + schluesselWert + '" ist in der Tabelle "' + quellTabelle + '" in Spalte "' + schluesselSpalte + '" nicht gefunden worden.');
        throw e
    }
    quellZeile = quellZeile+ quellRange.getRow() + 1;
    return quellRange.getSheet().getRange(quellZeile, quellRange.getColumn(), 1, quellRange.getNumColumns());
}
function cell(neueRange, spaltenName) {
    var tabellenName = neueRange.getSheet().getName();
    try {
        // Logger.log("zelleVonSpalte:Tabelle "+tabellenName+" Spalte:"+spaltenName);
        return neueRange.getCell(1, nummerVonSpalte(tabellenName, spaltenName));
    } catch (e) { }
    return null;
}

function nummerVonSpalte(tabelleName, spaltenName) {
    //Funktion gibt die Spaltenummer von String spaltenName in String tabellenName zurück
    //Die erste Spalte hat die Nummer 1!!!!!
    var tabellenUeberschriften = SpreadsheetApp.getActive().getRangeByName(tabelleName);
    var spaltenNummern = {};
    var spaltenNamen = tabellenUeberschriften.getValues()[0];
    for (var spalteIndex in spaltenNamen) spaltenNummern[spaltenNamen[spalteIndex].toString()] = spalteIndex;
    return parseInt(spaltenNummern[spaltenName]) + 1;
}


function dataRangeRed(dataRangeCell) {
    dataRangeFromCell(dataRangeCell).setBackground('#ffdddd');
}

function dataRangeWhite(dataRangeCell) {
    dataRangeFromCell(dataRangeCell).setBackground('white');
}

function dataRangeFromCell(cell) {
    var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(cell.getSheet().getName());
    return ueberschriftRange.getSheet().getRange(
        cell.getRow(), ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
}

function resizeDataRange(tableName) {
    var tableSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
    var definitionRange = SpreadsheetApp.getActive().getRangeByName(tableName);
    SpreadsheetApp.getActive().setNamedRange(tableName + "D",
        tableSheet.getRange(definitionRange.getRow(),
            definitionRange.getColumn(),
            tableSheet.getLastRow() - definitionRange.getRow() + 1,
            definitionRange.getNumColumns()));
    //leere Zeilen unter DataRange löschen

    var leereZeilen = tableSheet.getMaxRows() - tableSheet.getLastRow();
    if (leereZeilen > 0) if (SpreadsheetApp.getActive().getRangeByName(tableName + "D").getNumRows() > 2)
        tableSheet.deleteRows(tableSheet.getLastRow() + 1, leereZeilen);
    else {//wenn es gar keine Daten gibt, muss eine leere Zeile bestehen bleiben
        if (leereZeilen > 1) tableSheet.deleteRows(tableSheet.getLastRow() + 2, leereZeilen - 1);
    }
}

function makeUnique(eRange) {

    var schluesselRange = eRange;
    var schluesselWert = schluesselRange.getValue();
    Logger.log("Kontaktname nameUnique: " + schluesselWert);

    var tabellenName = schluesselRange.getSheet().getName();
    var definitionRange = SpreadsheetApp.getActive().getRangeByName(tabellenName)
    var schluesselSpalte = columnName(schluesselRange);
    var schluesselSpaltenNummer = nummerVonSpalte(tabellenName, schluesselSpalte);
    var schluesselArray = schluesselRange.getSheet().getRange(definitionRange.getRow() + 1, schluesselSpaltenNummer + definitionRange.getColumn() - 1, definitionRange.getSheet().getLastRow() - definitionRange.getRow(), 1).getValues();
    var quellZeile = -1;
    for (var datenZeile in schluesselArray) {
        if (schluesselArray[datenZeile][0] == schluesselWert)
            if (parseInt(datenZeile) + definitionRange.getRow() + 1 != schluesselRange.getRow()) {
                Logger.log("datenZeile: " + datenZeile + " schluesselRange.getRow():" + schluesselRange.getRow());
                quellZeile = parseInt(datenZeile);
            }
    }
    if (quellZeile != -1) {
        schluesselRange.setValue(schluesselRange.getValue() + "1");
        schluesselRange.setNote(
            "Der Name wurde verändert, weil es bereits einen Kontakt mit dem Namen \"" + schluesselWert + "\" in Zeile "
            + (quellZeile + definitionRange.getRow() + 1) + " gibt. Der Name muss jedoch eindeutig sein.");
        schluesselRange.setBackground('#fce5cd');
    } else {
        schluesselRange.setBackground('#ffffff');
        schluesselRange.clearNote();
    }
}

function dataRangeFromEvent(e) {
    var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(e.range.getSheet().getName());
    return ueberschriftRange.getSheet().getRange(
        e.range.getRow(), ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
}


function createDataRangeArray(tableName) {
    //Sicherstellen dass alle Datenzeilen Teil der DataRange sind
    resizeDataRange(tableName);
    var dataRangeArray = new Array();
    //Index der einzelnen Datenspalten auslesen. Benutzer können Spaltenreihenfolge ändern und Spalten hinzufügen
    var tabellenUeberschriften = SpreadsheetApp.getActive().getRangeByName(tableName);
    //über alle Datenzeilen iterieren und zeileBearbeiten() für jede Zeile aufrufen 
    var ersteZeile = tabellenUeberschriften.getRow();
    var ersteSpalte = tabellenUeberschriften.getColumn();
    var aktuelleZeile = ersteZeile + 1;

    while (aktuelleZeile <= tabellenUeberschriften.getSheet().getLastRow()) {
        dataRangeArray.push(tabellenUeberschriften.getSheet().getRange(aktuelleZeile, ersteSpalte, 1, tabellenUeberschriften.getNumColumns()));
        aktuelleZeile++;
    }
    return dataRangeArray;
}

function cellValidator(range, columnName, validatorRangeName) {
    // Validator erstellen
    var datenValidierung = SpreadsheetApp.newDataValidation()
        .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName(validatorRangeName), true)
        .setAllowInvalid(true)
        .build();
    cell(range, columnName).setDataValidation(datenValidierung);
}

function resizeValidationRange(rangeName,ColumnName){
    var tableSheet = SpreadsheetApp.getActive().getRangeByName(rangeName).getSheet();
    var tableName = tableSheet.getName();
    var firstDataRange = dataRangeFirst(tableName);
    var firstCell = cell(firstDataRange,ColumnName);
    var lastDataRange = dataRangeLast(tableName);
    SpreadsheetApp.getActive().setNamedRange(rangeName,
                                             tableSheet.getRange(firstCell.getRow(),
                                                                 firstCell.getColumn(),
                                                                 lastDataRange.getLastRow()-firstCell.getRow()+1)
    );                                      
  }
  

  function dataRangeFirst(tableName){
    var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName);
    return ueberschriftRange.getSheet().getRange(
      ueberschriftRange.getRow()+1, ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
  }
  function dataRangeLast(tableName){
    var ueberschriftRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName);
    var dataRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tableName+"D");
    return ueberschriftRange.getSheet().getRange(
      ueberschriftRange.getRow()+dataRange.getNumRows()-1, ueberschriftRange.getColumn(), 1, ueberschriftRange.getNumColumns());
  }
  