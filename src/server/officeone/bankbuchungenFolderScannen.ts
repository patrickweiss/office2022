import { BusinessModel } from "../../officeone/BusinessModel";
import { BankEBNr, csvTypes, months, office, ServerFunction } from "../oo21lib/systemEnums";
import { getOrCreateFolder } from "./directDriveConnector";
import { CSVToArray } from "./O1";
import { formatDate, formatMoney } from "./rechnungSchreiben";


export function bankbuchungenFolderScannen(rootFolderId: string, month: string) {
    const bm = new BusinessModel(rootFolderId, "bankbuchungenFolderScannen");
    try {


        var rootFolder = DriveApp.getFolderById(rootFolderId);
        var bankkontenFolder = getOrCreateFolder(rootFolder, "3 Bankkonten");
        var monthFolder = getOrCreateFolder(bankkontenFolder, months[month]);


        var belegIterator = monthFolder.getFiles();

        while (belegIterator.hasNext()) {
            var beleg = belegIterator.next();
            let belegDaten = beleg.getName().split(" ");
            if (belegDaten[0].substr(0, 1) !== "✔") {
                let konto = belegDaten[0];
                if (bm.isBankkonto(konto)) {
                    bankbuchungenImportieren(beleg, bm, monthFolder);
                } else if (konto === "Gehalt") gehaltsbuchungenImportieren(beleg, bm);
            }
        }

        bm.save();
        var result = {
            serverFunction: ServerFunction.bankbuchungenFolderScannen,
            BankbuchungenD: bm.getBankbuchungenTableCache().getData(),
        }
        bm.saveLog("Bankbuchungen korrekt importiert");
        return JSON.stringify(result);
    }
    catch (e) {
        return bm.saveError(e)
    }
}


function gehaltsbuchungenImportieren(beleg, BM: BusinessModel): void {
    // let belegDaten = beleg.getName().split(" ");
    // let konto = belegDaten[0];
    let datenString = beleg.getBlob().getDataAsString("ISO-8859-1");
    let buchungenArray = CSVToArray(datenString, ";");
    const gehaltskonten = {
        "3790": "Gehaltsverbindlichkeiten",
        "6027": "Bruttogehalt Vorstand",
        "3730": "Lohnsteuer",
        "3720": "netto Gehalt Vorstand"
    }
    buchungenArray.forEach(element => {
        if (element[0] !== "MDNr" && element[6] !== undefined && element[7] !== "6027") {
            const neueUmbuchung = BM.createUmbuchung();
            neueUmbuchung.setFileId(beleg.getId());
            neueUmbuchung.createLink(beleg.getId(), beleg.getName());
            neueUmbuchung.setDatum(parseDateFromCSVString(element[15]));
            neueUmbuchung.setKonto(gehaltskonten[element[8]]);
            neueUmbuchung.setBetrag(parseFloat(element[6].replace(",", ".")));
            neueUmbuchung.setGegenkonto(gehaltskonten[element[7]]);
            neueUmbuchung.setText(element[4]);
        }
    });
    beleg.setName("✔_" + beleg.getName());

}

