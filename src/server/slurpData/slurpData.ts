import { KontenTableCache, Konto } from "../../officeone/BusinessDataFacade";
import { BusinessModel } from "../../officeone/BusinessModel";
import { TableCache, TableRow } from "../../officetwo/BusinessDataFacade";
import { CSVToArray } from "../officeone/O1";
import { getOrCreateFolder } from "../oo21lib/driveConnector";
import { ooFolders } from "../oo21lib/systemEnums";


export function slurpGDPDU(){
    const activeSpreadsheet = SpreadsheetApp.getActive();
    const dataSheet = activeSpreadsheet.getSheetByName("Data");
    const rootFolderId = activeSpreadsheet.getRangeByName("OfficeRootID").getValue().toString();
    const bm = new BusinessModel(rootFolderId,"slurpGDPDU");
    try {
        
        const dataFolder = getOrCreateFolder(DriveApp.getFolderById(rootFolderId),ooFolders.daten);
        const fileTableCache = new TableCache(activeSpreadsheet.getId(), "Files");
        const dataFileIterator = dataFolder.getFiles();
        while (dataFileIterator.hasNext()) {
            const newDataRow = fileTableCache.createNewRow();
            const file = dataFileIterator.next();
            newDataRow.setValue("File Name", file.getName());
            slurpGDPDUCSVFile(file, dataSheet,bm);
        }
        fileTableCache.save();
        bm.save();
        bm.saveLog("slurpGDPDU Ende");
    } catch (e) {
        bm.saveError(e);
        SpreadsheetApp.getUi().prompt(e.toString());
    }
}

export function slurpData() {
    const activeSpreadsheet = SpreadsheetApp.getActive();
    try {
        const dataFolderId = activeSpreadsheet.getSheets()[0].getRange(1, 1).getValue().toString();
        const dataFolder = DriveApp.getFolderById(dataFolderId);
        const fileTableCache = new TableCache(activeSpreadsheet.getId(), "Files", ["Fn202000001", "File Name"]);
        const dataFileIterator = dataFolder.getFiles();
        while (dataFileIterator.hasNext()) {
            const newDataRow = fileTableCache.createNewRow();
            const file = dataFileIterator.next();
            newDataRow.setValue("File Name", file.getName());
            slurpFile(file, "2");
        }
        fileTableCache.save();
    } catch (e) {
        SpreadsheetApp.getUi().prompt(e.toString());
    }
}

export function slurpCSVData() {
    const activeSpreadsheet = SpreadsheetApp.getActive();
    const dataSheet = activeSpreadsheet.getSheetByName("Data");
    try {
        const rootFolderId = activeSpreadsheet.getRangeByName("OfficeRootID").getValue().toString()
        const dataFolder = getOrCreateFolder(DriveApp.getFolderById(rootFolderId),ooFolders.daten);
        const fileTableCache = new TableCache(activeSpreadsheet.getId(), "Files");
        const dataFileIterator = dataFolder.getFiles();
        while (dataFileIterator.hasNext()) {
            const newDataRow = fileTableCache.createNewRow();
            const file = dataFileIterator.next();
            newDataRow.setValue("File Name", file.getName());
            slurpCSVFile(file, dataSheet);
        }
        fileTableCache.save();
    } catch (e) {
        SpreadsheetApp.getUi().prompt(e.toString());
    }
}

function slurpGDPDUCSVFile(file: GoogleAppsScript.Drive.File, sheet: GoogleAppsScript.Spreadsheet.Sheet,bm: BusinessModel) {

    let datenString = file.getBlob().getDataAsString("UTF-8");
    let buchungenArray = CSVToArray(datenString, ";");
    let tableCache: TableCache<TableRow> = new TableCache(sheet.getParent().getId(), sheet.getName());
    const umbuchungenTableCache=bm.getUmbuchungenTableCache();
    const kontenCache = bm.getKontenTableCache();
    const skr03Konten = {};
    const kontenArray = kontenCache.getRowArray();
  
    kontenArray.forEach( 
        kontoRow => {
            if (!kontoRow.isDatenschluerferKonto())skr03Konten[kontoRow.getSKR03() as string]=kontoRow; 
        }
    )
   
    let neueBelegnummer = 0;
    for (let row in buchungenArray)
    {
        const dataArray = buchungenArray[row];
        if (row !== "0")
        {
            if (dataArray[1] !== "" && dataArray[0] !== "")
            {
                const dataRow = tableCache.createNewRow();
                dataRow.setValue("Filename", file.getName());
                dataRow.setValue("Betrag", dataArray[0]);
                dataRow.setValue("SoFkt",dataArray[1]);
                dataRow.setValue("Gegenkonto", dataArray[3]);
                const datum = new Date(parseInt(dataArray[6].toString().substr(-4)),parseInt(dataArray[6].toString().substring(2,4))-1,parseInt(dataArray[6].toString().substring(0,2)))
                dataRow.setValue("Bg-Datum", datum);

                dataRow.setValue("Konto-Nr", dataArray[7]);
                dataRow.setValue("Buchungstext", dataArray[11]);
                dataRow.setValue("Beleg-Nr", dataArray[4]);
                if (!dataRow.getValue("Beleg-Nr")) dataRow.setValue("Beleg-Nr","JA"+neueBelegnummer++);
                dataRow.setValue("BchgNr", dataArray[15]);
                dataRow.setValue("USt-IDNr", dataArray[12]);
                //Jahresabschluss Buchungen vom Steuerberater in Umbuchungen eintragen/aktualisieren (alle außer AfA Buchungen)
//                if (dataRow.getValue("Beleg-Nr").toString().substring(0,2)==="JA" && dataRow.getValue("Buchungstext").substring(0,3)!=="AfA")
                if (!dataRow.getValue("Buchungstext"))dataRow.setValue("Buchungstext","-");
                if (dataRow.getValue("Beleg-Nr").toString().substring(0,2)==="JA" && dataRow.getValue("Buchungstext").substring(0,3)!=="AfA")
                {
                    const jaUmbuchung = umbuchungenTableCache.getOrCreateRowById(dataRow.getValue("Beleg-Nr").toString());
                    jaUmbuchung.setFileId(jaUmbuchung.getId());
                    jaUmbuchung.setDatum(dataRow.getValue("Bg-Datum"));
                    jaUmbuchung.setKonto(getOrCreateOoKonto(skr03Konten,dataRow.getValue("Konto-Nr").toString(),kontenCache));
                    jaUmbuchung.setBetrag(dataRow.getValue("Betrag"));
                    jaUmbuchung.setGegenkonto(getOrCreateOoKonto(skr03Konten,dataRow.getValue("Gegenkonto").toString(),kontenCache));
                    jaUmbuchung.setBezahltAm(dataRow.getValue("Bg-Datum"));
                    jaUmbuchung.setText(dataRow.getValue("Buchungstext"));
                }
            }
        }
    }
    tableCache.save();
}

