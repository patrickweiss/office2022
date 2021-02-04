import { DriveConnector } from "./driveConnector";
import { ooSpreadsheets, ooTables } from "./enums0001";

export class BusinessModel{
    private hostFileId:string;
    private dc:DriveConnector;
    constructor(hostFileId:string,hostSpreadsheet:ooSpreadsheets){
        this.hostFileId=hostFileId;
        this.dc=new DriveConnector(hostFileId,hostSpreadsheet);
        this.install();
    }
    private install(){ if (this.dc.systemInstalled())return; this.dc.installSystem();}
}