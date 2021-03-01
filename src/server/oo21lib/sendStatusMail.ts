import { BusinessModel } from "../../officeone/BusinessModel";
import { formatDate, formatMoney } from "../officeone/rechnungSchreiben";
import * as OO2022 from "./businessModel" ;
import { currentOOversion, office, ooTables } from "./systemEnums";

export function sendStatusMail(bm: BusinessModel) {
    const monat = getTestDatum().getMonth();
    const userEmail = Session.getActiveUser().getEmail()

    let html = "<body><table>";
    html=outerHtmlFuerMonat(html,bm,monat-1);//html für vor vor monat
    html+= `<tr><td>-</td><td>-<td>-</td><td>-</td></tr>`;
    html=outerHtmlFuerMonat(html,bm,monat);//html für monat vor aktuellem monat
    html+= "</table></body>";

    const ImageBlob = null;
    GmailApp.sendEmail(userEmail, "Neue Belege geparst", html, { htmlBody: html });
}

function outerHtmlFuerMonat (html: string, bm: BusinessModel, monat: number):string{
    if (monat>0)html = htmlFuerMonat(html,bm,monat.toString());
    else {
        const bm2022 = new OO2022.BusinessModel(SpreadsheetApp.getActive().getId(),ooTables.officeConfiguration,currentOOversion);
        const vorjahrID = bm2022.getDriveConnector().getOfficeProperty(office.vorjahrOfficeRootID_FolderId);
        if (vorjahrID!==""){
            const vorjahrBM=new BusinessModel(vorjahrID);
            html=htmlFuerMonat(html,vorjahrBM,(monat+12).toString())
        }
    }
    return html
}

function htmlFuerMonat(html: string, bm: BusinessModel, monat: string): string {
    for (let ausgabe of bm.getAusgabenFuerMonat(monat.toString())) {
        html += `<tr><td>${ausgabe.getId()}</td><td>${formatDate(ausgabe.getDatum())}<td>${ausgabe.getKonto()}</td><td>${formatMoney(ausgabe.getBetrag())}</td></tr>`;
    }
    return html;
}

function getTestDatum(){
    return new Date(2021,0);
   // return new Date();
}