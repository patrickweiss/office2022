import { string } from "prop-types";
import { Konto } from "../../client/office-one-2021/bm/BusinessDataFacade";
import { AbschreibungenTableCache, AusgabenTableCache, BankbuchungenTableCache, BewirtungsbelegeTableCache, CSVExport, CSVTableCache, EinnahmenRechnungTableCache, EURechnungTableCache, GutschriftenTableCache, KontenTableCache, UmbuchungenTableCache, VerpflegungsmehraufwendungenTableCache } from "../../officeone/BusinessDataFacade";
import { BusinessModel } from "../../officeone/BusinessModel";
import { belegNr, currentOOversion, ooTables, ServerFunction } from "../oo21lib/systemEnums";
import { DriveConnector } from "./driveconnector";

interface agent {
  rootFolderId: string;
  geschaeftsjahrString: string;
  geschaeftsjahr: Date;
  csvCache: CSVTableCache;
  kontenCache: KontenTableCache;
  kontenHashTableRows: Object;
  //  kontenSpalten?: Object;
  ausgabenLinkFormula?: string;
  ausgabenCache?: AusgabenTableCache;
  quelle?: string;
  bewirtungsbelegeCache?: BewirtungsbelegeTableCache;
  ausgabenID: string;
  verpflegungsmehraufwendungenCache?: VerpflegungsmehraufwendungenTableCache;
  einnahmenID: string;
  einnahmenLinkFormula?: string;
  rechnungenCache?: EinnahmenRechnungTableCache;
  euRechnungenCache?: EURechnungTableCache;
  gutschriftenCache?: GutschriftenTableCache;
  bankkontenID: string;
  bankkontenLinkFormula?: string;
  umbuchungenCache?: UmbuchungenTableCache;
  bankbuchungenCache?: BankbuchungenTableCache;
  abschreibungenCache?: AbschreibungenTableCache;
  beispiel: string;
}
enum exportgruppe {
  abschreibung = "OfficeOneAbschreibung.Export",
  Anlage = "OfficeOne.Export",
  laufendeBuchungen = "OfficeOne.Export",
  mwstAbschluss = "OfficeOneMwstAbschluss.Export"
}

export function SimbaExportErstellen(rootFolderId: string) {
  const bm = new BusinessModel(rootFolderId, "SimbaExportErstellen");
  try {
    const ausgabenID = DriveConnector.getSpreadsheet(rootFolderId, ooTables.AusgabenD, currentOOversion).getId();
    const einnahmenID = DriveConnector.getSpreadsheet(rootFolderId, ooTables.RechnungenD, currentOOversion).getId();
    const bankkontenID = DriveConnector.getSpreadsheet(rootFolderId, ooTables.BankbuchungenD, currentOOversion).getId();
    let kontenCache = new KontenTableCache(rootFolderId);

    let a: agent = {
      rootFolderId: rootFolderId,
      geschaeftsjahrString: "",
      geschaeftsjahr: new Date(),
      csvCache: new CSVTableCache(rootFolderId),
      kontenCache: kontenCache,
      kontenHashTableRows: kontenCache.getOrCreateHashTable("Konto"),
      ausgabenID: ausgabenID,
      einnahmenID: einnahmenID,
      bankkontenID: bankkontenID,
      beispiel: "durch CSV Export ergänzt"
    };
    //  var agent = OfficeOne.createAgent(SpreadsheetApp.getActive());
    //var logrange = saw.logbeginn("Auswertungen aktualisieren");
    a.geschaeftsjahrString = bm.endOfYear().getFullYear().toString();
    a.geschaeftsjahr = new Date(parseInt(a.geschaeftsjahrString, 10), 0, 1);

    //kontenSpaltenSetzen(a);
    //Alle Buchungen werden gelöscht
    a.csvCache.reset();
    // Daten aus Tabellen mit Geschäftsvorfällen eintragen 
    ausgabenCSV(a);
    bewirtungsbelegeCSV(a);
    verpflegungsmehraufwendungenCSV(a);
    rechnungenCSV(a);
    gutschriftenCSV(a);
    euRechnungenCSV(a);
    umbuchungenCSV(a);
    bankbuchungenCSV(a);
    abschreibungenCSV(a);
    negativeBetraegeTransformierenUndExportgruppeLaufendeBuchungenCSV(a);
    //EB Buchungen fuer Simba anpassen
    kontenStammdatenErgaenzenExportgruppeAnlagenCSV(a);
    //Buchungen in CSV-Dateien Exportieren
    a.csvCache.save();
    var buchungenCSV = {};
    for (var index in a.csvCache.dataArray) {
      if (index !== "0") {
        var csvRow = a.csvCache.getRowByIndex(index);
        if (csvRow.getValue("Exportgruppe") != "") {
          if (buchungenCSV[csvRow.getValue("Exportgruppe") as string] === undefined) buchungenCSV[csvRow.getValue("Exportgruppe") as string] = "Datum;Betrag;Konto (Soll);Gegenkonto (Haben);Buchungstext;Beleg-Nr;BchgNr;USt-IDNr;Automatiksperre\n";
          var datum = isoDate(csvRow.getValue("Datum"));
          buchungenCSV[csvRow.getValue("Exportgruppe") as string] +=
            datum + ";" +
            formatBetrag(csvRow.getValue("Betrag")) + ";" +
            csvRow.getValue("SKR03 (Soll)") + ";" +
            csvRow.getValue("SKR03 (Haben)") + ";" +
            csvRow.getValue("Buchungstext") + ";" +
            belegNrInSimbaFormat(csvRow.getValue("BelegNr")as string) + ";" +
            csvRow.getId() + ";" +
            csvRow.getValue("USt-IDNr") + ";1\n";
        }
      }
    }
    const timestampCSV = new Date().toISOString();
    for (var exportGruppe in buchungenCSV) {
      if (buchungenCSV.hasOwnProperty(exportGruppe)) {
        var exportCSV = buchungenCSV[exportGruppe];
        DriveApp.getFolderById(a.rootFolderId).createFile(`${exportGruppe}:${timestampCSV}.csv`, exportCSV, "text/csv");
      }
    }
    var result = {
      serverFunction: ServerFunction.SimbaExportErstellen

    }
    bm.saveLog("SimbaExportErstellen");
    return JSON.stringify(result);
  }
  catch (e) {
    return bm.saveError(e)
    
  }
}

