import { currentOOversion, ooFolders } from "../oo21lib/systemEnums";
import { getDevOpsFolder } from "./newOfficeOneVersion";

export const oooVersion = "0056";


export class DriveConnector {

  static driveFolders = {};
  static spreadsheets = {};
  static rangeValues = {};

  static oooVersionsFileNameIdMap = {
    "0056": {
      "00 Office - Version:0056": "1FGKiIS766C6TKSotG1QXvLniWVMJsgUZYgNA6KL7cdY",
      "7 Datenschlürfer - Version:0056": "1Q4byI_52f3M-mP2-HSa6XItN3pb3NAnI6DXptbhtsGE",
      "3 Bankbuchungen zuordnen - Version:0056": "17AmF6ufE3KKh7YHKw5sOCv0jRsVHeltd2Iewgmq6f-U",
      "2 Ausgaben erfassen - Version:0056": "1Ok2NIxKSSZzjTmUa-Q8vvixmS4N7Br52zNFelIb_rjo",
      "1 Rechnung schreiben - Version:0056": "17otAE0kfwrMq7YZnPYdZh-AHqnUIvYqkGfPfLA_EnrQ",
      "4 Bilanz, Gewinn und Steuererklärungen - Version:0056": "12JGWZsWRKkQK_q_jslYMQKVwMh6BLK_GkzzN2_y9T_Y"
    },
    "0055": {
      "(1) Installationen - Version:0055": "1aFzY4ui0pC3vu13dUnwkVycwX39mOdOPb602wXKlU4Y",
      "(0) Testsysteme - Version:0055": "19e7vc0vIQK6odtvznGSzhybWkIBk9VFi4_H8OBSrH_E",
      "7 Datenschlürfer - Version:0055": "1e4CmRpBgpVtO6PlWXN2DyZ8UP14MSigxkd7GMlsevJw",
      "6 Posteingang - Version:0055": "1a8P5ufmV8CX5YImZBHMV7u4KXd_YOydn2w2OAvFLHF0",
      "(2) ElsterTransfer - Version:0055": "1YSd7HBg23-Cf16tIryOBnwoziN6CTdGZ62oBHALLB7A",
      "4 Bilanz, Gewinn und Steuererklärungen - Version:0055": "1y-EEqtrea6tM4PJf4inRNOqd-SLPCOj8eoQmVvI4X5g",
      "5 SEPA - Lastschriftmandat - Version:0055": "1KMdpZN7uSA6Y4uKCLUNni4Qj_uuDpK6YZIe2u9gXZOU",
      "3 Bankbuchungen zuordnen - Version:0055": "1IbGAv2J7HK5EQOBRtBXRy_tN8OVvsfq6OMsNeUj0XG8",
      "2 Ausgaben erfassen - Version:0055": "181TmgsS7yNbsSAtLZ1Azbz0sK8L4yaEJKG_IGZeO5Zg",
      "1 Rechnung schreiben - Version:0055": "1inJweTS-tp5ow27A5J3lSuQXovhfYFmHIIClpaNtJAs",
      "0 E-Mail verschicken - Version:0055": "1-JFdtpdgbUFJwDLPFwfpxtMXbjlKoysa_X_spynQuSI"
    },
    "0054": {
      "(1) Installationen - Version:0054": "1NZFUya4uKiLkHT1NTjF752igsU7dyrDB9eoDAVlSulM",
      "5 SEPA - Lastschriftmandat - Version:0054": "1UhZKf4WOiGYgwamy6PXNgPl0_hBN0ya2I3g-5qKA6c4",
      "7 Datenschlürfer - Version:0054": "1pB0sggfUhlUUv9jMmnmrBUvvpWqe4qpurUD5_R7esQc",
      "6 Posteingang - Version:0054": "1Drg_tWuuiUcE2Cfjo69xKHQ9onPBE1BwJXdOieZ0uIo",
      "(2) ElsterTransfer - Version:0054": "1woi9QyDt1u3qTQf4gzC7D91QXq4T6chZwq2rGON4mZk",
      "4 Bilanz, Gewinn und Steuererklärungen - Version:0054": "17xUX6aeaUFlfAFWMMZO_rCxu9Lh4kBPhNz-LHHPZnh8",
      "3 Bankbuchungen zuordnen - Version:0054": "1FMzlG37z9Gfu6YNTkEftquwNB6Yudq0hUdoXT4XcUzY",
      "2 Ausgaben erfassen - Version:0054": "1lu4_BoUmfU99NWfH--KXGTsAp5FBrWj1nkiEBz0JAcQ",
      "1 Rechnung schreiben - Version:0054": "1CzIvL3QOGEKI8ZZV2HnUmpi8bjll94ppncJYoS1pr8o",
      "0 E-Mail verschicken - Version:0054": "11a0l-8leXGwwVdki4wCvEWHx6bX4eoNkM58MnGBns9E",
      "(0) Testsysteme - Version:0054": "1DiYUtI_5zT007oGNIZbv4eUovKjbSalV6W6kzf7r66o"
    }
  }
  static oooVersionsRangeFileMap = {
    "0056": {
      RechnungSchreibenD: "1 Rechnung schreiben - Version:0056",
      GutschriftenD: "1 Rechnung schreiben - Version:0056",
      EURechnungenD: "1 Rechnung schreiben - Version:0056",
      KundenD: "1 Rechnung schreiben - Version:0056",
      PositionenarchivD: "1 Rechnung schreiben - Version:0056",
      ProdukteD: "1 Rechnung schreiben - Version:0056",
      RechnungenD: "1 Rechnung schreiben - Version:0056",
      AbschreibungenD: "2 Ausgaben erfassen - Version:0056",
      AusgabenD: "2 Ausgaben erfassen - Version:0056",
      BewirtungsbelegeD: "2 Ausgaben erfassen - Version:0056",
      VerpflegungsmehraufwendungenD: "2 Ausgaben erfassen - Version:0056",
      "VerträgeD": "2 Ausgaben erfassen - Version:0056",
      BankbuchungenD: "3 Bankbuchungen zuordnen - Version:0056",
      UmbuchungenD: "3 Bankbuchungen zuordnen - Version:0056",
      BuchungenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      EÜRD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      KontenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      UStVAD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      CSVExportD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      GdpduD: "7 Datenschlürfer - Version:0056",
      DataFileD: "7 Datenschlürfer - Version:0056",
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
    },
    "0054": {
      EMailIdD: "0 E-Mail verschicken - Version:0054",
      RechnungSchreibenD: "1 Rechnung schreiben - Version:0054",
      GutschriftenD: "1 Rechnung schreiben - Version:0054",
      EURechnungenD: "1 Rechnung schreiben - Version:0054",
      KundenD: "1 Rechnung schreiben - Version:0054",
      PositionenarchivD: "1 Rechnung schreiben - Version:0054",
      ProdukteD: "1 Rechnung schreiben - Version:0054",
      RechnungenD: "1 Rechnung schreiben - Version:0054",
      AbschreibungenD: "2 Ausgaben erfassen - Version:0054",
      AusgabenD: "2 Ausgaben erfassen - Version:0054",
      BewirtungsbelegeD: "2 Ausgaben erfassen - Version:0054",
      VerpflegungsmehraufwendungenD: "2 Ausgaben erfassen - Version:0054",
      "VerträgeD": "2 Ausgaben erfassen - Version:0054",
      BankbuchungenD: "3 Bankbuchungen zuordnen - Version:0054",
      UmbuchungenD: "3 Bankbuchungen zuordnen - Version:0054",
      BuchungenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      EÜRD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      KontenD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      UStVAD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      CSVExportD: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      LastschriftmandatD: "5 SEPA - Lastschriftmandat - Version:0054",
      LastschriftproduktD: "5 SEPA - Lastschriftmandat - Version:0054",
      LastschriftenD: "5 SEPA - Lastschriftmandat - Version:0054",
      InstallationenD: "(1) Installationen - Version:0054",
      ElsterTransferD: "(2) ElsterTransfer - Version:0054",
      PosteingangD: "6 Posteingang - Version:0054",
      GdpduD: "7 Datenschlürfer - Version:0054",
      DataFileD: "7 Datenschlürfer - Version:0054",
      TestsystemeD: "(0) Testsysteme - Version:0054"
    }
  }
  static oooVersionValuesFileMap = {
    "0056": {
      Konfiguration: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
    },
    "0055": {
      Konfiguration: "4 Bilanz, Gewinn und Steuererklärungen - Version:0055",
    },
    "0054": {
      Konfiguration: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
    }
  }
  static oooVersionValueFileMap = {
    "0056": {
      GutschriftenDatei: "1 Rechnung schreiben - Version:0056",
      HilfeRechnungFertigstellen: "1 Rechnung schreiben - Version:0056",
      HilfeRechnungSchreiben: "1 Rechnung schreiben - Version:0056",
      KundenEMailVorlageDoc: "1 Rechnung schreiben - Version:0056",
      Rechnungsnummer: "1 Rechnung schreiben - Version:0056",
      Rechnungsvorlagelink: "1 Rechnung schreiben - Version:0056",
      KundenRechnungsvorlage: "1 Rechnung schreiben - Version:0056",
      KundenStornorechnungsvorlage: "1 Rechnung schreiben - Version:0056",
      EMailID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      EinnahmenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      AusgabenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      BankkontenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056",
      LastschriftenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0056"
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
    },
    "0054": {
      GutschriftenDatei: "1 Rechnung schreiben - Version:0054",
      HilfeRechnungFertigstellen: "1 Rechnung schreiben - Version:0054",
      HilfeRechnungSchreiben: "1 Rechnung schreiben - Version:0054",
      KundenEMailVorlageDoc: "1 Rechnung schreiben - Version:0054",
      Rechnungsnummer: "1 Rechnung schreiben - Version:0054",
      Rechnungsvorlagelink: "1 Rechnung schreiben - Version:0054",
      KundenRechnungsvorlage: "1 Rechnung schreiben - Version:0054",
      KundenStornorechnungsvorlage: "1 Rechnung schreiben - Version:0054",
      EMailID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      EinnahmenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      AusgabenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      BankkontenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054",
      LastschriftenID: "4 Bilanz, Gewinn und Steuererklärungen - Version:0054"
    }
  }
  static getRootId(): string {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName("OfficeRootID").getValue().toString();
  }
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

