import { LastschriftmandatTableCache, Lastschriftmandat, LastschriftproduktTableCache, LastschriftenTableCache, Lastschriftprodukt } from "../../officeone/BusinessDataFacade";
import { DriveConnector } from "../../server/officeone/driveconnector";

export default function createLastschriften(){
    const rootId = DriveConnector.getRootId();
    let lm = new LastschriftmandatTableCache(rootId);
    let lmArray = lm.getRowArray();
    let lp = new LastschriftproduktTableCache(rootId);
    let lpHash = lp.getOrCreateHashTable("Formularname");
    let lstc = new LastschriftenTableCache(rootId);
    lmArray.filter(lm => lm.getStatus()==="bestätigt").forEach(lm => {
        let ls = lstc.createNewRow();
        ls.setLm(lm.getId());
        let lp = lpHash[lm.getProdukt()] as Lastschriftprodukt;
        ls.setBetrag(lp.getPreis());
        ls.setVerwendungszweck(lp.getVerwendungszweck());
        ls.setDatum(new Date());
        ls.setStatus("geplant");
    }); 
    lstc.save();
}