function belegNrInSimbaFormat(belegNr: string): string {
  return belegNr.toUpperCase().replace("Ü", "UE").replace("Ä", "AE").replace("Ö", "OE").replace("ß", "SS").replace("-", "").replace(".", "");
}

function formatBetrag(betrag) {
  return betrag.toFixed(2).toString().replace(".", ",");
}

function isoDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [day, month, year].join('.');
}
function ebBuchungAnpassen(a: agent, csvRow: CSVExport, soll: Konto, haben: Konto) {
  //  csvRow.setValue("Exportgruppe", "EB " + csvRow.getValue("Exportgruppe"));
  csvRow.setValue("Datum", a.geschaeftsjahr);
  if (soll.getKontentyp() === "GuV") csvRow.setValue("SKR03 (Soll)", "9000");
  if (haben.getKontentyp() === "GuV") csvRow.setValue("SKR03 (Haben)", "9000");
}
function ausgabenCSV(a: agent) {
  var ausgabenID = DriveConnector.getSpreadsheet(a.rootFolderId, ooTables.AusgabenD, currentOOversion).getId();


  a.ausgabenLinkFormula = linkFormula(ausgabenID);
  a.ausgabenCache = new AusgabenTableCache(a.rootFolderId)
  if (a.ausgabenCache.getRowByIndex("1").getValue("Datum") == "") return;
  a.quelle = a.ausgabenLinkFormula;


  for (var index in a.ausgabenCache.dataArray) {
    if (index !== "0") {
      var ausgabenRow = a.ausgabenCache.getRowByIndex(index);

      //Ausgabe hinzufügen ----------------------------------------------------------------
      if (ausgabenRow.getValue("netto Betrag") != 0) {
        //Der offene Posten aus der UStVA darf nicht nach Simba exportiert werden:
        //if (!(ausgabenRow.getValue("Konto") === "UStVA" && ausgabenRow.getValue("Datum").getFullYear() === a.geschaeftsjahr.getFullYear() - 1)) {
        {
          var neueBuchung = a.csvCache.createNewRow();
          neueBuchung.setBelegNr(ausgabenRow.getId());
          neueBuchung.setValue("Datum", ausgabenRow.getValue("Datum"));

          neueBuchung.setValue("Betrag", ausgabenRow.getValue("netto Betrag"));
          neueBuchung.setValue("Konto (Soll)", ausgabenRow.getValue("Konto"));
          neueBuchung.setValue("Konto (Haben)", ausgabenRow.getValue("Gegenkonto"));
          neueBuchung.setValue("Buchungstext", ausgabenRow.getValue("Text"));
        }
      }

      //Vorsteuer hinzufügen ----------------------------------------------------------------
      if (ausgabenRow.getValue("Vorsteuer") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(ausgabenRow.getId());

        neueBuchung.setValue("Datum", ausgabenRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", ausgabenRow.getValue("Vorsteuer"));
        neueBuchung.setValue("Konto (Soll)", "Vorsteuer");
        neueBuchung.setValue("Konto (Haben)", ausgabenRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Buchungstext", ausgabenRow.getValue("Text"));
      }
    }
  }

}
function bewirtungsbelegeCSV(a: agent) {
  var ausgabenID = DriveConnector.getSpreadsheet(a.rootFolderId, ooTables.BewirtungsbelegeD, currentOOversion).getId();
  //  a.ausgabenLinkFormula = saw.linkFormula(ausgabenID);
  a.bewirtungsbelegeCache = new BewirtungsbelegeTableCache(a.rootFolderId);
  if (a.bewirtungsbelegeCache.getRowByIndex("1").getValue("Datum") == "") return;

  a.quelle = linkFormula(ausgabenID);
  for (var index in a.bewirtungsbelegeCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.bewirtungsbelegeCache.getRowByIndex(index);

      //abziehbare Bewirtungskosten hinzufügen 70% Bewirtung netto + Trinkgeld----------------------------------------------------------------
      var neueBuchung = a.csvCache.createNewRow();
      neueBuchung.setBelegNr(buchungRow.getId());

      neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

      neueBuchung.setValue("Betrag", buchungRow.getValue("abziehbare Bewirtungskosten"));
      neueBuchung.setValue("Konto (Soll)", "abziehbare Bewirtungskosten");
      neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
      neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));


      //nicht abziehbare Bewirtungskosten hinzufügen 30% Bewirtung netto + Trinkgeld----------------------------------------------------------------
      var neueBuchung = a.csvCache.createNewRow();
      neueBuchung.setBelegNr(buchungRow.getId());

      neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

      neueBuchung.setValue("Betrag", buchungRow.getValue("nicht abziehbare Bewirtungskosten"));
      neueBuchung.setValue("Konto (Soll)", "nicht abziehbare Bewirtungskosten");
      neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
      neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));


      //Vorsteuer hinzufügen Vorsteuer aus Bewirtung---------------------------------------------------------------
      if (buchungRow.getValue("Vorsteuer") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Vorsteuer"));
        neueBuchung.setValue("Konto (Soll)", "Vorsteuer");
        neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));
      }
    }
  }
}
function verpflegungsmehraufwendungenCSV(a: agent) {
  var ausgabenID = a.ausgabenID;
  // a.ausgabenLinkFormula = saw.linkFormula(ausgabenID);
  a.verpflegungsmehraufwendungenCache = new VerpflegungsmehraufwendungenTableCache(a.rootFolderId)
  a.quelle = linkFormula(ausgabenID);
  if (a.verpflegungsmehraufwendungenCache.getRowByIndex("1").getValue("Datum") == "") return;

  for (var index in a.verpflegungsmehraufwendungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.verpflegungsmehraufwendungenCache.getRowByIndex(index);


      //Verpflegungsmehraufwendungen hinzufügen ----------------------------------------------------------------
      var betrag = buchungRow.getValue("Verpflegungsmehr-aufwendung");
      if (betrag != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", betrag);
        neueBuchung.setValue("Konto (Soll)", "Verpflegungsmehraufwendung");
        neueBuchung.setValue("Konto (Haben)", "bar");
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));
      }
    }


  }
}
function rechnungenCSV(a: agent) {
  var einnahmenID = a.einnahmenID
  a.einnahmenLinkFormula = linkFormula(einnahmenID);
  a.rechnungenCache = new EinnahmenRechnungTableCache(a.rootFolderId);
  if (a.rechnungenCache.getRowByIndex("1").getValue("Datum") == "") return;


  for (var index in a.rechnungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.rechnungenCache.getRowByIndex(index);

      // Netto Betrag auf Leistung buchen
      if (buchungRow.getValue("Summe netto") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());
        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Summe netto"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Gegenkonto"));
        var kontoRow = getOrCreateKontoLeistungRow(a, buchungRow.getValue("Name"));
        neueBuchung.setValue("Konto (Haben)", kontoRow.getValue("Konto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Name") + " RgNr:" + buchungRow.getRechnungsNr());
      }

      // "USt. in Rechnung gestellt" buchen
      var kontoRow = getOrCreateKontoRow(a, "USt. in Rechnung gestellt");
      if (buchungRow.getValue("Summe Umsatzsteuer") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());
        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Summe Umsatzsteuer"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Konto (Haben)", "USt. in Rechnung gestellt");
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Name") + " RgNr:" + buchungRow.getValue("Rechnungs-Nr"));
      }
    }
  }
}
function euRechnungenCSV(a: agent) {
  var einnahmenID = a.einnahmenID
  a.einnahmenLinkFormula = linkFormula(einnahmenID);
  a.euRechnungenCache = new EURechnungTableCache(a.rootFolderId);
  if (a.euRechnungenCache.getRowByIndex("1").getValue("Datum") == "") return;


  for (var index in a.euRechnungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.euRechnungenCache.getRowByIndex(index);

      // Netto Betrag auf Leistung buchen
      if (buchungRow.getValue("Summe netto") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());
        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Summe netto"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Gegenkonto"));
        var kontoRow = getOrCreateKontoLeistungRow(a, buchungRow.getValue("USt-IdNr"));
        neueBuchung.setValue("Konto (Haben)", kontoRow.getValue("Konto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("USt-IdNr") + " RgNr:" + buchungRow.getId());
        neueBuchung.setValue("USt-IDNr", buchungRow.getValue("USt-IdNr"));
      }
    }
  }
}
function gutschriftenCSV(a: agent) {
  var einnahmenID = a.einnahmenID
  a.einnahmenLinkFormula = linkFormula(einnahmenID);
  a.gutschriftenCache = new GutschriftenTableCache(a.rootFolderId)
  if (a.gutschriftenCache.getRowByIndex("1").getValue("Datum") == "") return;


  for (var index in a.gutschriftenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.gutschriftenCache.getRowByIndex(index);

      // Netto Betrag auf Leistung buchen
      if (buchungRow.getValue("Summe netto") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());
        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Summe netto"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Gegenkonto"));
        var kontoRow = getOrCreateKontoLeistungRow(a, buchungRow.getValue("Name"));
        neueBuchung.setValue("Konto (Haben)", kontoRow.getValue("Konto"));
        neueBuchung.setValue("Buchungstext", "Gutschrift:" + buchungRow.getName());
      }

      // "USt. in Rechnung gestellt" buchen
      var kontoRow = getOrCreateKontoRow(a, "USt. in Rechnung gestellt");
      if (buchungRow.getValue("Summe Umsatzsteuer") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Summe Umsatzsteuer"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Konto (Haben)", "USt. in Rechnung gestellt");
        neueBuchung.setValue("Buchungstext", "Gutschrift:" + buchungRow.getValue("Gutschrift-Nr"));
      }
    }
  }
}
function umbuchungenCSV(a: agent) {
  var bankkontenID = a.bankkontenID
  if (bankkontenID == "") return;

  a.bankkontenLinkFormula = linkFormula(bankkontenID);
  a.umbuchungenCache = new UmbuchungenTableCache(a.rootFolderId)
  if (a.umbuchungenCache.getRowByIndex("1").getValue("Datum") == "") return;
  a.quelle = a.bankkontenLinkFormula;

  for (var index in a.umbuchungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.umbuchungenCache.getRowByIndex(index);
      let umbId = buchungRow.getValue("ID");

      //Umbuchung hinzufügen  
      if (buchungRow.getValue("Betrag") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Betrag"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Konto"));
        neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));
      }
    }

  }

}
function bankbuchungenCSV(a: agent) {
  var bankkontenID = a.bankkontenID;
  if (bankkontenID == "") return;

  a.bankkontenLinkFormula = linkFormula(bankkontenID);
  a.bankbuchungenCache = new BankbuchungenTableCache(a.rootFolderId);
  if (a.bankbuchungenCache.getRowByIndex("1").getValue("Datum") == "") return;

  a.quelle = a.bankkontenLinkFormula;

  for (var index in a.bankbuchungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.bankbuchungenCache.getRowByIndex(index);

      //Bankbuchung hinzufügen  
      if (buchungRow.getValue("Betrag") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getBelegID());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Betrag"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Bilanzkonto"));
        neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));
      }
    }


  }
}
function abschreibungenCSV(a: agent) {
  var ausgabenID = a.ausgabenID;
  a.ausgabenLinkFormula = linkFormula(ausgabenID);
  a.abschreibungenCache = new AbschreibungenTableCache(a.rootFolderId);
  if (a.abschreibungenCache.getRowByIndex("1").getValue("Datum") == "") return;
  a.quelle = a.ausgabenLinkFormula;

  for (var index in a.abschreibungenCache.dataArray) {
    if (index !== "0") {
      var buchungRow = a.abschreibungenCache.getRowByIndex(index);

      //Abschreibung hinzufügen  
      if (buchungRow.getValue("Betrag") != 0) {
        var neueBuchung = a.csvCache.createNewRow();
        neueBuchung.setBelegNr(buchungRow.getId());

        neueBuchung.setValue("Datum", buchungRow.getValue("Datum"));

        neueBuchung.setValue("Betrag", buchungRow.getValue("Betrag"));
        neueBuchung.setValue("Konto (Soll)", buchungRow.getValue("Konto"));
        neueBuchung.setValue("Konto (Haben)", buchungRow.getValue("Gegenkonto"));
        neueBuchung.setValue("Buchungstext", buchungRow.getValue("Text"));
        neueBuchung.setValue("Exportgruppe", exportgruppe.abschreibung);
      }
    }
  }
}
function negativeBetraegeTransformierenUndExportgruppeLaufendeBuchungenCSV(a: agent) {
  for (var index in a.csvCache.dataArray) {
    if (index !== "0") {
      negativenBetragTranformierenAusCSVExport(a.csvCache.getRowByIndex(index));
    }
  }
}

