import { Gdpdu } from "../officeone/BusinessDataFacade";


export class DriveConnector {
  static saveTableData(fileId: string, tableName: string, loadRowCount: number, dataArray: Object[][], backgroundArray: string[][], formulaArray: string[][]) {
    var spreadsheet = SpreadsheetApp.openById(fileId);
    let dataRange = spreadsheet.getSheetByName(tableName).getRange(1,1,dataArray.length,dataArray[0].length);
    //alle vorhandenen Formeln in das DataArray kopieren um "setFormulas" nach setValues zu sparen

    for (var zeilen in dataArray) {
      for (var spalten in dataArray[zeilen]) {
        if (formulaArray[zeilen][spalten] != "" && formulaArray[zeilen][spalten] != undefined) {
          dataArray[zeilen][spalten] = formulaArray[zeilen][spalten];
        }
      }
    }
    dataRange.setValues(dataArray);
  
    dataRange.setBackgrounds(backgroundArray).setBorder(true, true, true, true, true, true, "#b7b7b7", SpreadsheetApp.BorderStyle.SOLID);
    dataRange = spreadsheet.getSheetByName(tableName).getRange(1,1,dataArray.length,dataArray[0].length);
    let tableNameHack = tableName;
    if (tableNameHack==="Data")tableNameHack="GdpduD";
    if (tableNameHack==="Files")tableNameHack="DataFileD";
    spreadsheet.setNamedRange(tableNameHack,dataRange);
   
    SpreadsheetApp.flush();
  }
  static getTableData(spreadsheetId: string, sheetName: string): {} {
    const dataRange = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName).getDataRange();
    return [dataRange.getValues(), dataRange.getBackgrounds(), dataRange.getFormulasR1C1(), dataRange.getNumberFormats()];
  }



}



