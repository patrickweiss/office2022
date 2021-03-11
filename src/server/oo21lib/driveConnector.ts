import { adminUser, clientSystemMasterId, currentOOversion, office, ooFolders, ooTables, ooVersions, ranges, systemMasterId, systemMasterProperty, systemObject } from "./systemEnums";



export class DriveConnector {
    private hostFileId: string;
    public hostTable: ooTables;
    private version: ooVersions;
    public officeFolder: GoogleAppsScript.Drive.Folder;

    private spreadsheetCache: Object = {};
    private tableDataCache: Object = {};
    private ooConfigurationCache: Object = {};
    constructor(hostFileId: string, hostTable: ooTables, version: ooVersions) {
        this.hostFileId = hostFileId;
        this.hostTable = hostTable;
        this.version = version;
    }
    public systemInstalled(): boolean {
        //if the host file is named like the master file, we assume the system is correctly installed
        const hostSpreadsheetName = this.getFileName(this.hostTable);
        if (hostSpreadsheetName !== DriveApp.getFileById(this.hostFileId).getName()) {
            return false;
        }
        //intialize office folder
        const officeFolderIterator = DriveApp.getFileById(this.hostFileId).getParents();
        if (officeFolderIterator.hasNext())
            this.officeFolder = officeFolderIterator.next();
        else
            // if there is no file with this id, then the id must be officeFolderId
            this.officeFolder = DriveApp.getFolderById(this.hostFileId);
        //this can go into 
        //this.getTableData ---------------------------------------------------------------------------------
        const spreadsheetFileIterator = this.officeFolder.getFilesByName(hostSpreadsheetName);
        //if there is no spreadsheet, we'll copy it from the master
        if (spreadsheetFileIterator.hasNext) {
            this.spreadsheetCache[hostSpreadsheetName] = SpreadsheetApp.openById(
                spreadsheetFileIterator.next().getId()
            )
        } else {
            this.spreadsheetCache[hostSpreadsheetName] = SpreadsheetApp.openById(
                DriveApp
                    .getFileById(this.getMasterId(this.hostTable))
                    .makeCopy(hostSpreadsheetName, this.officeFolder).getId()
            )
            this.hostFileId = (this.spreadsheetCache[hostSpreadsheetName] as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet).getId()
        }
        //load data from host file
        this.tableDataCache[this.hostTable] = this.spreadsheetCache[hostSpreadsheetName].getSheetByName(this.getSheetName(this.hostTable)).getDataRange().getValues()
        //---------------------------------------------------------------------------------------------------
        return true;
    }
    public installFromWebApp() {
        this.officeFolder = copyFolder(
            this.getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId),
            DriveApp.getRootFolder().getId(),
            currentOOversion,
            currentOOversion
        )
        this.officeFolder.addEditor(adminUser);
        this.setupSystemFolderAndRootIds()
    }
    public installFromSpreadsheetCopy() {
        //load hostTable data in tableData Cache
        this.tableDataCache[this.hostTable] = SpreadsheetApp.getActive().getSheetByName(this.getSheetName(this.hostTable)).getDataRange().getValues();
        if (this.getOfficeProperty(office.importFrom2021_FolderId) === "") {
            //copy System Master
            this.officeFolder = copyFolder(
                this.getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId),
                DriveApp.getRootFolder().getId(),
                currentOOversion,
                currentOOversion
            )
            // delete the copy of the hostfile
            this.officeFolder.getFilesByName(this.getFileName(this.hostTable)).next().setTrashed(true);
            // name the office folder according to naming convention
            this.officeFolder.setName(
                this.getOfficeProperty(office.geschaeftsjahr) + " " +
                this.getOfficeProperty(office.firma) + ".Office " +
                currentOOversion)
        } else {
            //copy oo2021 0055 version into new folder
            this.officeFolder = copyFolder(
                this.getOfficeProperty(office.importFrom2021_FolderId),
                DriveApp.getRootFolder().getId(),
                ooVersions.oo55,
                ooVersions.oo55
            )
        }
        //move office Configuration or landing Page ???? in office Folder
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        this.officeFolder.addFile(installCallFile);
        DriveApp.getRootFolder().removeFile(installCallFile);
        //correct the name of the hostFile
        DriveApp.getFileById(this.hostFileId).setName(this.getFileName(this.hostTable));
        this.setupSystemFolderAndRootIds()
    }
    private setupSystemFolderAndRootIds() {
        //rootID in "1 Rechnung"
        const rechnungenSpreadsheet = SpreadsheetApp.openById(this.officeFolder.getFilesByName(this.getFileName(ooTables.rechnungen)).next().getId());
        rechnungenSpreadsheet.getRangeByName(ranges.OfficeRootID).getCell(1,1).setValue(this.officeFolder.getId());
        const ausgabenSpreadsheet = SpreadsheetApp.openById(this.officeFolder.getFilesByName(this.getFileName(ooTables.ausgaben)).next().getId());
        ausgabenSpreadsheet.getRangeByName(ranges.OfficeRootID).getCell(1,1).setValue(this.officeFolder.getId());
        const datenSchluerfer =  SpreadsheetApp.openById(this.officeFolder.getFilesByName(this.getFileName(ooTables.gdpdu)).next().getId());
        datenSchluerfer.getRangeByName(ranges.OfficeRootID).getCell(1,1).setValue(this.officeFolder.getId());
        //00 System update
        const systemFolder = getOrCreateFolder(DriveApp.getRootFolder(), ooFolders.system);
        systemFolder.addEditor(adminUser);
        const systemSpreadsheetName = ooFolders.system + " - " + ooFolders.version + currentOOversion
        const ssIterator = systemFolder.getFilesByName(systemSpreadsheetName);
        if (ssIterator.hasNext()) {
            //add office folder id to array
            const systemSpreadsheet = SpreadsheetApp.openById(ssIterator.next().getId());
            const rootfolders = JSON.parse(systemSpreadsheet.getActiveSheet().getRange("B2").getValue().toString()) as Array<string>;
            rootfolders.push(this.officeFolder.getId());
            systemSpreadsheet.getActiveSheet().getRange("B2").setValue(JSON.stringify(rootfolders));
        } else {
            //create new spreadsheet and add office folder to array
            const newSystemId = DriveApp.getFileById(clientSystemMasterId).makeCopy(ooFolders.system + " - " + ooFolders.version + currentOOversion, systemFolder).getId();
            const systemSpreadsheet = SpreadsheetApp.openById(newSystemId)
            systemSpreadsheet.getActiveSheet().getRange("B2").setValue(JSON.stringify([this.officeFolder.getId()]));
        }
    }
    public getSheetName(table: ooTables): string { return this.getPropertyFromTable(ooTables.systemMasterConfiguration, table + "_TableSheet"); }
    public setOfficeObject(systemObject: systemObject, object: Object): void {
        const systemDataTable = this.tableDataCache[ooTables.officeConfiguration] as unknown as any[][]
        const propertyRow = systemDataTable.filter(row => row[0] === systemObject)[0]
        propertyRow[1] = JSON.stringify(object);
        this.getSpreadsheet(ooTables.officeConfiguration)
            .getSheetByName(this.getSheetName(ooTables.officeConfiguration))
            .getDataRange()
            .setValues(systemDataTable);
        SpreadsheetApp.flush()
    }
    public setOfficeProperty(officeProperty: office, value: string): void {
        const officeDataTable = this.tableDataCache[ooTables.officeConfiguration] as unknown as any[][]
        const propertyRow = officeDataTable.filter(row => row[0] === officeProperty)[0]
        propertyRow[1] = value;
        this.getSpreadsheet(ooTables.officeConfiguration)
            .getSheetByName(this.getSheetName(ooTables.officeConfiguration))
            .getDataRange()
            .setValues(officeDataTable);
        SpreadsheetApp.flush()
    }
    private getSpreadsheet(table: ooTables): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const spreadsheet = this.spreadsheetCache[this.getFileName(table)] as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
        if (!spreadsheet) {
            throw new Error("implement office spreadsheet caching for " + this.getFileName(table));
        }
        return spreadsheet;
    }
    public getOfficeObject(officeObject: office): Object {
        return JSON.parse(this.getOfficeProperty(officeObject));
    }
    public getMasterProperty(name: systemMasterProperty | string) { return this.getPropertyFromTable(ooTables.systemMasterConfiguration, name); }
    public getOfficeProperty(name: office) { return this.getPropertyFromTable(ooTables.officeConfiguration, name); }
    private getValuesCache(table: ooTables) {
        let valuesCache = this.ooConfigurationCache[table];
        if (!valuesCache) {
            const data = this.getTableData(table);
            valuesCache = new ValuesCache(data);
            this.ooConfigurationCache[table] = valuesCache;
        }
        return valuesCache;
    }
    private getPropertyFromTable(table: ooTables, propertyName: string): string {
        const property = this.getValuesCache(table).getValueByName(propertyName);
        if (!property) {
            throw new Error("Variable missing in Configuration:" + table + " " + propertyName);
        }
        return property;
    }
    public getTableData(table: ooTables): any[][] {
        let tableData = this.tableDataCache[table] as unknown as any[][];
        if (!tableData && table === ooTables.systemMasterConfiguration) {
            tableData = SpreadsheetApp.openById(systemMasterId).getSheetByName("Configuration").getDataRange().getValues();
            this.tableDataCache[table] = tableData;
            return tableData
        }
        if (!tableData) {
            throw new Error("no implementation for " + table);
        }
        return tableData;
    }
    public saveTableData(table: ooTables, data: any[][]) {
        this.tableDataCache[table] = data;
        const spreadsheet = this.getSpreadsheet(table);
        const sheetName = this.getSheetName(table);
        spreadsheet.getSheetByName(sheetName).getDataRange().setValues(data);
        SpreadsheetApp.flush();
    }
    public getFileName(table: ooTables): string {
        const tableFile = this.getMasterProperty(table + "_TableFile");
        const table_FileName = this.getMasterProperty(tableFile + "Name") + " - Version:" + this.version;
        return table_FileName;
    }
    private getMasterId(table: ooTables): string {
        const templateFolder = DriveApp.getFolderById(this.getMasterProperty(systemMasterProperty.officeOne2022_TemplateFolderId))
        const table_FileId = templateFolder.getFilesByName(this.getFileName(table)).next().getId();
        return table_FileId;
    }
    public getFolderNameWithVersion(folder: ooFolders) {
        return folder + " " + this.version;
    }
    public isDeprecated(): boolean {
        const masterConfigFileId = this.getMasterId(this.hostTable);
        const masterProperties = new ValuesCache(SpreadsheetApp.openById(masterConfigFileId).getDataRange().getValues())
        const subversion = masterProperties.getValueByName(office.subversion);
        return (subversion > this.getOfficeProperty(office.subversion));
    }
    public archiveHostFile() {
        //move office Host File in Archive Folder
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        const archiveFolder = getOrCreateFolderIn(this.officeFolder, ooFolders.archive);
        const versionFolder = getOrCreateFolderIn(archiveFolder, ooFolders.version + this.version);
        versionFolder.addFile(installCallFile);
        this.officeFolder.removeFile(installCallFile);

    }
}


