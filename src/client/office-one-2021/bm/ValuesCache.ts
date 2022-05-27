import { office } from '../../../server/oo21lib/systemEnums';
import { IOfficeWindow } from '../framework/OfficeWindow';

declare let window: IOfficeWindow;


export class ValuesCache {
    dataArray : any[][];
    dataHash = {};
    constructor (rangeName:string,rootId:string){
        let data = window.store.getState().BM[rootId][rangeName];
        if (data === undefined) window.serverProxy.loadNamedRange(rangeName);
        if (data === "loading") throw new Error(rangeName + " is loading");
        this.dataArray = data[0];
        for (let row of this.dataArray){
            this.dataHash[row[0]]=row[1];
        }
    }
    public getValueByName(name:office){
        return this.dataHash[name];
    }
}