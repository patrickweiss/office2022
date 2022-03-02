import { BusinessModel } from "../../officeone/BusinessModel";
import { checkParsedFile } from "./ausgabenFolderScannen";
import { getOrCreateFolder } from "./directDriveConnector";
import { ServerFunction } from "../oo21lib/systemEnums";

export function vertraegeFolderScannen(rootFolderId: string) {
    let BM = new BusinessModel(rootFolderId, "vertraegeFolderScannen");
    try {
        var rootFolder = DriveApp.getFolderById(rootFolderId);
        var vertraegeFolder = getOrCreateFolder(rootFolder, "6 Verträge");
        var belegIterator = vertraegeFolder.getFiles();
        while (belegIterator.hasNext()) {
            var beleg = belegIterator.next();
            wennVertragNeuEintragen(BM, beleg);
        }
        BM.save();
        var result = {
            serverFunction: ServerFunction.vertraegeFolderScannen,
            VerträgeD: BM.getVertraegeTableCache().getData(),
        }
        BM.saveLog("vertraegeFolderScannen");
        return JSON.stringify(result);
    }
    catch (e) {
        return BM.saveError(e)
    }
}

function wennVertragNeuEintragen(BM: BusinessModel, beleg: GoogleAppsScript.Drive.File) {
    var ausgabeDaten = BM.getVertraegeTableCache().getOrCreateHashTable("ID")[beleg.getId()];
    if (ausgabeDaten != null) {
        return;
    }

    const belegWoerter = beleg.getName().split(" ");

    if (belegWoerter.length > 1) {
        let neueAusgabeRow = BM.getVertraegeTableCache().createNewRow();
        neueAusgabeRow.setFileId(beleg.getId());
        neueAusgabeRow.createLink(beleg.getId(), beleg.getName());
            var index = 1;
        var konto = belegWoerter[0];
        Logger.log("BelegWoerter:" + belegWoerter);
        while (isNaN(parseFloat(belegWoerter[index].charAt(0))) && belegWoerter[index].charAt(0) != "-") {
            konto += " " + belegWoerter[index];
            index++;
        }
        neueAusgabeRow.setBetrag(parseFloat(belegWoerter[index].replace(".", "").replace(",", ".")));
    
        neueAusgabeRow.setKonto(konto);


        var ausgabeText = beleg.getName();

        neueAusgabeRow.setText(ausgabeText);
        checkParsedFile(neueAusgabeRow);
        //updateNameFromDataAndTemplate(neueAusgabeRow, DriveConnector.getValueByName(BM.getRootFolderId(), "AusgabenDatei", oooVersion));
    }

}