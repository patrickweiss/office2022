export function log(begin:Date,message){
    let sheet = SpreadsheetApp.getActive().getSheetByName("log")
    if (!sheet){
        sheet = SpreadsheetApp.getActive().insertSheet()
        sheet.setName("log")
    }
    sheet.appendRow([begin,new Date(),message]);
}