function bankbuchungenImportieren(beleg: GoogleAppsScript.Drive.File, BM: BusinessModel, monthFolder: GoogleAppsScript.Drive.Folder): void {
    let geschaeftsjahr = BM.endOfYear().getFullYear();
    BM.addLogMessage("Geschäftsjahr:" + geschaeftsjahr);

    let belegDaten = beleg.getName().split(" ");
    if (belegDaten[0] === "✔") return;
    let konto = belegDaten[0];
    const datenFormat = (BM.getKonfigurationValue((konto + "Is") as office) as csvTypes)
    BM.addLogMessage("bankbuchungenImportieren:" + beleg.getName() + " " + datenFormat);
    let datenString;
    if (datenFormat === csvTypes.Commerzbank || datenFormat === csvTypes.KSK) datenString = beleg.getBlob().getDataAsString("utf-8");
    else datenString = beleg.getBlob().getDataAsString("ISO-8859-1");
    let neuerBankbestand = parseFloat(beleg.getName().split(" ")[1].replace(".", "").replace(",", "."));
    let alterBankbestand = BM.getBankbestand(konto);
    let aktuellerBankbestand = alterBankbestand;
    BM.addLogMessage("alter Bankbestand:" + alterBankbestand);

    if (datenFormat === csvTypes.Voba) {
        //die ersten 12 Zeilen wegwerfen
        let lines = datenString.split('\n');
        lines.splice(0, 12);
        datenString = lines.join('\n');
    }

    let datenArray = CSVToArray(datenString, ";");
    datenArray = removeUncompleteRowOf2dArray(datenArray);
    let importDataFolder = monthFolder.createFolder(beleg.getName());
    saveDataArray(`Originaldaten: ${beleg.getName()}`, datenArray, importDataFolder);
    let transactionArray: CSVTransaction[] = datenArray.map(element => {
        return new CSVTransaction(element, konto, geschaeftsjahr, datenFormat);
    })
    if (datenFormat === csvTypes.BWVisa) transactionArray.reverse();
    let transaction2dArray: any[][] = transactionArray.map(transaction => {
        return [
            transaction.WertstellungsDatum,
            transaction.Buchungstext,
            transaction.Betrag,
            transaction.isPlanned,
            transaction.isValid
        ]
    })
    saveDataArray(`Transaktionsdaten: ${beleg.getName()}`, transaction2dArray, importDataFolder);
    //Rausfinden bis zu welcher Buchung importiert werden muss. 
    //1. Bedingung: neuer Bankbestand stimmt
    //2. Bedingung: die nächste Buchung, welche nach der Buchung kommt nach der der Bankbestand stimmt, muss schon vorhanden sein
    //Vorsicht: damit ist nur ziemlich sicher, aber nicht 100% sicher, dass alle neuen Buchungen importiert wurden! 
    //Aus reinem Zufall kann es immer sein, dass der Bankbestand stimmt und an demselben Tag können 2 Buchungen komplett identisch sein!!! 

    let letzteBuchung = BM.getBankbuchungLatest(konto);
    //durch das Array iterieren:
    let index: string = "";

    if (letzteBuchung !== undefined) {
        //Wenn bereits Bankbuchungen importiert wurden ... erster Import im else Zweig, dort wird Anfangsbestand errechnet und ergänzt
        BM.addLogMessage("letzte Buchung Id:" + letzteBuchung.getId());
        let foundFlag = false;
        for (index in transactionArray) {
            let transaction: CSVTransaction = transactionArray[index];
            let betrag = 0;

            //Wenn die beiden Datumsspalten und die Umsatzart leer sind, dann ist der Umsatz nur vorgemerkt und nicht gebucht. 
            //Um den Endbestand zu bestimmen, muss die Buchung berücksichtigt werden, aber gebucht werden darf sie nicht (Datum fehlt, und vielleicht wird sie nie gebucht)
            if (transaction.isPlanned && datenFormat !== csvTypes.KSK) {
                //bei KSK darf is planned nicht zum Betrag addiert werden ... :(
                betrag = transaction.Betrag;
            }

            if (transaction.isValid) {
                var datumNeu = transaction.WertstellungsDatum;
                let buchungsText = transaction.Buchungstext;
                betrag = transaction.Betrag;
                //Wenn der Bestand nach der vorigen Buchung stimmt und die aktuelle Buchung identisch zur letzten gespeicherten Buchung ist, dann gehe ich davon aus,
                //dass die aktuelle Buchung und die zuletzt gespeicherte identisch sind
                /*
                console.log(
                    index + 
                    " Datum:" + formatDate(datumNeu) +
                    " Betrag:" + betrag +
                    " Saldendifferenz:" + (aktuellerBankbestand - neuerBankbestand));
                console.log(
                    index + " " +
                    " Datum:" + (datumNeu.toString() === letzteBuchung.getDatum().toString()) +
                    " Betrag:" + (betrag === letzteBuchung.getBetrag()).toString() +
                    " Saldendifferenz:" + (Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001).toString() +
                    " Text:" + (buchungsText === letzteBuchung.getText()).toString() 
                );*/
                if (
                    (Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001)
                    && datumNeu.toString() == letzteBuchung.getDatum().toString()
                    && betrag === letzteBuchung.getBetrag()
                    && buchungsText === letzteBuchung.getText()
                ) {
                    foundFlag = true;
                    break;
                }
            }
            aktuellerBankbestand += betrag;
        }
        //Wenn die erste Buchung aus dem Vorjahr ist, dann kann die letzte importierte Buchung nicht gefunden werden (ist im aktuellen Jahr nicht vorhanden)
        //Wenn der der Betrag stimmt, ist trotzdem alles ok
        if ((Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001) &&
            transactionArray[transactionArray.length - 2].WertstellungsDatum.getFullYear() < geschaeftsjahr) {
            foundFlag = true;
            //später wird davon ausgegangen, dass der Index auf die erste bereits importierte Buchung zeigt, weil dies in diesem Fall nicht so ist, muss der Index im eins erhöht werden
            index = (parseInt(index) + 1).toString()
        }
        //bei Kreditkarte zunaechst keine Prüfung auf letzte Buchung
        // if (konto==="Kreditkarte1")foundFlag=true;

        //Wenn die erste Buchung eine EB Buchung aus dem Vorjahr ist, dann kann diese ebenfalls nicht in den importierten Buchungen gefunden werden (es gibt dort keine EB Buchungen)
        //Wenn der Betrag stimmt, ist auch in diesem Fall alles ok
        if ((Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001) && letzteBuchung.getNr() === BankEBNr) {
            foundFlag = true;
            //später wird davon ausgegangen, dass der Index auf die erste bereits importierte Buchung zeigt, weil dies in diesem Fall nicht so ist, muss der Index im eins erhöht werden
            index = (parseInt(index) + 1).toString()
        }
        //falls alle Buchungen eingelesen wurden, die letzte Buchung aber nicht identifiziert werden konnte ...
        if (foundFlag === false){

            if (Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001)throw new Error(
                `Die Buchungen der CSV-Datei ${beleg.getName()} führen zwar zum Endbestand von ${formatMoney(neuerBankbestand)}, aber die letzte Bankbuchung aus dem vorigen Import wurde nicht gefunden. \nBitte stellen Sie sicher, dass das Beginndatum des neuen Imports mindestens einen Tag VOR dem Datum der letzten bereits importierten Bankbuchung in Tabelle "3 Bankbuchungen zuordnen" Sheet "Bankbuchungen" liegt` );
                else  throw new Error(`Die Buchungen der CSV-Datei ${beleg.getName()} führen nicht zum Endbestand von ${formatMoney(neuerBankbestand)} sondern ${formatMoney(aktuellerBankbestand)} Geschäftsjahr: ${geschaeftsjahr} \nBitte stellen Sie sicher, dass das Beginndatum des neuen Imports mindestens einen Tag VOR dem Datum der letzten bereits importierten Bankbuchung in Tabelle "3 Bankbuchungen zuordnen" Sheet "Bankbuchungen" liegt` );
        }
    } else {
        //Dieses Konto wurde noch nie importiert
        //Die erste Buchung erfolgt daher mit dem aus dem Endbestand berechneten Anfangsbestand
        let anfangsbestand = neuerBankbestand;
        let erstesDatum;
        for (index in transactionArray) {
            let transaction: CSVTransaction = transactionArray[index];
            if (transaction.isValid || (transaction.isPlanned && datenFormat !== csvTypes.KSK)) {
                var datumNeu = transaction.WertstellungsDatum;
                erstesDatum = datumNeu;
                let betrag = transaction.Betrag;
                anfangsbestand -= betrag;
            }
        }
        let bankbuchung = BM.createBankbuchung();
        bankbuchung.setKonto(konto);
        bankbuchung.setNr(new Date().toISOString());
        bankbuchung.setDatum(BM.beginOfYear());
        bankbuchung.setBetrag(anfangsbestand);
        bankbuchung.setText("Anfangsbestand");
        bankbuchung.setGegenkontoBank("Anfangsbestand");
        bankbuchung.setBelegID("Anfangsbestand");
        bankbuchung.setLink("Anfangsbestand");
        bankbuchung.setGegenkonto("Anfangsbestand");
        //Weil bei Konten die schon mal importiert wurden die letzte Buchung weggelassen wird (weil es die erste Buchung ist, bei der sich die Transaktions
        //bestände schon überschneiden) wird beim Erstimport der Index im eins erhöht um Zeile 213 zu neutralisieren
        index = (parseInt(index) + 1).toString();
    }

    //jetzt werden die neuen Buchungen rueckwaerts hinzugefuegt, damit die neueste Buchung am Ende oben steht
    let elementIndex = parseInt(index) - 1;//die letzte Buchung ist bereits in der Tabelle
    while (elementIndex >= 0) {
        let transaction: CSVTransaction = transactionArray[elementIndex];
        if (transaction.isValid) {
            var datumNeu = transaction.WertstellungsDatum;
            let bankbuchung = BM.createBankbuchung();
            bankbuchung.setKonto(konto);
            bankbuchung.setNr(new Date().toISOString());
            bankbuchung.setDatum(datumNeu);
            bankbuchung.setBetrag(transaction.Betrag);
            bankbuchung.setText(transaction.Buchungstext);
            bankbuchung.setGegenkontoBank("");
        }
        elementIndex--;
    }
    beleg.setName("✔_" + beleg.getName());
}

