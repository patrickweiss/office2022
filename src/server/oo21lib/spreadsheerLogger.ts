
export class oolog{
    private static message:string;
    private static begin:Date;
    public static logBeginn(message:string){
        oolog.message = message+"\n";
        oolog.begin=new Date()
    }
    public static addMessage(message:string){
        oolog.message+=message+"\n";
    }
    public static logEnd(message:string){
        oolog.addMessage(message);
        let sheet = SpreadsheetApp.getActive().getSheetByName("log")
        if (!sheet){
            sheet = SpreadsheetApp.getActive().insertSheet()
            sheet.setName("log")
        }
        let now = new Date();
        sheet.appendRow([oolog.begin,now,now.valueOf()-oolog.begin.valueOf(),oolog.message]);
    }
}