function getOrCreateOoKonto(skr03Konten:Object,SKR03konto:string, kontenCache:KontenTableCache){
    let ooKontoRow = skr03Konten[SKR03konto] as Konto;
    if (!ooKontoRow || ooKontoRow.isDatenschluerferKonto()){
        let ooKonto = "JA"+SKR03konto
        ooKontoRow =  kontenCache.getOrCreateRowById(ooKonto)
        ooKontoRow.setSKR03(SKR03konto);
        ooKontoRow.setQuelle("JA Datenschlürfer");
    }
    return ooKontoRow.getKonto();
}


function slurpCSVFile(file: GoogleAppsScript.Drive.File, sheet: GoogleAppsScript.Spreadsheet.Sheet) {

    let datenString = file.getBlob().getDataAsString("UTF-8");
    let buchungenArray = CSVToArray(datenString, ";");
    let tableCache: TableCache<TableRow> = new TableCache(sheet.getParent().getId(), sheet.getName());

    for (let row in buchungenArray) {
        const dataArray = buchungenArray[row];
        if (row !== "0") {
            if (dataArray[1] !== "" && dataArray[0] !== "") {
                const dataRow = tableCache.createNewRow();
                dataRow.setValue("Filename", file.getName());
                dataRow.setValue("Betrag", dataArray[1]);
                dataRow.setValue("Gegenkonto", dataArray[3]);
                dataRow.setValue("Bg-Datum", dataArray[0]);

                dataRow.setValue("Konto-Nr", dataArray[2]);
                dataRow.setValue("Buchungstext", dataArray[4]);
                dataRow.setValue("Beleg-Nr", dataArray[5]);
                dataRow.setValue("BchgNr", dataArray[6]);
                dataRow.setValue("USt-IDNr", dataArray[7]);
            }
        }
    }
    tableCache.save();
}


function slurpFile(file: GoogleAppsScript.Drive.File,headlineRowIndex: string) {
    const sheet = SpreadsheetApp.getActive().getSheetByName("Data");
    const folderId = file.getParents().next().getId();
    let blob = file.getBlob();
    let resource = {
        title: file.getName(),
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: [{ id: folderId }]
    };
    let gsheet = Drive.Files.insert(resource, blob);
    const spreadsheet = SpreadsheetApp.openById(gsheet.id);
    const sourceSheet = spreadsheet.getSheets()[0];
    const dataTable = sourceSheet.getDataRange().getValues();
    let columns = [];
    let tableCache: TableCache<TableRow>;
    const currentColumnArray = sheet.getDataRange().getValues()[0] as unknown as string[];
    if (currentColumnArray.length > 1) tableCache = new TableCache(sheet.getParent().getId(), sheet.getName())
    for (let row in dataTable) {
        const dataArray = dataTable[row];
        if (row === headlineRowIndex) columns = dataTable[row];
        if (columns.length > 0) {
            if (!tableCache) tableCache = new TableCache(sheet.getParent().getId(), sheet.getName(), ["De202000001", "Filename", ...columns])
            else {
                if (row !== headlineRowIndex) {
                    const dataRow = tableCache.createNewRow();
                    dataRow.setValue("Filename", file.getName());
                    for (let index in columns) {
                        dataRow.setValue(columns[index], dataArray[index]);
                    }
                }
            }
        }
    }
    tableCache.save();
}
