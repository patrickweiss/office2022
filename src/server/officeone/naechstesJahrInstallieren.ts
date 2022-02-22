import { BusinessModel } from "../../officeone/BusinessModel";
import { currentOOversion, office, ooTables, ServerFunction } from "../oo21lib/systemEnums";
import { DriveConnector } from "./driveconnector";
import { installNewInstance } from "./installNewInstance";

export function naechstesJahrInstallieren(rootFolderId: string):string {
    let BM = new BusinessModel(rootFolderId, "naechstesJahrInstallieren");
    try {
        //Name für neuen Ordner aus altem Namen und Geschäftsjahr generieren
        let name = DriveApp.getFolderById(BM.getRootFolderId()).getName()
        let aktuellesJahr = BM.beginOfYear().getFullYear();
        let neuesJahr = aktuellesJahr+1;
        //Hier neue Instanz installieren und Namen setzen
        let result =JSON.parse(installNewInstance(name.replace(aktuellesJahr.toString(),neuesJahr.toString())));
        //alte Konfiguration erst mal komplett in neue Instanz kopieren
        const konfiguration = DriveConnector.getNamedRangeData(rootFolderId, ooTables.Konfiguration, currentOOversion);
        DriveConnector.saveNamedRangeData(result.newFolderId, ooTables.Konfiguration, konfiguration[0].length,konfiguration[0], konfiguration[1], konfiguration[2], currentOOversion)
        //Einzelne Werte aktualisieren:
        //zeitraumJahr, officeRootID_FolderId, officeRootID_FolderId
        let BMneu = new BusinessModel(result.newFolderId,"Konfiguration anpassen");
        BMneu.setKonfigurationValue(office.vorjahrOfficeRootID_FolderId,BM.getKonfigurationValue(office.officeRootID_FolderId))
        BMneu.setKonfigurationValue(office.zeitraumJahr,neuesJahr);
        BMneu.setKonfigurationValue(office.officeRootID_FolderId,BMneu.getRootFolderId());
        //Konfigurationen die nicht in der Range ooTables.Konfiguration stehen kopieren
        DriveConnector.saveFormulaByName(BMneu.getRootFolderId(),ooTables.Rechnungsvorlagelink,currentOOversion,
            DriveConnector.getValueByName(BM.getRootFolderId(),ooTables.Rechnungsvorlagelink,currentOOversion)
        );
        //Verträge, Kunden, etc. kopieren ??? Ordner ins neue Jahr verschieben ???
        //Kunden
        const kunden = BM.getKundenTableCache().getRowArray()
        kunden.forEach(kunde => {
            const neuerKunde = BMneu.getKundenTableCache().getOrCreateRowById(kunde.getId());
            neuerKunde.setValueArray(kunde.getValueArray());
            neuerKunde.setFormulaArray(kunde.getFomulaArray());
        })
        //Verträge ... 
        const vertraege = BM.getVertraegeTableCache().getRowArray()
        vertraege.forEach(vertrag => {
            const neuerVertrag = BMneu.getVertraegeTableCache().getOrCreateRowById(vertrag.getId());
            neuerVertrag.setValueArray(vertrag.getValueArray());
            neuerVertrag.setFormulaArray(vertrag.getFomulaArray());
        })
        BMneu.save();
        BM.save();
        result.serverFunction =  ServerFunction.naechstesJahrInstallieren,
        
        BM.saveLog("Instanz für nächstes Jahr wurde installiert");
        return JSON.stringify(result);
    }
    catch (e) {
        return BM.saveError(e)
    }
}
