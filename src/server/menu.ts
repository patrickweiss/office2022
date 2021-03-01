import { Installation, InstallationenTableCache } from "../officeone/BusinessDataFacade";
import { doGetApplicant } from "../officetwo/application/doGetApplicant";
import { doGetLastschriftmandat } from "../officetwo/sepa/doGetLastschriftmandat";
import { DriveConnector, oooVersion } from "./officeone/driveconnector";
//import { updateDrive, updateDriveMaster } from "./officeone/updateDrive";

export const onOpen = () => {
  try {
    const name: String = SpreadsheetApp.getActiveSpreadsheet().getName().toString();
    console.log(name);
    console.log(DriveConnector.oooVersionsRangeFileMap[oooVersion]["InstallationenD"]);
    if (name === DriveConnector.oooVersionsRangeFileMap[oooVersion]["InstallationenD"]) {
      const menu = SpreadsheetApp.getUi()
        .createMenu('OfficeOneMaster') // edit me!
        .addItem("Version für nächstes Geschäftsjahr, wenn Spalte Status \"Jahresabschluss\" ist", "OfficeOne")
        .addItem("update auf Version in Spalte Update auf Version, wenn Spalte Status leer ist", "updateOfficeOne")
        .addItem("Neue Version erstellen", "newOfficeOneVersion")
      menu.addToUi();
    } else if (name.substr(0, 3) === "7 D") {
      const menu = SpreadsheetApp.getUi()
        .createMenu('OfficeOne Datenschlürfer') // edit me!
        .addItem("Simba Excel Reimport Daten schlürfen", "slurpData")
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
      .createMenu('Office One 2022') // edit me!
      .addItem('System installieren', 'installOO22')
      .addItem('System aktualisieren', 'updateOO22')
      .addItem('System löschen', 'deleteSystem')
      .addItem("OfficeOne.2021", "openOfficeOne2021")
    menu.addToUi();
    }
  } catch (e) { console.log(e) }
};


export const openOfficeOne2021 = () => {
  const html = HtmlService.createHtmlOutputFromFile('office-one-2021').setTitle("OfficeOne.2021").setWidth(500).setHeight(1000);
  SpreadsheetApp.getUi().showModelessDialog(html, "OfficeOne.2021");
};

export const openAboutSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('sidebar-about-page').setTitle("OfficeOne.2021").setWidth(500);
  SpreadsheetApp.getUi().showSidebar(html);
};

export const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  if (e.parameters["email"])return doGetLastschriftmandat(e);
  if (e.parameters["applicant"])return doGetApplicant(e);
  const html = HtmlService.createHtmlOutputFromFile('office-one-2021').setTitle("OfficeOne.2021");
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}
/*
export const updateOfficeOne = () => {
  const location: any[][] = SpreadsheetApp.getActive().getRangeByName("OfficeRootID").getValues();
  const ooFolderId = location[0][0]
  const installationenTableCache = new InstallationenTableCache(ooFolderId);
  const installationenRowArray: Installation[] = installationenTableCache.getRowArray();

  for (let installation of installationenRowArray) {
    if (installation.getStatus() === "" && installation.getUpdateaufVersion() === oooVersion) {
      if (installation.getProdukte() === "OfficeOneMaster") updateDriveMaster(installation.getFolderId());
      updateDrive(installation.getFolderId());
      installation.setStatus("Update abgeschlossen");
      installation.setVersion(oooVersion);
      installation.setDatum(new Date());
      installationenTableCache.save();
    }
  }

}

*/