function negativenBetragTranformierenAusCSVExport(csvRow: CSVExport) {
  if (csvRow.getValue("Exportgruppe") === "") csvRow.setValue("Exportgruppe", exportgruppe.laufendeBuchungen);
  if (csvRow.getValue("BelegNr") === belegNr.mwstUStVAAufVMwSt ||
    csvRow.getValue("BelegNr") === belegNr.mwstVorsteuerAufVMwSt ||
    csvRow.getValue("BelegNr") === belegNr.mwstUmsatzsteuer19AufVMwSt ||
    csvRow.getValue("BelegNr") === belegNr.mwstFinanzamtOP) csvRow.setValue("Exportgruppe", exportgruppe.mwstAbschluss);
  if (csvRow.getValue("Betrag") < 0) {
    var altSoll = csvRow.getValue("Konto (Soll)");
    var altHaben = csvRow.getValue("Konto (Haben)");
    csvRow.setValue("Betrag", -csvRow.getValue("Betrag"));
    csvRow.setValue("Konto (Soll)", altHaben);
    csvRow.setValue("Konto (Haben)", altSoll);
  }
}

function kontenStammdatenErgaenzenExportgruppeAnlagenCSV(a: agent) {
  for (var index in a.csvCache.dataArray) {
    if (index !== "0") {
      kontoStammdatenErgaenzenCSV(a, a.csvCache.getRowByIndex(index));
    }
  }
}

