import { TableCache, TableRow } from "../../officetwo/BusinessDataFacade";
import { CSVToArray } from "../officeone/O1";

export function slurpData() {
    const activeSpreadsheet = SpreadsheetApp.getActive();
    try {
        const dataFolderId = activeSpreadsheet.getSheets()[0].getRange(1, 1).getValue().toString();
        console.log("dataFolderId:" + dataFolderId);
        const dataFolder = DriveApp.getFolderById(dataFolderId);
        const fileTableCache = new TableCache(activeSpreadsheet.getId(), "Files", ["Fn202000001", "File Name"]);
        const dataFileIterator = dataFolder.getFiles();
        while (dataFileIterator.hasNext()) {
            const newDataRow = fileTableCache.createNewRow();
            const file = dataFileIterator.next();
            newDataRow.setValue("File Name", file.getName());
            slurpFile(file, "2");
            console.log(file.getName());
        }
        fileTableCache.save();
    } catch (e) {
        SpreadsheetApp.getUi().prompt(e.toString());
        console.log(e.stack);
    }
}

export function slurpCSVData() {
    const activeSpreadsheet = SpreadsheetApp.getActive();
    const fileSheet = activeSpreadsheet.getSheetByName("Files");
    const dataSheet = activeSpreadsheet.getSheetByName("Data");
    try {
        const dataFolderId = activeSpreadsheet.getSheets()[0].getRange(1, 1).getValue().toString();
        console.log("dataFolderId:" + dataFolderId);
        const dataFolder = DriveApp.getFolderById(dataFolderId);
        const fileTableCache = new TableCache(activeSpreadsheet.getId(), "Files");
        const dataFileIterator = dataFolder.getFiles();
        while (dataFileIterator.hasNext()) {
            const newDataRow = fileTableCache.createNewRow();
            const file = dataFileIterator.next();
            newDataRow.setValue("File Name", file.getName());
            slurpCSVFile(file, dataSheet);
            console.log(file.getName());
        }
        fileTableCache.save();
    } catch (e) {
        SpreadsheetApp.getUi().prompt(e.toString());
        activeSpreadsheet.deleteSheet(fileSheet);
        activeSpreadsheet.deleteSheet(dataSheet);
        console.log(e.stack);
    }
}

function slurpCSVFile(file: GoogleAppsScript.Drive.File, sheet: GoogleAppsScript.Spreadsheet.Sheet) {

    let datenString = file.getBlob().getDataAsString("UTF-8");
    let buchungenArray = CSVToArray(datenString, ";");
    console.log(buchungenArray);
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
    //   console.log("Slurp File:" + file.getName());
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
    //  console.log(dataTable);
    let columns = [];
    let tableCache: TableCache<TableRow>;
    const currentColumnArray = sheet.getDataRange().getValues()[0] as unknown as string[];
    if (currentColumnArray.length > 1) tableCache = new TableCache(sheet.getParent().getId(), sheet.getName())
    for (let row in dataTable) {
        const dataArray = dataTable[row];
        //    console.log(dataArray);
        if (row === headlineRowIndex) columns = dataTable[row];
        if (columns.length > 0) {
            if (!tableCache) tableCache = new TableCache(sheet.getParent().getId(), sheet.getName(), ["De202000001", "Filename", ...columns])
            else {
                if (row !== headlineRowIndex) {
                    const dataRow = tableCache.createNewRow();
                    dataRow.setValue("Filename", file.getName());
                    for (let index in columns) {
                        dataRow.setValue(columns[index], dataArray[index]);
                        //  console.log("Betrag" + dataArray[0]);
                    }
                }
            }
        }
    }
    tableCache.save();
}
