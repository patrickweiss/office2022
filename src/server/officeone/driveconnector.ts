import { copyFolder, getOrCreateFolder } from "../oo21lib/driveConnector";
import { adminUser, clientSystemMasterId, currentOOversion, office, ooFolders, ooTables, ooVersions, ranges, systemMasterId, systemMasterProperty } from "../oo21lib/systemEnums";
import { getDevOpsFolder } from "./newOfficeOneVersion";

export const oooVersion = "0056";


export class DriveConnector {
  static driveFolders = {};
  static spreadsheets = {};
  static rangeValues = {};
  static konfiguration: Object;
  static oooVersionsRangeFileMap = {
    "0056": {
      RechnungSchreibenD: "1 Rechnung schreiben",
      GutschriftenD: "1 Rechnung schreiben",
      EURechnungenD: "1 Rechnung schreiben",
      KundenD: "1 Rechnung schreiben",
      PositionenarchivD: "1 Rechnung schreiben",
      ProdukteD: "1 Rechnung schreiben",
      RechnungenD: "1 Rechnung schreiben",
      AbschreibungenD: "2 Ausgaben erfassen",
      AusgabenD: "2 Ausgaben erfassen",
      BewirtungsbelegeD: "2 Ausgaben erfassen",
      VerpflegungsmehraufwendungenD: "2 Ausgaben erfassen",
      "VerträgeD": "2 Ausgaben erfassen",
      BankbuchungenD: "3 Bankbuchungen zuordnen",
      UmbuchungenD: "3 Bankbuchungen zuordnen",
      BuchungenD: "4 Bilanz, Gewinn und Steuererklärungen",
      EÜRD: "4 Bilanz, Gewinn und Steuererklärungen",
      KontenD: "4 Bilanz, Gewinn und Steuererklärungen",
      UStVAD: "4 Bilanz, Gewinn und Steuererklärungen",
      CSVExportD: "4 Bilanz, Gewinn und Steuererklärungen",
      GdpduD: "7 Datenschlürfer",
      DataFileD: "7 Datenschlürfer",
      Konfiguration: "00 Office"
    },
    "0055": {
      RechnungSchreibenD: "1 Rechnung schreiben - Version:0055",
      GutschriftenD: "1 Rechnung schreiben - Version:0055",
      EURechnungenD: "1 Rechnung schreiben - Version:0055",
      KundenD: "1 Rechnung schreiben - Version:0055",
      PositionenarchivD: "1 Rechnung schreiben - Version:0055",
      ProdukteD: "1 Rechnung schreiben - Version:0055",
      RechnungenD: "1 Rechnung schreiben - Version:0055",
      AbschreibungenD: "2 Ausgaben erfassen - Version:0055",
      AusgabenD: "2 Ausgaben erfassen - Version:0055",
      BewirtungsbelegeD: "2 Ausgaben erfassen - Version:0055",
      VerpflegungsmehraufwendungenD: "2 Ausgaben erfassen - Version:0055",
      "VerträgeD": "2 Ausgaben erfassen - Version:0055",
      BankbuchungenD: "3 Bankbuchungen zuordnen - Version:0055",
      UmbuchungenD: "3 Bankbuchungen zuordnen - Version:0055",
      BuchungenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      EÜRD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      KontenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      UStVAD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      CSVExportD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      GdpduD: "7 Datenschlürfer - Version:0055",
      DataFileD: "7 Datenschlürfer - Version:0055",
    }
  }
  static oooVersionValueFileMap = {
    "0056": {
      GutschriftenDatei: "1 Rechnung schreiben",
      HilfeRechnungFertigstellen: "1 Rechnung schreiben",
      HilfeRechnungSchreiben: "1 Rechnung schreiben",
      KundenEMailVorlageDoc: "1 Rechnung schreiben",
      Rechnungsnummer: "1 Rechnung schreiben",
      Rechnungsvorlagelink: "1 Rechnung schreiben",
      KundenRechnungsvorlage: "1 Rechnung schreiben",
      KundenStornorechnungsvorlage: "1 Rechnung schreiben",
      EMailID: "4 Bilanz, Gewinn und Steuererklärungen",
      EinnahmenID: "4 Bilanz, Gewinn und Steuererklärungen",
      AusgabenID: "4 Bilanz, Gewinn und Steuererklärungen",
      BankkontenID: "4 Bilanz, Gewinn und Steuererklärungen",
      LastschriftenID: "4 Bilanz, Gewinn und Steuererklärungen"
    },
    "0055": {
      GutschriftenDatei: "1 Rechnung schreiben - Version:0055",
      HilfeRechnungFertigstellen: "1 Rechnung schreiben - Version:0055",
      HilfeRechnungSchreiben: "1 Rechnung schreiben - Version:0055",
      KundenEMailVorlageDoc: "1 Rechnung schreiben - Version:0055",
      Rechnungsnummer: "1 Rechnung schreiben - Version:0055",
      Rechnungsvorlagelink: "1 Rechnung schreiben - Version:0055",
      KundenRechnungsvorlage: "1 Rechnung schreiben - Version:0055",
      KundenStornorechnungsvorlage: "1 Rechnung schreiben - Version:0055",
      EMailID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      EinnahmenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      AusgabenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      BankkontenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
      LastschriftenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055"
    }
  }
  public static saveRootIdtoSpreadsheet(rootFolderId: string, rangeName: string, version: string) {
    //rootID in spreadsheet
    const spreadsheet = this.getSpreadsheet(rootFolderId, rangeName, version);
    spreadsheet.getRangeByName(ranges.OfficeRootID).getCell(1, 1).setValue(rootFolderId);

  }
  public static getOfficeProperty(rootFolderId: string, name: office, version: string) {
    if (!this.konfiguration) {
      this.konfiguration = {};
      const konfigurationRangeData: Object[][] = DriveConnector.getNamedRangeData(rootFolderId, "Konfiguration", oooVersion)[0];
      for (let zeile of konfigurationRangeData) {
        this.konfiguration[zeile[0].toString()] = zeile[1];
      }
    }
    return this.konfiguration[name];
  }


