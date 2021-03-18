import { BusinessModel } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";

export function businessModelBatchUpdate(rootFolderId: string, action: string) {
  let BM = new BusinessModel(rootFolderId, "businessModelBatchUpdate");
  try {
    let actionBatch: [] = JSON.parse(action) as [];
    actionBatch.forEach(action => BM.handleAction(action));
    BM.save();
    var result = {
      serverFunction: ServerFunction.businessModelBatchUpdate,
      testName: "Zuordnungen gespeichert"
    }
    BM.saveLog("ausgabenFolderScannen");
    return JSON.stringify(result);
  }
  catch (e) {
    return BM.saveError(e)
  }
}