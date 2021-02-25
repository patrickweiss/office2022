import { DriveConnector } from "./driveConnector";
import { ooTables, ooVersions } from "./systemEnums";

export class BusinessModel {
    private dc: DriveConnector;
    constructor(hostFileId: string, table: ooTables, version: ooVersions) {
        this.dc = new DriveConnector(hostFileId, table, version);
        this.install();
    }
    private install() {
        if (this.dc.systemInstalled()) return;
        this.dc.installSystem();
    }
    public getDriveConnector(): DriveConnector { return this.dc; }
    public scanDriveForNewDocuments(){
        
    }
}