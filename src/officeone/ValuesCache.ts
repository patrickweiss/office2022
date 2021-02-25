import { DriveConnector, oooVersion } from "../server/officeone/driveconnector";


export class ValuesCache {
    dataArray : any[][];
    dataHash = {};
    constructor (rangeName:string,rootId:string){
        this.dataArray = DriveConnector.getNamedRangeData(rootId,rangeName,oooVersion)[0];
        for (let row of this.dataArray){
            this.dataHash[row[0]]=row[1];
        }
    }
    public getValueByName(name:string){
        return this.dataHash[name];
    }
}