  //alte Funktionen, alle mit rootFolderId und Version
  static getNamedRangeData(rootFolderId: string, rangeName: string, version: string): [Object[][], string[][], string[][]] {
    console.log(`getNamedRangeData(${rootFolderId},${rangeName},${version}`)
    var spreadsheet = this.getSpreadsheet(rootFolderId, rangeName, version);
    console.log(spreadsheet.getName());
    return [spreadsheet.getRangeByName(rangeName).getValues(),
    spreadsheet.getRangeByName(rangeName).getBackgrounds(),
    spreadsheet.getRangeByName(rangeName).getFormulasR1C1()];
  }
  static getNamedRangeDataAndFormat(rootFolderId: string, rangeName: string, version: string): [Object[][], string[][], string[][], string[][]] {
    Logger.log(`getNamedRangeData(${rootFolderId},${rangeName},${version}`)

    var spreadsheet = this.getSpreadsheet(rootFolderId, rangeName, version);
    return [spreadsheet.getRangeByName(rangeName).getValues(),
    spreadsheet.getRangeByName(rangeName).getBackgrounds(),
    spreadsheet.getRangeByName(rangeName).getFormulasR1C1(),
    spreadsheet.getRangeByName(rangeName).getNumberFormats()];
  }
  static getValueByName(rootFolderId: string, rangeName: string, version: string) {
    let value = this.rangeValues[rootFolderId + rangeName + version];
    if (value === undefined) {
      value = this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).getFormula();
      if (value === "") value = this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).getValue();
      this.rangeValues[rootFolderId + rangeName] = value;
    }
    return value;
  }
  static saveValueByName(rootFolderId: string, rangeName: string, version: string, value: any) {
    this.rangeValues[rootFolderId + rangeName + version] = value
    this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).setValue(value);
    SpreadsheetApp.flush()
  }
  static saveFormulaByName(rootFolderId: string, rangeName: string, version: string, value: any) {
    this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).setFormula(value);
    SpreadsheetApp.flush()
  }
  static saveNamedRangeData(rootFolderId: string, rangeName: string, loadRowCount, dataArray: Object[][], backgroundArray: string[][], formulaArray: Object[][], version: string) {
    console.log("DriveConnector.saveNamedRangeData:" + rootFolderId + " " + rangeName);
    var spreadsheet = this.getSpreadsheet(rootFolderId, rangeName, version);
    let dataRange = spreadsheet.getRangeByName(rangeName);
    // wenn nötig Zeilen einfügen oder löschen
    var rowDifference = dataArray.length - loadRowCount;
    if (rowDifference > 0) dataRange.getSheet().insertRowsBefore(dataRange.getRow() + 1, rowDifference);

    //Range erzeugen um Daten einzufügen und DataRange neu setzen
    var currentSheet = dataRange.getSheet();


    //Wenn es keine Daten gibt muss trotzdem eine Zeile stehen bleiben und deren inhalt muss gelöscht werden
    if (dataArray.length < 2) {
      if ((-rowDifference - 1) != 0) currentSheet.deleteRows(dataRange.getRow() + 1, -rowDifference - 1);
      currentSheet.getRange(dataRange.getRow() + 1, dataRange.getColumn(), 1, dataRange.getNumColumns()).clearContent();
      currentSheet.getRange(dataRange.getRow(), dataRange.getColumn(), 1, dataRange.getNumColumns()).setValues(dataArray);
      return;
    }
    else
      if (rowDifference < 0) dataRange.getSheet().deleteRows(dataRange.getRow() + 1, -rowDifference);

    //DataRange aktualisieren
    dataRange = spreadsheet.getRangeByName(rangeName);

    //alle vorhandenen Formeln in das DataArray kopieren um "setFormulas" nach setValues zu sparen

    for (var zeilen in dataArray) {
      for (var spalten in dataArray[zeilen]) {
        if (formulaArray[zeilen][spalten] != "" && formulaArray[zeilen][spalten] != undefined) {
          dataArray[zeilen][spalten] = formulaArray[zeilen][spalten];
        }
      }
    }
    dataRange.setValues(dataArray);
    dataRange.setBackgrounds(backgroundArray).setBorder(true, true, true, true, true, true, "#b7b7b7", SpreadsheetApp.BorderStyle.SOLID);
    SpreadsheetApp.flush();
  }
  public static getSpreadsheet(rootFolderId: string, rangeName: string, version: string) {
    try {
      let spreadsheetFolder: GoogleAppsScript.Drive.Folder = this.driveFolders[rootFolderId];
      if (spreadsheetFolder === undefined) {
        spreadsheetFolder = DriveApp.getFolderById(rootFolderId);
        this.driveFolders[rootFolderId] = spreadsheetFolder;
      }
      let spreadsheet = this.spreadsheets[rootFolderId + this.getRangeFileName(rangeName, version)];
      if (spreadsheet === undefined) {
        var spreadsheetId = "";
        if (!spreadsheetFolder.getFilesByName(this.getRangeFileName(rangeName, version)).hasNext()) {
          spreadsheetId = this.copyAndInitializeSpreadsheet(rangeName, oooVersion, spreadsheetFolder);
          console.log("new spreadsheet:" + spreadsheetId + " for range:" + rangeName + "for folder:" + rootFolderId);
        } else {
          spreadsheetId = spreadsheetFolder.getFilesByName(this.getRangeFileName(rangeName, version)).next().getId();
          console.log("old spreadsheet:" + spreadsheetId + " for range:" + rangeName + "for folder:" + rootFolderId);
        }
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        this.spreadsheets[rootFolderId + this.getRangeFileName(rangeName, version)] = spreadsheet;
      }
      return spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
    } catch (e) {
      console.log("exception get spreadsheet:" + spreadsheetId + " for range:" + rangeName + "for folder:" + rootFolderId + " for version:" + version);
      console.log(e.stack);
      return SpreadsheetApp.getActive();
    }
  }
  private static copyAndInitializeSpreadsheet(rangeName: string, version: string, spreadsheetFolder: GoogleAppsScript.Drive.Folder) {
    //throw new Error("Update needed to Version: "+oooVersion); 
    console.log(rangeName + " " + version + " " + spreadsheetFolder.getName());
    const masterId = this.getMasterFileID(rangeName, version);
    const masterSpreadsheet = SpreadsheetApp.openById(masterId);
    const location: any[][] = masterSpreadsheet.getRangeByName("OfficeRootID").getValues();
    let spreadsheetId = DriveApp.getFileById(masterId).makeCopy(this.getRangeFileName(rangeName, version), spreadsheetFolder).getId();
    let spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    location[0][0] = spreadsheetFolder.getId();
    spreadsheet.getRangeByName("OfficeRootID").setValues(location);
    if (this.getRangeFileName(rangeName, version) === "4 Bilanz, Gewinn und Steuererklärungen - Version:" + oooVersion) {
      spreadsheet.getRangeByName("EMailID").setValue("");
      spreadsheet.getRangeByName("EinnahmenID").setValue("");
      spreadsheet.getRangeByName("AusgabenID").setValue("");
      spreadsheet.getRangeByName("BankkontenID").setValue("");
      spreadsheet.getRangeByName("LastschriftenID").setValue("");
    } else {
      if (this.getRangeFileName(rangeName, version) === "0 E-Mail verschicken - Version:" + oooVersion) DriveConnector.saveValueByName(spreadsheetFolder.getId(), "EMailID", oooVersion, spreadsheetId);
      if (this.getRangeFileName(rangeName, version) === "1 Rechnung schreiben - Version:" + oooVersion) DriveConnector.saveValueByName(spreadsheetFolder.getId(), "EinnahmenID", oooVersion, spreadsheetId);
      if (this.getRangeFileName(rangeName, version) === "2 Ausgaben erfassen - Version:" + oooVersion) DriveConnector.saveValueByName(spreadsheetFolder.getId(), "AusgabenID", oooVersion, spreadsheetId);
      if (this.getRangeFileName(rangeName, version) === "3 Bankbuchungen zuordnen - Version:" + oooVersion) DriveConnector.saveValueByName(spreadsheetFolder.getId(), "BankkontenID", oooVersion, spreadsheetId);
      if (this.getRangeFileName(rangeName, version) === "5 SEPA - Lastschriftmandat - Version:" + oooVersion) DriveConnector.saveValueByName(spreadsheetFolder.getId(), "LastschriftenID", oooVersion, spreadsheetId);
    }
    return spreadsheetId;
  }

  //alte Konfiguration
  static getRangeFileName(rangeName: string, version: string) {
    let fileName = DriveConnector.oooVersionsRangeFileMap[version][rangeName];
    if (fileName === undefined) fileName = DriveConnector.oooVersionValueFileMap[version][rangeName];
    if (fileName === undefined) throw new Error("Range:" + rangeName + " is not defined in DriveConnector");
    return fileName + " - Version:" + version;
  }
  static getMasterFileID(rangeName: string, version: string) {
    const masterFolder = DriveApp.getFolderById(systemMasterProperty.officeOne2022_TemplateFolderId);
    const fileName = this.getRangeFileName(rangeName, version)
    masterFolder.getFilesByName(fileName).next().getId()
    let masterSpreadsheetId = masterFolder.getFilesByName(fileName).next().getId()
    return masterSpreadsheetId;
  }
}



