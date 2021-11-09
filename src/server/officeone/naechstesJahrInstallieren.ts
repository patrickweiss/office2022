import { BusinessModel } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";

export function naechstesJahrInstallieren(rootFolderId: string):string {
    let BM = new BusinessModel(rootFolderId, "naechstesJahrInstallieren");
    try {



        BM.save();
        var result = {
            serverFunction: ServerFunction.naechstesJahrInstallieren,
        }
        BM.saveLog("Instanz für nächstes Jahr wurde installiert");
        return JSON.stringify(result);
    }
    catch (e) {
        return BM.saveError(e)
    }
}
