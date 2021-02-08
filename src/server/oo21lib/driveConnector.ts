import { ooFolders, ooFiles, ooTables, ooVersion, systemTemplateId } from "./enums0001";



export class DriveConnector {
    private hostFileId: string;
    private hostFile: ooFiles;
    private spreadsheetCache: Object={};
    private tableDataCache: Object={};
    private propertyDataCache: Object={};
    constructor(hostFileId: string, hostFile: ooFiles) {
        this.hostFileId = hostFileId;
        this.hostFile = hostFile;
    }
    public systemInstalled(): boolean {
        return DriveApp.getRootFolder().getFoldersByName(ooFolders.system).hasNext();
    }
    public installSystem() {
        //correct the name of the hostFile
        DriveApp.getFileById(this.hostFileId).setName(this.getFileName(this.hostFile));
        const systemFolder = getOrCreateFolderIn(DriveApp.getRootFolder(),ooFolders.system);
        const yearFolder = getOrCreateFolderIn(DriveApp.getRootFolder(),ooFolders.year);
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        systemFolder.addFile(installCallFile);
        DriveApp.getRootFolder().removeFile(installCallFile);
    }
    public getProperyFromTable(table: ooTables, propertyName: string): string {
        console.log("getProperyFromTable"+" "+table+" "+propertyName);
        let propertyData: ValuesCache = this.propertyDataCache[table];
        if (!propertyData) {
            const data = this.getTableData(table);
            console.log(data);
            propertyData = new ValuesCache(data);
            console.log(propertyData);
            this.propertyDataCache[table] = propertyData;
        }
        return propertyData.getValueByName(propertyName);
    }
    public getTableData(table: ooTables):any[][] {
        let tableData = this.tableDataCache[table];
        if (!tableData) if (table === ooTables.SystemConfiguration) {
            const tableData = SpreadsheetApp.openById(systemTemplateId).getSheetByName("TemplateConfiguration").getDataRange().getValues();
            this.tableDataCache[table] = tableData;
            return tableData
        } else {

        }
    }
    private getFileName(file: ooFiles): string {
        return this.getProperyFromTable(ooTables.SystemConfiguration, file)+" - Version:"+ooVersion;

    }
}





export function deleteSystem() {
    DriveApp.getRootFolder().getFoldersByName(ooFolders.system).next().setTrashed(true);
    DriveApp.getRootFolder().getFoldersByName(ooFolders.year).next().setTrashed(true);
}

function getOrCreateFolderIn(inFolder: GoogleAppsScript.Drive.Folder, returnFolderName: ooFolders) {
    const folderIterator = inFolder.getFoldersByName(returnFolderName);
    if (folderIterator.hasNext()) return folderIterator.next();
    return inFolder.createFolder(returnFolderName);
}

class ValuesCache {
    dataArray: any[][];
    dataHash = {};
    constructor(data: any[][]) {
        this.dataArray = data;
        for (let row of this.dataArray) {
            this.dataHash[row[0]] = row[1];
        }
    }
    public getValueByName(name: string) {
        return this.dataHash[name];
    }
}