import { ooFolders, ooSpreadsheets, ooTables, ooVersion, systemTemplateId } from "./enums0001";



export class DriveConnector{
    private hostFileId:string;
    private tableCache:Object;
    private systemTemplateData:any[][];
    constructor(hostFileId:string){
        this.hostFileId=hostFileId;
    }
    public systemInstalled(fileId:string):boolean{
        return DriveApp.getRootFolder().getFoldersByName(ooFolders.system).hasNext();
    }
    public installSystem(){
        //correct the name of the hostFile
        DriveApp.getFileById(this.hostFileId).setName(spreadsheetName(ooSpreadsheets.SalesFunnel));
        const systemFolder = getOrCreateFolderIn(DriveApp.getRootFolder(),ooFolders.system);
        const yearFolder = getOrCreateFolderIn(systemFolder,ooFolders.year);
        const installCallFile = DriveApp.getFileById(this.hostFileId);
        yearFolder.addFile(installCallFile);
        DriveApp.getRootFolder().removeFile(installCallFile);
    }
    private getSpreadsheetName(name:ooSpreadsheets){

    }
    private getProperyFromTableData(){

    }
    private getTableData(tableName:ooTables){
        
    }
    private getSystemTemplateData():any[][]{
        if (this.systemTemplateData)return this.systemTemplateData;
        this.systemTemplateData = SpreadsheetApp.openById(systemTemplateId).getActiveSheet().getDataRange().getValues();
        return this.systemTemplateData
    }
}



function spreadsheetName(name:ooSpreadsheets){
    return name+" "+ooVersion;
}

function installSystem(fileId:string){

}

export function deleteSystem(){
    DriveApp.getRootFolder().getFoldersByName(ooFolders.system).next().setTrashed(true);
}

function getOrCreateFolderIn(inFolder:GoogleAppsScript.Drive.Folder, returnFolderName:ooFolders){
    const folderIterator = inFolder.getFoldersByName(returnFolderName);
    if (folderIterator.hasNext())return folderIterator.next();
    return inFolder.createFolder(returnFolderName);
}