export function generateAndMailTableRow() {
  let namedRange = "EMailIdD";
  let columnArray = DriveConnector.getNamedRangeData("1-b7eO9tjq4lZcpHDnhfcd4cUdBnRbXGt", namedRange, oooVersion)[0][0];
  let getterAndSetter = "";
  columnArray.forEach(column => {
    let camelColumn = column.toString().replace(/ /g, "").replace(/-/g, "");
    getterAndSetter += "  public get" + camelColumn + "(){return this.getValue(\"" + column.toString() + "\");}\n";
    getterAndSetter += "  public set" + camelColumn + "(value){this.setValue(\"" + column.toString() + "\",value);}\n";

  })
  GmailApp.sendEmail("patrick.sbrzesny@saw-office.net", "dblib Template for:" + namedRange, getterAndSetter);
}

export function generateAndMailoooVersionsFileNameIdMap() {
  const newVersionFolder = getDevOpsFolder().getFoldersByName(oooVersion).next().getFoldersByName(ooFolders.office + " " + currentOOversion).next();
  const spreadheets = newVersionFolder.getFilesByType("application/vnd.google-apps.spreadsheet");
  let oooVersionsFileNameIdMap = {};
  while (spreadheets.hasNext()) {
    const dataTable = spreadheets.next();
    oooVersionsFileNameIdMap[dataTable.getName()] = dataTable.getId();
  }
  GmailApp.sendEmail("patrick.sbrzesny@saw-office.net", "oooVersionsFileNameIdMap", JSON.stringify(oooVersionsFileNameIdMap));

}

class ValuesCache {
  dataArray: any[][];
  dataHash = {};
  constructor(data: any[][]) {
    if (!data) throw new Error("no data for Values Cache");
    this.dataArray = data;
    for (let row of this.dataArray) {
      this.dataHash[row[0]] = row[1];
    }
  }
  public getValueByName(name: string) {
    return this.dataHash[name];
  }
}
