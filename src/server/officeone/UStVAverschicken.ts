import { BusinessModel } from "../../officeone/BusinessModel";
import { getTestDatum } from "../oo21lib/sendStatusMail";
import { currentOOversion, ooTables,ServerFunction, subscribeRestEndpoint } from "../oo21lib/systemEnums";
import { DriveConnector } from "./driveconnector";



export function UStVAverschickenFromBackend(BM: BusinessModel, ustvaID: string): string {
  ustvaID = ustvaID.substr(0, 2) + "aktuell";
  let ustva = BM.getUStVATableCache().getOrCreateRowById(ustvaID);

  let ustvaElster = {};
  const ustvaRangeData: Object[][] = DriveConnector.getNamedRangeData(BM.getRootFolderId(), ooTables.Konfiguration, currentOOversion)[0];
  for (let zeile of ustvaRangeData) {
    ustvaElster[zeile[0].toString()] = zeile[1].toString();
  }

  const zeitraumMap = {
    "44aktuell": "44",
    "43aktuell": "43",
    "42aktuell": "42",
    "41aktuell": "41",
    "12aktuell": "12",
    "11aktuell": "11",
    "10aktuell": "10",
    "09aktuell": "09",
    "08aktuell": "08",
    "07aktuell": "07",
    "06aktuell": "06",
    "05aktuell": "05",
    "04aktuell": "04",
    "03aktuell": "03",
    "02aktuell": "02",
    "01aktuell": "01"
  }
  ustvaElster["zeitraumJahr"] = BM.beginOfYear().getFullYear().toString()
  ustvaElster["zeitraum"] = zeitraumMap[ustva.getId()];
  ustvaElster["kz81"] = ustva.get81();
  ustvaElster["kz66"] = ustva.get66();
  ustvaElster["kz48"] = ustva.get48();
  ustvaElster["kz35"] = ustva.get35();
  ustvaElster["kz36"] = ustva.get36();
  ustvaElster["kz83"] = ustva.get83();

  GmailApp.sendEmail("patrick.sbrzesny@saw-office.net", "UStVA verschicken " + ustvaElster["zeitraumJahr"] + " " + ustvaElster["zeitraum"], JSON.stringify(ustvaElster));
  const verschicktId = ustvaID.substr(0, 2) + "verschickt";
  const verschicktUStVA = BM.getUStVATableCache().getOrCreateRowById(verschicktId);
  ustva = BM.getUStVATableCache().getOrCreateRowById(ustvaID);
  verschicktUStVA.setDatum(ustva.getDatum());
  verschicktUStVA.setPeriodeundStatus("verschickt");
  verschicktUStVA.seterstelltam(getTestDatum());
  verschicktUStVA.set81(ustva.get81());
  verschicktUStVA.set66(ustva.get66());
  verschicktUStVA.set48(ustva.get48());
  verschicktUStVA.set35(ustva.get35());
  verschicktUStVA.set36(ustva.get36());
  verschicktUStVA.set83(ustva.get83());
  BM.save();
  UrlFetchApp.fetch(`${subscribeRestEndpoint}?folderId=${BM.getRootFolderId()}&Status=${BM.beginOfYear().getFullYear} ${ustvaElster["zeitraum"]} Kunde`);
  return ustvaElster["zeitraum"];
}

export function UStVAverschicken(rootFolderId: string, ustvaID: string) {
  let BM = new BusinessModel(rootFolderId, "UStVAverschicken");
  try {
    UStVAverschickenFromBackend(BM, ustvaID);
    var result = {
      serverFunction: ServerFunction.getNamedRangeData,
      rangeName: "UStVAD",
      namedRangeData: BM.getUStVATableCache().getData()
    }
    BM.saveLog("UStVAverschicken");
    return JSON.stringify(result);
  }
  catch (e) {
    return BM.saveError(e)
  }

}
