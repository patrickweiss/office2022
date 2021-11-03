import { copyFolder } from "../oo21lib/driveConnector";
import { adminUser, clientSystemMasterId, currentOOversion,ooFolders, ooTables, ooVersions, ServerFunction, subscribeRestEndpoint, systemMasterProperty } from "../oo21lib/systemEnums";
import { DriveConnector } from "./driveconnector";

//oo21lib stuff
//import * as oo22 from "../oo21lib/driveConnector";



export function getOrCreateOfficeOneFolders() {
  var foldersHash = {};
  let result = {
    serverFunction: ServerFunction.getOrCreateOfficeOneFolders,
    foldersHash: foldersHash,
    triggers:"kein Status"
  };
  //is funktion invoked from within an office one spreadheet?

  try {
    //Look for root folder if invoked by Spreadsheet
    const location: any[][] = SpreadsheetApp.getActive().getRangeByName("OfficeRootID").getValues();
    const ooFolderId = location[0][0]
    const leaf = location[0][1];
    const folder = DriveApp.getFolderById(ooFolderId);
    const version = folder.getName().slice(-4);
    foldersHash[ooFolderId] = { name: folder.getName().slice(0, -5), version: version, leaf: leaf };
  } catch (e) {
    //look for FolderIds in 00 System folder configuration spreadsheet
    const folderIds = getSystemFolderIds();
    console.log(folderIds)
    if (folderIds) {
      for (let ooFolderId of folderIds) {
        console.log(ooFolderId);
        const folder = DriveApp.getFolderById(ooFolderId);
        const version = folder.getName().slice(-4);
        foldersHash[ooFolderId] = { name: folder.getName().slice(0, -5), version: version, leaf: "" };
      }
    }
  }
  //Read Trigger Status for eins.stein@officeone.team KIBAR Status
  result.triggers = ScriptApp.getProjectTriggers().length.toString();
 
  return JSON.stringify(result);
}

export function getSystemFolderIds(): Array<string> {
  const ooSystemFolderIterator = DriveApp.getRootFolder().getFoldersByName(ooFolders.system)
  if (ooSystemFolderIterator.hasNext()) {
    const ooSystemFolder = ooSystemFolderIterator.next();
    const ssIterator = ooSystemFolder.getFiles();
    if (ssIterator.hasNext()) {
      //System ist schon installiert, Rootfolder Ids zurückgeben
      const sheetValue = SpreadsheetApp.openById(ssIterator.next().getId()).getActiveSheet().getRange("B2").getValue().toString()
      return JSON.parse(sheetValue) as Array<string>;
    } else {
      throw new Error(Session.getActiveUser().getEmail() + " keine systemIds gefunden in rootID:" + DriveApp.getRootFolder().getId())
    }
  }
}

//Hier wird immer eine neue Instanz installiert. Funktionsname passt nicht mehr. 
export function getOrCreateRootFolder(ooRootFolderLabel: string, ooRootFolderVersion: string) {
  console.log("System installieren")
  // const ooRoot = DriveApp.getRootFolder().createFolder(ooFolders.office + " " + currentOOversion);
  var foldersHash = {};
  let result = {
    serverFunction: ServerFunction.getOrCreateRootFolder,
    foldersHash: foldersHash
  };

  const officeFolder = copyFolder(
    systemMasterProperty.officeOne2022_TemplateFolderId,
    DriveApp.getRootFolder().getId(),
    currentOOversion,
    currentOOversion
  )
  officeFolder.addEditor(adminUser);
  const officeRootId = officeFolder.getId()
  DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.RechnungenD, currentOOversion);
  DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.AusgabenD, currentOOversion);
  DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.DataFileD, currentOOversion);
  DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.Konfiguration, currentOOversion);

  //00 System update
  const systemFolder = getOrCreateFolder(DriveApp.getRootFolder(), ooFolders.system);
  systemFolder.addEditor(adminUser);
  const systemSpreadsheetName = ooFolders.system + " - " + ooFolders.version + currentOOversion
  const ssIterator = systemFolder.getFilesByName(systemSpreadsheetName);
  if (ssIterator.hasNext()) {
    //add office folder id to array
    const systemSpreadsheet = SpreadsheetApp.openById(ssIterator.next().getId());
    const rootfolders = JSON.parse(systemSpreadsheet.getActiveSheet().getRange("B2").getValue().toString()) as Array<string>;
    rootfolders.push(officeRootId);
    systemSpreadsheet.getActiveSheet().getRange("B2").setValue(JSON.stringify(rootfolders));
  } else {
    //create new spreadsheet and add office folder to array
    const newSystemId = DriveApp.getFileById(clientSystemMasterId).makeCopy(ooFolders.system + " - " + ooFolders.version + currentOOversion, systemFolder).getId();
    const systemSpreadsheet = SpreadsheetApp.openById(newSystemId)
    systemSpreadsheet.getActiveSheet().getRange("B2").setValue(JSON.stringify([officeRootId]));
  }


  const folder = officeFolder;
  const version = folder.getName().slice(-4);
  foldersHash[officeRootId] = { name: folder.getName().slice(0, -5), version: version, leaf: "" };
 
  let response = UrlFetchApp.fetch(subscribeRestEndpoint + "?folderId=" + officeRootId +
  "&email=" + Session.getActiveUser().getEmail() +
  "&product=OfficeOne&version="+currentOOversion);

  return JSON.stringify(result);
}

