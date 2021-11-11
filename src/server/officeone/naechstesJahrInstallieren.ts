import { BusinessModel } from "../../officeone/BusinessModel";
import { currentOOversion, office, ooTables, ServerFunction } from "../oo21lib/systemEnums";
import { DriveConnector } from "./driveconnector";
import { installNewInstance } from "./installNewInstance";

export function naechstesJahrInstallieren(rootFolderId: string):string {
    let BM = new BusinessModel(rootFolderId, "naechstesJahrInstallieren");
    try {
        let name = DriveApp.getFolderById(BM.getRootFolderId()).getName()
        let aktuellesJahr = BM.beginOfYear().getFullYear();
        let neuesJahr = aktuellesJahr+1;
        let result =JSON.parse(installNewInstance(name.replace(aktuellesJahr.toString(),neuesJahr.toString())));
        const konfiguration = DriveConnector.getNamedRangeData(rootFolderId, ooTables.Konfiguration, currentOOversion);
        DriveConnector.saveNamedRangeData(result.newFolderId, ooTables.Konfiguration, konfiguration[0].length,konfiguration[0], konfiguration[1], konfiguration[2], currentOOversion)
        //zeitraumJahr, officeRootID_FolderId, officeRootID_FolderId
        let BMneu = new BusinessModel(result.newFolderId,"Konfiguration anpassen");
        BMneu.setKonfigurationValue(office.vorjahrOfficeRootID_FolderId,BM.getKonfigurationValue(office.officeRootID_FolderId))
        BMneu.setKonfigurationValue(office.zeitraumJahr,neuesJahr);
        BMneu.setKonfigurationValue(office.officeRootID_FolderId,BMneu.getRootFolderId());
    


        BM.save();
        result.serverFunction =  ServerFunction.naechstesJahrInstallieren,
        
        BM.saveLog("Instanz für nächstes Jahr wurde installiert");
        return JSON.stringify(result);
    }
    catch (e) {
        return BM.saveError(e)
    }
}