class CSVTransaction {

    public WertstellungsDatum: Date;
    public Betrag: number;
    public Buchungstext: string;
    public isValid: boolean;
    public isPlanned: boolean;

    constructor(element, konto, geschaeftsjahr, datenFormat: csvTypes) {
        let datumString = "";

        if (datenFormat === csvTypes.Voba) {
            const valueDate = element[1];
            const purpose = element[3] + " " + element[8];
            const amount = element[11];
            this.isValid = (valueDate != "" && valueDate !== "Valuta" && valueDate != undefined);

            this.Betrag = parseFloat(amount.replace(".", "").replace(",", "."));
            if (element[12] === "S") this.Betrag = -this.Betrag;
            this.Buchungstext = purpose;
            let datum = valueDate.split(".");
            this.WertstellungsDatum = new Date(parseInt(datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));
            this.isPlanned = false
        }
        if (datenFormat === csvTypes.KSK) {
            const valueDate = element[2];
            const purpose = element[4];
            const amount = element[14];


            this.isValid = (valueDate != "" && valueDate !== "Valutadatum" && valueDate != undefined);
            this.isPlanned = element[16] === "Umsatz vorgemerkt";
            if (this.isPlanned) this.isValid = false;//zweifelhafte Buchung soll einfach ignoriert werden. Geht bei KSK, weil im Endbestand sowieso nicht berücksichtigt
            if (this.isPlanned || this.isValid) this.Betrag = parseFloat(amount.replace(".", "").replace(",", "."));
            if (this.isValid) {
                datumString = valueDate;
                this.Buchungstext = element[3] + " " + purpose + " " + element[11];
            }
            let datum = datumString.split(".");
            this.WertstellungsDatum = new Date(parseInt("20" + datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));
        }
        if (datenFormat === csvTypes.Commerzbank) {
            this.isValid = (element[1] != "" && element[1] != "Wertstellung" && element[1] != undefined);
            this.isPlanned = element[0] === "" && element[1] === "" && element[2] === "" && element[4] !== "";
            if (this.isPlanned || this.isValid) this.Betrag = parseFloat(element[4].replace(".", "").replace(",", "."));
            if (this.isValid) {
                datumString = element[1];
                this.Buchungstext = element[3];
            }
            let datum = datumString.split(".");
            this.WertstellungsDatum = new Date(parseInt(datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));

        }
        if (datenFormat === csvTypes.BWVisa) {
            Logger.log(element[0] + " " + element[5]);
            this.isValid = (element[1] != "" && element[1] != "Kaufdatum" && element[1] != undefined && element[5] != undefined);
            this.isPlanned = false;
            if (this.isValid) {
                this.Betrag = parseFloat(element[5].replace(".", "").replace(",", "."));
                datumString = element[1];
                if (element[6] === "S") this.Betrag = -this.Betrag;
                this.Buchungstext = element[3];
            }
            var datum = datumString.split(".");
            this.WertstellungsDatum = new Date(parseInt(datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));
        }

        //prüfen, ob Transaktion im aktuellen Geschäftsjahr ist
        if (geschaeftsjahr !== this.WertstellungsDatum.getFullYear() && this.isValid) {
            this.isValid = false;
            this.isPlanned = false;
        }
    }

}

function parseDateFromCSVString(date: string) {
    var datum = date.split(".");
    return new Date(parseInt(datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));
}

export function removeUncompleteRowOf2dArray(dataArray: any[][]) {
    let columns = dataArray[0].length;
    dataArray = dataArray.filter(zeile => {

        const korrekt = zeile.length === columns
        return korrekt
    }
    )
    return dataArray;
}
export function saveDataArray(name: string, dataArray: any[][], archivFolder: GoogleAppsScript.Drive.Folder) {
    var debugSpreadsheet = SpreadsheetApp.create(name);
    var tempFile = DriveApp.getFileById(debugSpreadsheet.getId());
    archivFolder.addFile(tempFile);
    DriveApp.getRootFolder().removeFile(tempFile)
    debugSpreadsheet.getActiveSheet().getRange(1, 1, dataArray.length, dataArray[0].length).setValues(dataArray);
    /*
     var typen = new Array();
     for (var row in dataArray) {
         var typeArray = [];
         for (var column in dataArray[row]) {
             typeArray.push(typeof dataArray[row][column]);
         }
         typen.push(typeArray);
     }
     debugSpreadsheet.insertSheet().getRange(1, 1, dataArray.length, dataArray[0].length).setValues(typen);
 */
}

