import { DriveConnector, oooVersion } from "../server/officeone/driveconnector";
import { ooTables } from "../server/oo21lib/systemEnums";


export class ValuesCache {
    dataArray : any[][];
    dataHash = {};
    constructor (rangeName:ooTables,rootId:string){
        this.dataArray = DriveConnector.getNamedRangeData(rootId,rangeName,oooVersion)[0];
        for (let row of this.dataArray){
            this.dataHash[row[0]]=row[1];
        }
    }
    public getValueByName(name:string){
        const result = this.dataHash[name];
        if (!result)throw new Error("In der Konfiguration fehlt die Variable:"+name);
        return this.dataHash[name];
    }
}