import { DriveConnector } from "./driveConnector";

export class BusinessModel{
    private hostFileId:string;
    private dc:DriveConnector;
    constructor(hostFileId:string){
        this.hostFileId=hostFileId;
        this.dc=new DriveConnector(hostFileId);
        this.install();
    }
    private install(){ if (this.dc.systemInstalled)return; this.dc.installSystem();}
}