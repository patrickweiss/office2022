import { Buchung } from "../../officeone/BusinessDataFacade";
import { BusinessModel } from "../../officeone/BusinessModel";
import { ServerFunction } from "../oo21lib/systemEnums";

export function BuchungenFuerUmsatzsteuerBerechnenUndEintragen(rootFolderId: string){
    let BM = new BusinessModel(rootFolderId,"BuchungenFuerUmsatzsteuerBerechnenUndEintragen");
    try {
    BM.umsatzsteuerJahresabrechnung();
    BM.save();
    var result = {
        serverFunction: ServerFunction.BuchungenFuerUmsatzsteuerBerechnenUndEintragen,
        testName:createUmsatzsteuerArray( BM.getImGeschaeftsjahrBezahlteEinnahmenRechnungen()),
        gutsch:createUmsatzsteuerArray( BM.getImGeschaeftsjahrBezahlteGutschriften()),
      }
      return JSON.stringify(result);
    }
    catch (e) {
      BM.saveError(e)
      throw e;
    } 
}


function createUmsatzsteuerArray(anlagenArray: Buchung[]) {
    var result:number[] = [];
    for (let index in anlagenArray) {
      result.push(anlagenArray[index].getBetrag());
    }
    return result;
  }