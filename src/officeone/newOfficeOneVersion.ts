import { DriveConnector, oooVersion } from "./driveconnector";
import { months } from "../server/oo21lib/systemEnums";

export const getDevOpsFolder = () => {return DriveApp.getFolderById("1Q9J0q2ZIlHgxoqxrGA2ufTMUBiWLf6vd")};

export const newOfficeOneVersion = () => {
    const nextVersion = getNextVersion();
    const nextVersionFolder = getDevOpsFolder().createFolder(nextVersion);

    // make a copy of all Spreadsheets
    //read from all Tables from new version to make sure all new Spreadsheets get copied
    for (let rangeName of Object.keys(DriveConnector.oooVersionsRangeFileMap[oooVersion])) {
        DriveConnector.getNamedRangeData(nextVersionFolder.getId(), rangeName, oooVersion);
    }
    //rename all Spreadsheets, so they have the new version number
    const nextVersionSpreadsheetIterator = nextVersionFolder.getFiles();
    while (nextVersionSpreadsheetIterator.hasNext()) {
        const currentSpreadsheet = nextVersionSpreadsheetIterator.next();
        currentSpreadsheet.setName(currentSpreadsheet.getName().slice(0, -4) + nextVersion);
    }
    createNewOfficOneFolders(nextVersionFolder.getId());
    copyTemplates(getDevOpsFolder().getFoldersByName(oooVersion).next().getId(), nextVersionFolder.getId());
}

export const copyTemplates = (sourceFolderId: string, destinationFolderId: string) => {
    const templateIterator = DriveApp.getFolderById(sourceFolderId)
        .getFoldersByName("0 Vorlagen").next()
        .getFiles();
    const destFolder = DriveApp.getFolderById(destinationFolderId).getFoldersByName("0 Vorlagen").next();
    while (templateIterator.hasNext()) {
        const template = templateIterator.next();
        const name = template.getName();
        template.makeCopy(name,destFolder).getId();
    }
}

export const createNewOfficOneFolders = (rootFolderId: string):string => {
    const rootFolder = DriveApp.getFolderById(rootFolderId)
    rootFolder.createFolder("0 Vorlagen");
    const einnahmen = rootFolder.createFolder("1 Einnahmen");
    const kunden = einnahmen.createFolder("1 Kunden");
    const sawFolderId = kunden.createFolder("Schwarz auf Weiss AG").getId();
    einnahmen.createFolder("2 Produkte");
    const rechnungen = einnahmen.createFolder("3 Rechnungen");
    monthFolders(rechnungen);
    const gutschriften = einnahmen.createFolder("4 Gutschriften");
    monthFolders(gutschriften);
    const ausgaben = rootFolder.createFolder("2 Ausgaben");
    monthFolders(ausgaben);
    const bank = rootFolder.createFolder("3 Bankkonten");
    monthFolders(bank);
    rootFolder.createFolder("4 Umsatzsteuervoranmeldungen und EÜR (Steuererklärungen, Finanzamtbescheide)");
    rootFolder.createFolder("6 Posteingang");
    rootFolder.createFolder("6 Verträge");
    return sawFolderId;
}

const monthFolders = (folder: GoogleAppsScript.Drive.Folder) => {
    for (let key of Object.keys(months)) {
        folder.createFolder(months[key]);
    }
}

export function getNextVersion() {
    let oooNextVersion = (parseInt(oooVersion, 10) + 1).toString();
    let nix = "";
    for (let nullen = 0; nullen < 4 - oooNextVersion.length; nullen++) {
        nix += "0";
    }
    oooNextVersion = nix + oooNextVersion;
    return oooNextVersion;
}
