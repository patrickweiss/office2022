import { currentOOversion, ooVersions } from "./systemEnums";


export function getNextVersion(): ooVersions {
    let oooNextVersion = (parseInt(currentOOversion, 10) + 1).toString();
    let nix = "";
    for (let nullen = 0; nullen < 4 - oooNextVersion.length; nullen++) {
        nix += "0";
    }
    oooNextVersion = nix + oooNextVersion;
    return oooNextVersion as ooVersions;
}

export function copyFolder(folderToCopyId: string, parentFolderId: string, oldVersion: ooVersions, newVersion: ooVersions): GoogleAppsScript.Drive.Folder {
    if (folderToCopyId === parentFolderId) throw new Error("copying a folder in itself would result in an endless loop");
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const folderToCopy = DriveApp.getFolderById(folderToCopyId);
    //create new Folder
    const folderCopy = parentFolder.createFolder(getNewName(folderToCopy.getName(), oldVersion, newVersion));

    //copy all files from the folder
    const fileIterator = folderToCopy.getFiles()
    while (fileIterator.hasNext()) {
        const fileToCopy = fileIterator.next();
        fileToCopy.makeCopy(getNewName(fileToCopy.getName(), oldVersion, newVersion), folderCopy);
    }

    //copy all folders from the folder
    const folderIterator = folderToCopy.getFolders();
    while (folderIterator.hasNext()) {
        const folderToCopy = folderIterator.next();
        copyFolder(folderToCopy.getId(), folderCopy.getId(), oldVersion, newVersion);
    }
    return folderCopy;
}

function getNewName(oldName: string, oldVersion: ooVersions, newVersion: ooVersions): string {
    let folderToCopyName = oldName;
    //rename folder if it ends with version number
    if (oldVersion === folderToCopyName.substr(folderToCopyName.length - 4)) {
        folderToCopyName = folderToCopyName.substr(0, folderToCopyName.length - 4) + newVersion;
    }
    return folderToCopyName
}

export function getOrCreateFolder(rootFolder: GoogleAppsScript.Drive.Folder, folderName: string): GoogleAppsScript.Drive.Folder {
    var folderIterator = rootFolder.getFoldersByName(folderName);
    if (folderIterator.hasNext()) return folderIterator.next();
    else return rootFolder.createFolder(folderName);
}