function getOrCreateFolderIn(inFolder: GoogleAppsScript.Drive.Folder, returnFolderName: ooFolders | string) {
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


export function getNextVersion(): ooVersions {
    let oooNextVersion = (parseInt(currentOOversion, 10) + 1).toString();
    let nix = "";
    for (let nullen = 0; nullen < 4 - oooNextVersion.length; nullen++) {
        nix += "0";
    }
    oooNextVersion = nix + oooNextVersion;
    return oooNextVersion as ooVersions;
}

export function copyFolder(folderToCopyId: string, parentFolderId: string, oldVersion: ooVersions, newVersion: ooVersions): GoogleAppsScript.Drive.Folder {
    if (folderToCopyId === parentFolderId) throw new Error("copying a folder in itself would result in an endless loop");
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const folderToCopy = DriveApp.getFolderById(folderToCopyId);
    //create new Folder
    const folderCopy = parentFolder.createFolder(getNewName(folderToCopy.getName(), oldVersion, newVersion));

    //copy all files from the folder
    const fileIterator = folderToCopy.getFiles()
    while (fileIterator.hasNext()) {
        const fileToCopy = fileIterator.next();
        fileToCopy.makeCopy(getNewName(fileToCopy.getName(), oldVersion, newVersion), folderCopy);
    }

    //copy all folders from the folder
    const folderIterator = folderToCopy.getFolders();
    while (folderIterator.hasNext()) {
        const folderToCopy = folderIterator.next();
        copyFolder(folderToCopy.getId(), folderCopy.getId(), oldVersion, newVersion);
    }
    return folderCopy;
}

function getNewName(oldName: string, oldVersion: ooVersions, newVersion: ooVersions): string {
    let folderToCopyName = oldName;
    //rename folder if it ends with version number
    if (oldVersion === folderToCopyName.substr(folderToCopyName.length - 4)) {
        folderToCopyName = folderToCopyName.substr(0, folderToCopyName.length - 4) + newVersion;
    }
    return folderToCopyName
}

export function getOrCreateFolder(rootFolder: GoogleAppsScript.Drive.Folder, folderName: string): GoogleAppsScript.Drive.Folder {
    var folderIterator = rootFolder.getFoldersByName(folderName);
    if (folderIterator.hasNext()) return folderIterator.next();
    else return rootFolder.createFolder(folderName);
}