  static getRangeFileName(rangeName: string, version: string) {
    let fileName = DriveConnector.oooVersionsRangeFileMap[version][rangeName];
    if (fileName === undefined) fileName = DriveConnector.oooVersionValueFileMap[version][rangeName];
    if (fileName === undefined) fileName = DriveConnector.oooVersionValuesFileMap[version][rangeName];
    if (fileName === undefined) throw new Error("Range:" + rangeName + " is not defined in DriveConnector");
    return fileName;
  }
  static getMasterFileID(rangeName: string, version: string) {
    let masterSpreadsheetId = DriveConnector.oooVersionsFileNameIdMap[version][this.getRangeFileName(rangeName, version)]
    if (masterSpreadsheetId === undefined) throw new Error("File for:" + rangeName + " is not defined in DriveConnector");
    return masterSpreadsheetId;
  }
  static getValueByName(rootFolderId: string, rangeName: string, version: string) {
    let value = this.rangeValues[rootFolderId + rangeName];
    if (value === undefined) {
      value = this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).getFormula();
      if (value === "") value = this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).getValue();
      this.rangeValues[rootFolderId + rangeName] = value;
    }
    return value;
  }
  static getValuesByName(rootFolderId: string, rangeName: string, version: string) {
    let values = this.rangeValues[rootFolderId + rangeName];
    if (values === undefined) {
      console.log("driveconnector.getValuesByName:" + rootFolderId + " " + rangeName + " " + version);
      values = this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).getValues();
      this.rangeValues[rootFolderId + rangeName] = values;
    }
    return values;
  }
  static saveValueByName(rootFolderId: string, rangeName: string, version: string, value: any) {
    this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).setValue(value);
    SpreadsheetApp.flush()
  }
  static saveFormulaByName(rootFolderId: string, rangeName: string, version: string, value: any) {
    this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).setFormula(value);
    SpreadsheetApp.flush()
  }
  static saveValuesByName(rootFolderId: string, rangeName: string, version: string, value: any) {
    this.getSpreadsheet(rootFolderId, rangeName, version).getRangeByName(rangeName).setValues(value);
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