import { ooFolders, ooFiles, ooTables, ooVersions, systemTemplateId } from "./enums0055";



export class DriveConnector {
    private hostFileId: string;
    private hostTable:ooTables;
    private version:ooVersions;

    private spreadsheetCache: Object={};
    private tableDataCache: Object={};
    private ooConfigurationCache: Object={};
    constructor(hostFileId: string, hostTable: ooTables,version:ooVersions) {
        this.hostFileId = hostFileId;
        this.hostTable = hostTable;
        this.version = version;
    }
    public systemInstalled(): boolean {
        return DriveApp.getRootFolder().getFoldersByName(this.getFolderName(ooFolders.system)).hasNext();
    }
    public installSystem() {
        //correct the name of the hostFile
        DriveApp.getFileById(this.hostFileId).setName(this.getFileName(this.hostTable));
        const systemFolder = getOrCreateFolderIn(DriveApp.getRootFolder(),ooFolders.system);
        const yearFolder = getOrCreateFolderIn(DriveApp.getRootFolder(),ooFolders.year);
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        systemFolder.addFile(installCallFile);
        DriveApp.getRootFolder().removeFile(installCallFile);
    }
    public getProperyFromTable(table: ooTables, propertyName: string): string {
        console.log("getProperyFromTable"+" "+table+" "+propertyName);
        let propertyData: ValuesCache = this.ooConfigurationCache[table];
        if (!propertyData) {
            const data = this.getTableData(table);
            console.log(data);
            propertyData = new ValuesCache(data);
            console.log(propertyData);
            this.ooConfigurationCache[table] = propertyData;
        }
        const result = propertyData.getValueByName(propertyName);
        console.log(result)
        return result;
    }
    public getTableData(table: ooTables):any[][] {
        let tableData = this.tableDataCache[table];
        if (!tableData) if (table === ooTables.businessConfiguration) {
            const tableData = SpreadsheetApp.openById(systemTemplateId).getSheetByName("TemplateConfiguration").getDataRange().getValues();
            this.tableDataCache[table] = tableData;
            return tableData
        } else {

        }
    }

    private getFileName(table: ooTables): string {
        const tableFile = this.getProperyFromTable(ooTables.businessConfiguration,table+"_TableFile");
        const table_FileName = this.getProperyFromTable(ooTables.businessConfiguration,tableFile+"_Name");
        return this.getProperyFromTable(ooTables.businessConfiguration, table_FileName)+" - Version:"+this.version;
    }
    public getFolderName(folder:ooFolders){
        return folder+" "+this.version;
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