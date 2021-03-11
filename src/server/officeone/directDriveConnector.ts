import { BusinessModel } from "../../client/office-one-2021/bm/BusinessModel";
import { currentOOversion, office, ooFolders, ooTables, ooVersions } from "../oo21lib/systemEnums";
import { DriveConnector, oooVersion } from "./driveconnector";
import { ServerFunction } from "./enums";

//oo21lib stuff
import * as oo22 from "../oo21lib/driveConnector";



export function getOrCreateOfficeOneFolders() {
  var foldersHash = {};
  let result = {
    serverFunction: ServerFunction.getOrCreateOfficeOneFolders,
    foldersArray: foldersHash
  };
  //is funktion invoked from within an office one spreadheet?

  try {
    //Look for folders in GDrive root if function is invoked by WebApp
    const location: any[][] = SpreadsheetApp.getActive().getRangeByName("OfficeRootID").getValues();
    const ooFolderId = location[0][0]
    const leaf = location[0][1];
    const folder = DriveApp.getFolderById(ooFolderId);
    const version = folder.getName().slice(-4);
    foldersHash[ooFolderId] = { name: folder.getName().slice(0, -5), version: version, leaf: leaf };
  } catch (e) {
    console.log(e);
    //Funktion wurde von WebApp aufgerufen
    const ooSystemFolderIterator = DriveApp.getFoldersByName(ooFolders.system)
    if (ooSystemFolderIterator.hasNext()) {
      const ooSystemFolder = ooSystemFolderIterator.next();
      const systemSpreadsheetName = ooFolders.system + " - " + ooFolders.version + currentOOversion
      console.log(systemSpreadsheetName);
      const ssIterator = ooSystemFolder.getFilesByName(systemSpreadsheetName);
      if (ssIterator.hasNext()) {
        //System ist schon installiert, Rootfolder Ids zurückgeben
        const sheetValue = SpreadsheetApp.openById(ssIterator.next().getId()).getActiveSheet().getRange("B2").getValue().toString()
        console.log(sheetValue);
        const folderIds = JSON.parse(sheetValue) as Array<string>;
        console.log(folderIds)
        for (let ooFolderId of folderIds) {
          console.log(ooFolderId);
          const folder = DriveApp.getFolderById(ooFolderId);
          const version = folder.getName().slice(-4);
          foldersHash[ooFolderId] = { name: folder.getName().slice(0, -5), version: version, leaf: "" };

        }
      } else {/*

      console.log("System installieren")
      const ooRoot = DriveApp.getRootFolder().createFolder(ooFolders.office+" "+currentOOversion);
      const oo22dv = new oo22.DriveConnector(ooRoot.getId(),ooTables.officeConfiguration,currentOOversion);
      oo22dv.installSystem();
      const ooFolderId = oo22dv.officeFolder.getId();
      const folder = DriveApp.getFolderById(ooFolderId);
      const version = folder.getName().slice(-4);
      foldersHash[ooFolderId] = { name: folder.getName().slice(0, -5), version: version, leaf: "" };
      */
      }
    }

  }
  console.log(JSON.stringify(result));
  return JSON.stringify(result);
}

export function getOrCreateRootFolder(ooRootFolderLabel:string, ooRootFolderVersion:string) {
  console.log("System installieren")
 // const ooRoot = DriveApp.getRootFolder().createFolder(ooFolders.office + " " + currentOOversion);
  const oo22dv = new oo22.DriveConnector("", ooTables.officeConfiguration, currentOOversion);
  oo22dv.installFromWebApp();
  const ooFolderId = oo22dv.officeFolder.getId();
  const newOOsystemId = DriveApp.getFolderById(ooFolderId).getFilesByName(oo22dv.getFileName(ooTables.officeConfiguration)).next().getId();
  const oo22dvFromOwnOOInstance = new oo22.DriveConnector(newOOsystemId,ooTables.officeConfiguration,currentOOversion);
  oo22dvFromOwnOOInstance.systemInstalled()
  oo22dvFromOwnOOInstance.setOfficeProperty(office.officeRootID_FolderId,ooFolderId);

  var result = {
    serverFunction: ServerFunction.getOrCreateRootFolder,
    id: ooFolderId,
    name: oo22dv.officeFolder.getName()
  }
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




