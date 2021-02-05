import { DriveConnector } from "./driveConnector";
import { ooFiles, ooTables } from "./enums0001";

export class BusinessModel{
    private hostFileId:string;
    private dc:DriveConnector;
    constructor(hostFileId:string,hostSpreadsheet:ooFiles){
        this.hostFileId=hostFileId;
        this.dc=new DriveConnector(hostFileId,hostSpreadsheet);
        this.install();
    }
    private install(){ if (this.dc.systemInstalled())return; this.dc.installSystem();}
}