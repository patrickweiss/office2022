import { BusinessModel } from "../../officeone/BusinessModel";
import { formatDate, formatMoney } from "../officeone/rechnungSchreiben";
import * as OO2022 from "./businessModel" ;
import { currentOOversion, months, office, ooTables } from "./systemEnums";

export function sendStatusMail(bm: BusinessModel,bm2022:OO2022.BusinessModel) {
    const monat = getTestDatum().getMonth();
    const userEmail = Session.getActiveUser().getEmail()
    const vorjahrID = bm2022.getDriveConnector().getOfficeProperty(office.vorjahrOfficeRootID_FolderId);

    let html = "<body><table>";
    html+= `<thead><tr><th>Ausgaben</th><th></th><th></th><th></th><th></th></tr></thead>
    <tbody>`;
    html=outerAusgabenFuerMonat(html,bm,monat-1,vorjahrID);//html für vor vor monat
    html=outerAusgabenFuerMonat(html,bm,monat,vorjahrID);//html für monat vor aktuellem monat
    html+= `</tbody>
    </table>`;

    html+= `<thead><tr><th>Gutschriften</th><th></th><th></th><th></th><th></th></tr></thead>
    <tbody>`;
    html = outerGutschriftenFuerMonat(html,bm,monat-1,vorjahrID);//html für vor vor monat
    html = outerGutschriftenFuerMonat(html,bm,monat,vorjahrID);//html für monat vor aktuellem monat
    html+= `</tbody>
    </table></body>`;

    const ImageBlob = null;
    GmailApp.sendEmail(userEmail, "Neue Belege geparst", html, { htmlBody: html });
}

function outerGutschriftenFuerMonat(html: string, bm: BusinessModel, monat: number,vorjahrID:string):string{
    if (monat>0)html = gutschriftenFuerMonat(html,bm,monat.toString());
    else {
        if (vorjahrID!==""){
            const vorjahrBM=new BusinessModel(vorjahrID);
            html=gutschriftenFuerMonat(html,vorjahrBM,(monat+12).toString())
        }
    }
    return html
}

function gutschriftenFuerMonat(html: string, bm: BusinessModel, monat: string): string {
    let monatKey = monat
    if (monatKey.length===1)monatKey="0"+monatKey
    html+= `<thead><tr><th>${bm.endOfYear().getFullYear()} ${months[monatKey]}</th><th>brutto</th><th>netto</th><th>MwSt</th><th>Konto</th></thead>
    <tbody>`;
    for (let ausgabe of bm.getGutschriftenFuerMonat(monat.toString())) {
        html += `<tr><td>${ausgabe.getText()}</td>
        <td>${formatMoney(ausgabe.getBetrag())}</td>
        <td>${formatMoney(ausgabe.getNettoBetrag())}</td>
        <td>${formatMoney(ausgabe.getMehrwertsteuer())}</td>
        <td>${ausgabe.getKonto()}</td></tr>`;
    }
    return html;
}

function outerAusgabenFuerMonat (html: string, bm: BusinessModel, monat: number,vorjahrID:string):string{
    if (monat>0)html = ausgabenFuerMonat(html,bm,monat.toString());
    else {
        if (vorjahrID!==""){
            const vorjahrBM=new BusinessModel(vorjahrID);
            html=ausgabenFuerMonat(html,vorjahrBM,(monat+12).toString())
        }
    }
    return html
}

function ausgabenFuerMonat(html: string, bm: BusinessModel, monat: string): string {
    let monatKey = monat
    if (monatKey.length===1)monatKey="0"+monatKey
    html+= `<thead><tr><th>${bm.endOfYear().getFullYear()} ${months[monatKey]}</th><th>brutto</th><th>netto</th><th>MwSt</th><th>Konto</th></thead>
    <tbody>`;
    for (let ausgabe of bm.getAusgabenFuerMonat(monat.toString())) {
        html += `<tr><td>${ausgabe.getText()}</td>
        <td>${formatMoney(ausgabe.getBetrag())}</td>
        <td>${formatMoney(ausgabe.getNettoBetrag())}</td>
        <td>${formatMoney(ausgabe.getMehrwertsteuer())}</td>
        <td>${ausgabe.getKonto()}</td></tr>`;
    }
    return html;
}

export function getTestDatum(){
  return new Date(2021,1,2);
 // return new Date();
}