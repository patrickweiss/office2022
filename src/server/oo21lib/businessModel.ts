import { DriveConnector } from "./driveConnector";
import {  ooTables, ooVersions } from "./enums0055";

export class BusinessModel{
    private hostFileId:string;
    private dc:DriveConnector;
    constructor(hostFileId:string,table:ooTables,version:ooVersions){
        this.hostFileId=hostFileId;
        this.dc=new DriveConnector(hostFileId,table,version);
        this.install();
    }
    private install(){ if (this.dc.systemInstalled())return; this.dc.installSystem();}
}