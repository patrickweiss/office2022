import { doGetApplicant } from "../officetwo/application/doGetApplicant";
import { doGetLastschriftmandat } from "../officetwo/sepa/doGetLastschriftmandat";
import { DriveConnector } from "./officeone/driveconnector";
import { doGetUStVA } from "./oo21lib/doGetUStVA";
import { currentOOversion } from "./oo21lib/systemEnums";

export const onOpen = () => {
  try {
    const name: String = SpreadsheetApp.getActiveSpreadsheet().getName().toString();
    if (name.substr(0, 3) === "7 D") {
      const menu = SpreadsheetApp.getUi()
        .createMenu('OfficeOne Datenschlürfer') // edit me!
        .addItem("GDPdU BB schlürfen","slurpGDPDU")
    //    .addItem("Simba Excel Reimport Daten schlürfen", "slurpData")
        .addItem("Simba CSV Export Daten schlürfen", "slurpCSVData")
        .addItem("kotzen", "deleteData")
      menu.addToUi();
    } else if (name.substr(0, 3) === "5 S") {
      const menu = SpreadsheetApp.getUi()
        .createMenu('OfficeOne.2021') // edit me!
        .addItem("Lastschriften planen", "createLastschriften")
        .addItem("Rechnungen und Lastschriften XML-Datei erzeugen", "createInvoicesAndSepaXml")
        .addItem('Über OfficeOne.2021', 'openAboutSidebar');
      menu.addToUi();
    }
    else {
      const menu = SpreadsheetApp.getUi()
      .createMenu('Office One 2021') // edit me!
      .addItem('Rechnungsvorlage erstellen', 'rechnungsVorlageErstellen')
      .addItem("OfficeOne.2021", "openOfficeOne2021")
    menu.addToUi();
    }
  } catch (e) { console.log(e) }
};


export const openAboutSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('sidebar-about-page').setTitle("OfficeOne.2021").setWidth(500);
  SpreadsheetApp.getUi().showSidebar(html);
};

export const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  if (e.parameters["email"])return doGetLastschriftmandat(e);
  if (e.parameters["applicant"])return doGetApplicant(e);
  if (e.parameters["ustva"])return doGetUStVA(e);
  const html = HtmlService.createHtmlOutputFromFile('office-one-2021').setTitle("OfficeOne.2021");
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}


