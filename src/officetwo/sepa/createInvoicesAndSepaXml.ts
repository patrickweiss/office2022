import { EinnahmenRechnungTableCache, Kunde, KundenTableCache, LastschriftenTableCache, Lastschriftmandat, LastschriftmandatTableCache } from "../../officeone/BusinessDataFacade"
import { ooTables } from "../../server/oo21lib/systemEnums";

export default function createInvoicesAndSepaXml() {
    const rootId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(ooTables.OfficeRootID).getValue().toString();
    const lastschriftenTableCache = new LastschriftenTableCache(rootId);
    const kundenTC = new KundenTableCache(rootId);
    const kundenEmailHash = kundenTC.getOrCreateHashTable("E-Mail");
    const lastschriftMandatHash = new LastschriftmandatTableCache(rootId).getRowHashTable();
    const rechnungenTC = new EinnahmenRechnungTableCache(rootId);
    lastschriftenTableCache.getRowArray().filter( ls => ls.getStatus()==="geplant").forEach( ls => {
        console.log(ls.getLm());
        const lm = lastschriftMandatHash[ls.getLm()] as Lastschriftmandat;
        const email = lm.getEMailAdresse();
        console.log(email);
        let kunde = kundenEmailHash[email] as Kunde;
        //Wenn es noch keinen Kunde gibt, dann anlegen
        if (kunde === undefined){
            kunde = kundenTC.createNewRow();
            kunde.setEMail(lm.getEMailAdresse());
            kunde.setVorname(lm.getVorname());
            kundenEmailHash[email]=kunde;
        }
        //Rechnung erstellen
        const rechnung = rechnungenTC.createNewRow();
        rechnung.setBetrag(ls.getBetrag())
        rechnung.setEMail(lm.getEMailAdresse());
        rechnung.setGegenkonto("Lastschrift");
        ls.setStatus("berechnet");
        
    })

    lastschriftenTableCache.getRowArray()
    kundenTC.save();
    rechnungenTC.save();
    lastschriftenTableCache.save();

}