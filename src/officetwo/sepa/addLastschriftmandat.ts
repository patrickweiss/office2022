import { ranges } from '../../server/oo21lib/systemEnums';
import { processLastschriftmandatForm } from './processLastschriftmandatForm';

export const addLastschriftmandat = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
   const rootId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(ranges.OfficeRootID).getValue().toString();
   console.log("addLastschriftmandat called");
   if (event===undefined){
      const debugEvent = {
         namedValues:{
            Zeitstempel: new Date(),
            Produkt:"OfficeOne Basic - 30 Euro / Monat (zzgl. MWSt)",
            "E-Mail-Adresse":"patrick.sbrzesny@saw-office.net",
            Kontoinhaber:"Patrick Sbrzesny",
            "Straße und Hausnummer":"Filderbahnstrasse 54",
            Postleitzahl:"70567",
            Ort:"Stuttgart",
            IBAN:"Iban",
            BIC:"bic",
            "Name der Bank":"Commerzbank AG",
            Vorname:"Patrick",
            Nachname:"Sbrzesny",
            Erteilung:"blabla"
         }
      }
      event = debugEvent as unknown as GoogleAppsScript.Events.SheetsOnFormSubmit
   }
   processLastschriftmandatForm(event,rootId);
};