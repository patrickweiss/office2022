import { BusinessModel, IBelegZuBankbuchungZuordnen } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";

export function businessModelBatchUpdate(rootFolderId: string, action: string) {
  let BM = new BusinessModel(rootFolderId, "businessModelBatchUpdate");
  try {
    let actionBatch:  Array<IBelegZuBankbuchungZuordnen> = JSON.parse(action) as Array<IBelegZuBankbuchungZuordnen>;
    actionBatch.forEach(action => {
      BM.addLogMessage(JSON.stringify(action))
      BM.handleAction(action)
    });
    BM.save();
    var result = {
      serverFunction: ServerFunction.businessModelBatchUpdate,
      testName: "Zuordnungen gespeichert"
    }
    BM.saveLog("businessModelBatchUpdate");
    return JSON.stringify(result);
  }
  catch (e) {
    return BM.saveError(e)
  }
}