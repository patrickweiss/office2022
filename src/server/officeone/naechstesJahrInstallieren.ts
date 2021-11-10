import { BusinessModel } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";
import { installNewInstance } from "./installNewInstance";

export function naechstesJahrInstallieren(rootFolderId: string):string {
    let BM = new BusinessModel(rootFolderId, "naechstesJahrInstallieren");
    try {
        let name = DriveApp.getFolderById(BM.getRootFolderId()).getName()
        let aktuellesJahr = BM.beginOfYear().getFullYear();
        let neuesJahr = aktuellesJahr+1;
        let result =JSON.parse(installNewInstance(name.replace(aktuellesJahr.toString(),neuesJahr.toString())));

        BM.save();
        result.serverFunction =  ServerFunction.naechstesJahrInstallieren,
        
        BM.saveLog("Instanz für nächstes Jahr wurde installiert");
        return JSON.stringify(result);
    }
    catch (e) {
        return BM.saveError(e)
    }
}
