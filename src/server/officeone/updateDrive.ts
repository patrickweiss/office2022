import { TableCache, TableRow } from "../../officeone/BusinessDataFacade";
import { currentOOversion, ooTables, subscribeRestEndpoint } from "../oo21lib/systemEnums";
import { getOrCreateFolder, getOrCreateOfficeOneFolders } from "./directDriveConnector";
import { DriveConnector } from "./driveconnector";
import { ServerFunction } from "../oo21lib/systemEnums";
import { installTrigger } from "../oo21lib/systemFunction";

export function getPreviousVersion() {
  let oooPreviousVersion = (parseInt(currentOOversion, 10) - 1).toString();
  let nix = "";
  for (let nullen = 0; nullen < 4 - oooPreviousVersion.length; nullen++) {
    nix += "0";
  }
  oooPreviousVersion = nix + oooPreviousVersion;
  return oooPreviousVersion;
}

export function updateDriveMaster(rootFolderId: string) {
  let oooPreviousVersion = getPreviousVersion();

  //copy DataTable Data
  for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[oooPreviousVersion])) {
    if (rangeName === ooTables.ElsterTransferD || rangeName === ooTables.InstallationenD) {
      const dataOldVersion = DriveConnector.getNamedRangeData(rootFolderId, rangeName, oooPreviousVersion);
      const dataNewVersion = DriveConnector.getNamedRangeData(rootFolderId, rangeName, currentOOversion);
      //Wenn die neue Tabelle mehr Spalten hat, dann werden die Daten spaltenweise kopiert
      if (dataOldVersion[0][0].length === dataNewVersion[0][0].length) DriveConnector.saveNamedRangeData(rootFolderId, rangeName, dataNewVersion[0].length, dataOldVersion[0], dataOldVersion[1], dataOldVersion[2], currentOOversion);
      else importToBiggerTable(dataOldVersion, rootFolderId, rangeName);
    }
  }
  //read from all Tables from new version to make sure all new Spreadsheets get copied
  for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[currentOOversion])) {
    if (rangeName === ooTables.ElsterTransferD || rangeName === ooTables.InstallationenD) {
      DriveConnector.getNamedRangeData(rootFolderId, rangeName, currentOOversion);
    }
  }
}

