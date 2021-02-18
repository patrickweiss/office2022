import { office, ooFolders, ooTables, ooVersions, systemMasterId, systemObject } from "./enums0055";



export class DriveConnector {
    private hostFileId: string;
    private hostTable: ooTables;
    private version: ooVersions;

    private spreadsheetCache: Object = {};
    private tableDataCache: Object = {};
    private ooConfigurationCache: Object = {};
    constructor(hostFileId: string, hostTable: ooTables, version: ooVersions) {
        this.hostFileId = hostFileId;
        this.hostTable = hostTable;
        this.version = version;
    }
    public systemInstalled(): boolean {
        //if there is a system folder, we asume the system is correctly installed ... more checks may be added in future
        return DriveApp.getRootFolder().getFoldersByName(this.getFolderName(ooFolders.system)).hasNext();
    }
    public installSystem() {
        //load hostTable data in tableData Cache
        this.tableDataCache[this.hostTable] = SpreadsheetApp.getActive().getSheetByName(this.getSheetName(this.hostTable)).getDataRange().getValues();

        //correct the name of the hostFile
        DriveApp.getFileById(this.hostFileId).setName(this.getFileName(this.hostTable));

        //create new office folder or search for office folder from version 2021 from eins.stein 

        const officeName = this.getOfficeProperty(office.searchForOffice)
        const officeFolderIterator = DriveApp.getFoldersByName(officeName);
        let officeFolder: GoogleAppsScript.Drive.Folder;
        if (officeFolderIterator.hasNext()) officeFolder = officeFolderIterator.next();
        else officeFolder = getOrCreateFolderIn(DriveApp.getRootFolder(), ooFolders.office);

        //move office Configuration or landing Page ???? in office Folder
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        officeFolder.addFile(installCallFile);
        DriveApp.getRootFolder().removeFile(installCallFile);

        //create system folder
        const systemFolder = getOrCreateFolderIn(DriveApp.getRootFolder(), ooFolders.system);

        //copy system spreadsheet in system folder
        const systemSpreadsheetName = this.getFileName(ooTables.systemConfiguration)
        this.spreadsheetCache[systemSpreadsheetName] = SpreadsheetApp.openById(
            DriveApp
                .getFileById(this.getMasterId(ooTables.systemConfiguration))
                .makeCopy(systemSpreadsheetName, systemFolder).getId()
        )

        //register new office instance in system spreadsheet
        // ...
        this.addOffice(officeFolder.getId());


    }

    public getSheetName(table: ooTables): string { return this.getProperyFromTable(ooTables.systemMasterConfiguration, table + "_TableSheet"); }

    private addOffice(folderId: string) {
        const officeArray: string[] = this.getSystemObject(systemObject.officeArray) as unknown as string[]
        officeArray.push(folderId);
        this.setSystemObject(systemObject.officeArray,officeArray);
    }

    public setSystemObject(systemObject: systemObject, object: Object):void {
        const systemDataTable = this.tableDataCache[ooTables.systemConfiguration] as unknown as any[][]
        const propertyRow = systemDataTable.filter(row => row[0] === systemObject)[0]
        propertyRow[1] = JSON.stringify(object);
        this.getSpreadsheet(ooTables.systemConfiguration)
            .getSheetByName(this.getSheetName(ooTables.systemConfiguration))
            .getDataRange()
            .setValues(systemDataTable);
  }

    private getSpreadsheet(table: ooTables):GoogleAppsScript.Spreadsheet.Spreadsheet {
        const spreadsheet = this.spreadsheetCache[this.getFileName(ooTables.systemConfiguration)] as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
        if (!spreadsheet) {
            throw new Error("implement office spreadsheet caching")
        }
        return spreadsheet;
    }
    public getSystemObject(systemObject: systemObject):Object {
        return JSON.parse(this.getSystemProperty(systemObject));
    }

    public getMasterProperty(name: string) { return this.getProperyFromTable(ooTables.systemMasterConfiguration, name); }
    public getSystemProperty(name: string) { return this.getProperyFromTable(ooTables.systemConfiguration, name); }
    public getOfficeProperty(name: office) { return this.getProperyFromTable(ooTables.officeConfiguration, name); }

    private getValuesCache(table: ooTables) {
        let valuesCache = this.ooConfigurationCache[table];
        if (!valuesCache) {
            const data = this.getTableData(table);
            valuesCache = new ValuesCache(data);
            this.ooConfigurationCache[table] = valuesCache;
        }
        return valuesCache;
    }
    private getProperyFromTable(table: ooTables, propertyName: string): string {
        const property =  this.getValuesCache(table).getValueByName(propertyName);
        if (!property)throw new Error ("Variable missing in Configuration:"+table+" "+propertyName);
        return this.getValuesCache(table).getValueByName(propertyName);
    }
    public getTableData(table: ooTables): any[][] {
        let tableData = this.tableDataCache[table] as unknown as any[][];
        if (!tableData && table === ooTables.systemMasterConfiguration) {
            tableData = SpreadsheetApp.openById(systemMasterId).getSheetByName("Configuration").getDataRange().getValues();
            console.log("getTableData " + table );
            console.log(tableData);
            this.tableDataCache[table] = tableData;
            return tableData
        }
        if (!tableData && table === ooTables.systemConfiguration) {
            console.log("getTableData " + table );
            const sheetName = this.getSheetName(ooTables.systemConfiguration)
            console.log("sheetName "+sheetName);
            const spreadsheet =  this.getSpreadsheet(ooTables.systemConfiguration)
            console.log(spreadsheet.getName());
            tableData =spreadsheet
                .getSheetByName(sheetName)
                .getDataRange().getValues(); 
                console.log("getTableData " + table );
                console.log(tableData);
                this.tableDataCache[table] = tableData;
                return tableData
        }
        if (!tableData) {
            throw new Error("no implementation for " + table);
        }
        return tableData;
    }
    private getFileName(table: ooTables): string {
        const tableFile = this.getMasterProperty(table + "_TableFile");
        const table_FileName = this.getMasterProperty(tableFile + "Name");
        return table_FileName + " - Version:" + this.version;
    }
    private getMasterId(table: ooTables): string {
        const tableFile = this.getMasterProperty(table + "_TableFile");
        const table_FileId = this.getMasterProperty(tableFile + "Id");
        return table_FileId;
    }
    public getFolderName(folder: ooFolders) {
        return folder + " " + this.version;
    }
}

export function deleteSystem() {
    DriveApp.getRootFolder().getFoldersByName(ooFolders.system).next().setTrashed(true);
    DriveApp.getRootFolder().getFoldersByName(ooFolders.office).next().setTrashed(true);
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