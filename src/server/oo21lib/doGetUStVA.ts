import { BusinessModel } from "../../officeone/BusinessModel";
import { UStVAverschickenFromBackend } from "../officeone/UStVAverschicken";

export function doGetUStVA(e: GoogleAppsScript.Events.DoGet) {
    const bm = new BusinessModel(e.parameters["officeId"], "doGetUStVA")
    try {
        let monatKey = e.parameters["ustva"]
        if (monatKey.length === 1) monatKey = "0" + monatKey
        const zeitraum = UStVAverschickenFromBackend(bm, monatKey)
        const months = {
            '01': '(01) Januar',
            '02': '(02) Februar',
            '03': '(03) März',
            '04': '(04) April',
            '05': '(05) Mai',
            '06': '(06) Juni',
            '07': '(07) Juli',
            '08': '(08) August',
            '09': '(09) September',
            '10': '(10) Oktober',
            '11': '(11) November',
            '12': '(12) Dezember',
            '41': '1. Quartal',
            '42': '2. Quartal',
            '43': '3. Quartal',
            '44': '4. Quartal',
        }
        return HtmlService.createHtmlOutput(`<b>UStVA Daten verschickt für ${months[zeitraum]} ${bm.endOfYear().getFullYear()}</b>`);
    }
    catch (e) {
        return bm.saveError(e)
    }

}