export function getOrCreateAusgabenFolder(rootFolderId) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var ausgabenFolder = getOrCreateFolder(rootFolder, "2 Ausgaben");
  var result = {
    serverFunction: ServerFunction.getOrCreateAusgabenFolder,
    ausgabenFolder: {
      '01': getOrCreateFolder(ausgabenFolder, '(01) Januar').getId(),
      '02': getOrCreateFolder(ausgabenFolder, '(02) Februar').getId(),
      '03': getOrCreateFolder(ausgabenFolder, '(03) März').getId(),
      '04': getOrCreateFolder(ausgabenFolder, '(04) April').getId(),
      '05': getOrCreateFolder(ausgabenFolder, '(05) Mai').getId(),
      '06': getOrCreateFolder(ausgabenFolder, '(06) Juni').getId(),
      '07': getOrCreateFolder(ausgabenFolder, '(07) Juli').getId(),
      '08': getOrCreateFolder(ausgabenFolder, '(08) August').getId(),
      '09': getOrCreateFolder(ausgabenFolder, '(09) September').getId(),
      '10': getOrCreateFolder(ausgabenFolder, '(10) Oktober').getId(),
      '11': getOrCreateFolder(ausgabenFolder, '(11) November').getId(),
      '12': getOrCreateFolder(ausgabenFolder, '(12) Dezember').getId()
    }
  };
  return JSON.stringify(result);
}
export function getOrCreateGutschriftenFolder(rootFolderId) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var einnahmenFolder = getOrCreateFolder(rootFolder, "1 Einnahmen");
  var gutschriftenFolder = getOrCreateFolder(einnahmenFolder, "4 Gutschriften");
  var result = {
    serverFunction: ServerFunction.getOrCreateGutschriftenFolder,
    gutschriftenFolder: {
      '01': getOrCreateFolder(gutschriftenFolder, '(01) Januar').getId(),
      '02': getOrCreateFolder(gutschriftenFolder, '(02) Februar').getId(),
      '03': getOrCreateFolder(gutschriftenFolder, '(03) März').getId(),
      '04': getOrCreateFolder(gutschriftenFolder, '(04) April').getId(),
      '05': getOrCreateFolder(gutschriftenFolder, '(05) Mai').getId(),
      '06': getOrCreateFolder(gutschriftenFolder, '(06) Juni').getId(),
      '07': getOrCreateFolder(gutschriftenFolder, '(07) Juli').getId(),
      '08': getOrCreateFolder(gutschriftenFolder, '(08) August').getId(),
      '09': getOrCreateFolder(gutschriftenFolder, '(09) September').getId(),
      '10': getOrCreateFolder(gutschriftenFolder, '(10) Oktober').getId(),
      '11': getOrCreateFolder(gutschriftenFolder, '(11) November').getId(),
      '12': getOrCreateFolder(gutschriftenFolder, '(12) Dezember').getId()
    }
  };
  return JSON.stringify(result);
}

export function getNamedRangeData(rootFolderId, rangeName, version) {

  var result = {
    serverFunction: ServerFunction.getNamedRangeData,
    rangeName: rangeName,
    namedRangeData: DriveConnector.getNamedRangeData(rootFolderId, rangeName, version)
  }
  return JSON.stringify(result);
}
export function getSpreadsheetIdbyFolderIdAndName(rootFolderId, spreadsheetName) {
  var spreadsheetId = DriveApp.getFolderById(rootFolderId).getFilesByName(spreadsheetName).next().getId();
  var result = {
    serverFunction: ServerFunction.getSpreadsheetIdbyFolderIdAndName,
    id: spreadsheetId,
    name: spreadsheetName
  }
  return JSON.stringify(result);
}

export function getOrCreateFolder(rootFolder: GoogleAppsScript.Drive.Folder, folderName: string): GoogleAppsScript.Drive.Folder {
  var folderIterator = rootFolder.getFoldersByName(folderName);
  if (folderIterator.hasNext()) return folderIterator.next();
  else return rootFolder.createFolder(folderName);
}




