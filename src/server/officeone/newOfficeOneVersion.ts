import { copyFolder } from "../oo21lib/driveConnector";
import { currentOOversion, months, ooVersions } from "../oo21lib/systemEnums";

export const getDevOpsFolder = () => {return DriveApp.getFolderById("139Tyi3gOXE7ZkfUdhRXMMl8uZj0uxIb9")};

export const newOfficeOneVersion = () => {
    const nextVersion = getNextVersion() as ooVersions;

    copyFolder(getDevOpsFolder().getFoldersByName(currentOOversion).next().getId(),getDevOpsFolder().getId(),currentOOversion,nextVersion)
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
    rootFolder.createFolder("6 Verträge");
    return sawFolderId;
}

const monthFolders = (folder: GoogleAppsScript.Drive.Folder) => {
    for (let key of Object.keys(months)) {
        folder.createFolder(months[key]);
    }
}

export function getNextVersion() {
    let oooNextVersion = (parseInt(currentOOversion, 10) + 1).toString();
    let nix = "";
    for (let nullen = 0; nullen < 4 - oooNextVersion.length; nullen++) {
        nix += "0";
    }
    oooNextVersion = nix + oooNextVersion;
    return oooNextVersion;
}