export function updateDrive(rootFolderId: string) {

  let oooPreviousVersion = getPreviousVersion();

  //copy DataTable Data
  for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[oooPreviousVersion])) {
    if (rangeName !== ooTables.ElsterTransferD && rangeName !== ooTables.InstallationenD) {
      const dataOldVersion = DriveConnector.getNamedRangeData(rootFolderId, rangeName as ooTables, oooPreviousVersion);
      const dataNewVersion = DriveConnector.getNamedRangeData(rootFolderId, rangeName as ooTables, currentOOversion);
      //Wenn die neue Tabelle mehr Spalten hat, dann werden die Daten spaltenweise kopiert
      if (dataOldVersion[0][0].length === dataNewVersion[0][0].length) DriveConnector.saveNamedRangeData(rootFolderId, rangeName as ooTables, dataNewVersion[0].length, dataOldVersion[0], dataOldVersion[1], dataOldVersion[2], currentOOversion);
      else importToBiggerTable(dataOldVersion, rootFolderId, rangeName as ooTables);
    }
  }
  //read from all Tables from new version to make sure all new Spreadsheets get copied
  for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[currentOOversion])) {
    if (rangeName !== ooTables.ElsterTransferD && rangeName !== ooTables.InstallationenD) {
      DriveConnector.getNamedRangeData(rootFolderId, rangeName as ooTables, currentOOversion);
    }
  }

  //copy value Data, except IDs of new spreadsheets!!!: 
  for (let valueName of Object.keys(DriveConnector.oooVersionValueFileMap[oooPreviousVersion])) {
    try {
      const dataOldVersion = DriveConnector.getValueByName(rootFolderId, valueName as ooTables, oooPreviousVersion);
      DriveConnector.saveValueByName(rootFolderId, valueName as ooTables, currentOOversion, dataOldVersion)
    } catch (e) {
      console.log(valueName);
      throw e;
    }
  }

  //alte Tabellen in Archivordner verschieben
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const archivRoot = getOrCreateFolder(rootFolder, "9 Archiv")
  const archiv = getOrCreateFolder(archivRoot, "Version:" + oooPreviousVersion);

  try {

    const eMailSpreadsheet = rootFolder.getFilesByName("0 E-Mail verschicken - Version:" + oooPreviousVersion).next();
    archiv.addFile(eMailSpreadsheet);
    rootFolder.removeFile(eMailSpreadsheet);


    const lastschriftSpreadsheet = rootFolder.getFilesByName("5 SEPA - Lastschriftmandat - Version:" + oooPreviousVersion).next();
    archiv.addFile(lastschriftSpreadsheet);
    rootFolder.removeFile(lastschriftSpreadsheet);

    const posteingangSpreadsheet = rootFolder.getFilesByName("6 Posteingang - Version:" + oooPreviousVersion).next();
    archiv.addFile(posteingangSpreadsheet);
    rootFolder.removeFile(posteingangSpreadsheet);


    const installationenSpreadsheet = rootFolder.getFilesByName("(1) Installationen - Version:" + oooPreviousVersion).next();
    archiv.addFile(installationenSpreadsheet);
    rootFolder.removeFile(installationenSpreadsheet);

    const elsterSpreadsheet = rootFolder.getFilesByName("(2) ElsterTransfer - Version:" + oooPreviousVersion).next();
    archiv.addFile(elsterSpreadsheet);
    rootFolder.removeFile(elsterSpreadsheet);

  } catch (e) {

  }


  const officeSpreadsheet = rootFolder.getFilesByName("00 Office - Version:" + oooPreviousVersion).next();
  archiv.addFile(officeSpreadsheet);
  rootFolder.removeFile(officeSpreadsheet);

  const einnahmenSpreadsheet = rootFolder.getFilesByName("1 Rechnung schreiben - Version:" + oooPreviousVersion).next();
  archiv.addFile(einnahmenSpreadsheet);
  rootFolder.removeFile(einnahmenSpreadsheet);

  const ausgabenSpreadsheet = rootFolder.getFilesByName("2 Ausgaben erfassen - Version:" + oooPreviousVersion).next();
  archiv.addFile(ausgabenSpreadsheet);
  rootFolder.removeFile(ausgabenSpreadsheet);

  const bankSpreadsheet = rootFolder.getFilesByName("3 Bankbuchungen zuordnen - Version:" + oooPreviousVersion).next();
  archiv.addFile(bankSpreadsheet);
  rootFolder.removeFile(bankSpreadsheet);

  const bilanzSpreadsheet = rootFolder.getFilesByName("4 Bilanz, Gewinn und Steuererklärungen - Version:" + oooPreviousVersion).next();
  archiv.addFile(bilanzSpreadsheet);
  rootFolder.removeFile(bilanzSpreadsheet);

  const datenschluerferSpreadsheet = rootFolder.getFilesByName("7 Datenschlürfer - Version:" + oooPreviousVersion).next();
  archiv.addFile(datenschluerferSpreadsheet);
  rootFolder.removeFile(datenschluerferSpreadsheet);

  let oldOfficeRootFolderName = rootFolder.getName();
  let newOfficeRootFolderName = oldOfficeRootFolderName.slice(0, -4) + currentOOversion;
  rootFolder.setName(newOfficeRootFolderName);

  //if the folder is linked into the users drive by shortcut, we need to update the name of the shortcut in "MyDrive"
  var shortcutIterator = DriveApp.getRootFolder().getFilesByType("application/vnd.google-apps.shortcut");
  while (shortcutIterator.hasNext()) {
    let sharedOfficeShortcut = shortcutIterator.next();
    if (sharedOfficeShortcut.getName().toString() === oldOfficeRootFolderName) {
      sharedOfficeShortcut.setName(newOfficeRootFolderName);
      var foldersHash = {};
      const version = newOfficeRootFolderName.slice(-4);
      foldersHash[rootFolder.getId()] = { name: newOfficeRootFolderName.slice(0, -5), version: version };
      var result = {
        serverFunction: ServerFunction.getOrCreateOfficeOneFolders,
        foldersArray: foldersHash
      }
      return JSON.stringify(result);
    }
  }

  installTrigger();
  try {
    let response = UrlFetchApp.fetch(subscribeRestEndpoint + "?folderId=" + rootFolderId +
      "&email=" + Session.getActiveUser().getEmail() +
      "&product=OfficeOne&version=" + currentOOversion);

    console.log(response)
  } catch (e) {
    console.log(e)
  }

  return getOrCreateOfficeOneFolders();

}



function importToBiggerTable(dataOldVersion: any[][][], rootFolderId: string, rangeName: ooTables) {
  const data: any[][] = dataOldVersion[0];
  const background: any[][] = dataOldVersion[1];
  const fomulas: any[][] = dataOldVersion[2];

  const tableColumnNames: string[] = data[0] as string[];

  const genericTableCache = new TableCache<TableRow>(rootFolderId, rangeName);
  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const newTableRow = genericTableCache.createNewRow();
    for (let columIndex = 0; columIndex < tableColumnNames.length; columIndex++) {
      newTableRow.setValue(tableColumnNames[columIndex], data[rowIndex][columIndex]);
      newTableRow.setFormula(tableColumnNames[columIndex], fomulas[rowIndex][columIndex]);
      newTableRow.setBackground(tableColumnNames[columIndex], background[rowIndex][columIndex]);
    }
  }
  genericTableCache.save();
}
