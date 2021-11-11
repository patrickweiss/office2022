import { copyFolder } from "../oo21lib/driveConnector";
import { adminUser, clientSystemMasterId, currentOOversion, office, ooFolders, ooTables, ServerFunction, subscribeRestEndpoint, systemMasterProperty } from "../oo21lib/systemEnums";
import { getOrCreateFolder } from "./directDriveConnector";
import { DriveConnector } from "./driveconnector";

export function installNewInstance(name:string) {
  
    var foldersHash = {};
    let result = {
      serverFunction: ServerFunction.installNewInstance,
      foldersHash: foldersHash,
      newFolderId:""
    };
  
    const officeFolder = copyFolder(
      systemMasterProperty.officeOne2022_TemplateFolderId,
      DriveApp.getRootFolder().getId(),
      currentOOversion,
      currentOOversion
    )
    if (name)officeFolder.setName(name);
    officeFolder.addEditor(adminUser);
    const officeRootId = officeFolder.getId();
    
    //So früh wie möglich den neuen Ordner in die Subscription Tabelle eintragen, damit wenn später was schief geht eins.stein@officeone.team helfen kann
    UrlFetchApp.fetch(subscribeRestEndpoint + "?folderId=" + officeRootId +
    "&email=" + Session.getActiveUser().getEmail() +
    "&product=OfficeOne&version="+currentOOversion);
  
    DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.RechnungenD, currentOOversion);
    DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.AusgabenD, currentOOversion);
    DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.DataFileD, currentOOversion);
    DriveConnector.saveRootIdtoSpreadsheet(officeRootId, ooTables.Konfiguration, currentOOversion);
  
    //00 System update
    const systemFolder = getOrCreateFolder(DriveApp.getRootFolder(), ooFolders.system);
    systemFolder.addEditor(adminUser);
    const systemSpreadsheetName = ooFolders.system + " - " + ooFolders.version + currentOOversion
    const ssIterator = systemFolder.getFiles();
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
    result.newFolderId=officeRootId;
   
    let response = UrlFetchApp.fetch(subscribeRestEndpoint + "?folderId=" + officeRootId +
    "&email=" + Session.getActiveUser().getEmail() +
    "&product=OfficeOne&version="+currentOOversion);
  
    return JSON.stringify(result);
  }
  