function kontoStammdatenErgaenzenCSV(a: agent, csvRow) {
  const soll = getOrCreateKontoRow(a, csvRow.getValue("Konto (Soll)"));
  const haben = getOrCreateKontoRow(a, csvRow.getValue("Konto (Haben)"));

  csvRow.setValue("SKR03 (Soll)", soll.getSKR03());
  csvRow.setValue("SKR03 (Haben)", haben.getSKR03());
  if (soll.getGruppe() == "Anlage") csvRow.setValue("Exportgruppe", exportgruppe.Anlage);

  if (csvRow.getValue("Datum") < a.geschaeftsjahr) ebBuchungAnpassen(a, csvRow, soll, haben);

}

function getOrCreateKontoLeistungRow(a: agent, kontoName) {

  kontoName = "Leistung:" + kontoName;
  var kontoRow = a.kontenHashTableRows[kontoName];

  //Wenn es das Konto noch nicht gibt, dann anlegen.
  if (kontoRow === undefined) {
    throw new Error("Konto fehlt:" + kontoName);
  }

  return a.kontenHashTableRows[kontoName];
}

function getOrCreateKontoRow(a: agent, kontoName): Konto {

  var kontoRow = a.kontenHashTableRows[kontoName];

  //Wenn es das Konto noch nicht gibt, dann anlegen.
  if (kontoRow === undefined) {
    throw new Error("Konto fehlt:" + kontoName);
  }

  return a.kontenHashTableRows[kontoName];
}


export function linkFormula(fileId) {
  try {
    var neueDatei = DriveApp.getFileById(fileId);
    return "=HYPERLINK(\"" + neueDatei.getUrl() + "\";\"" + neueDatei.getName() + "\")";
  }
  catch (e) {
    var folder = DriveApp.getFolderById(fileId);
    return "HYPERLINK(\"" + folder.getUrl() + "\";\"" + folder.getName() + "\")";
  }
}