import { BusinessModel } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";

export function UStVAberechnen(rootFolderId: string) {
  let BM = new BusinessModel(rootFolderId, "PWA: UStVA berechnen");
  try {
    BM.kontoSummenAktualisieren();
    BM.save();

    var result = {
      serverFunction: ServerFunction.getNamedRangeData,
      rangeName: "UStVAD",
      namedRangeData: BM.getUStVATableCache().getData()
    }
    BM.saveLog("Tabelle 4 - Bilanz wurde aktualisiert");
    return JSON.stringify(result);
  }
  catch (e) {
    return BM.saveError(e)
  }
}

