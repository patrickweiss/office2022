import { BusinessModel } from "../../officeone/BusinessModel";
import { getOrCreateFolder } from "./directDriveConnector";
import { months, ServerFunction } from "./enums";
import { CSVToArray } from "./O1";
import { formatDate } from "./rechnungSchreiben";

enum csvTypes {
    Commerzbank = "Commerzbank",
    BWVisa = "BWVisa",
    KSK = "KSK"
}

export function bankbuchungenFolderScannen(rootFolderId: string, month: string) {
    console.log("bankbuchungenFolderScannen,rootFolderID:" + rootFolderId + " monat:" + month);
    let BM = new BusinessModel(rootFolderId);

    var rootFolder = DriveApp.getFolderById(rootFolderId);
    var bankkontenFolder = getOrCreateFolder(rootFolder, "3 Bankkonten");
    var monthFolder = getOrCreateFolder(bankkontenFolder, months[month]);


    var belegIterator = monthFolder.getFiles();
    let vorgemerkteBuchungen = {}; //das macht natürlich gar keinen Sinn als Rückgabewert!!! bei Refactoring umbauen

    while (belegIterator.hasNext()) {
        var beleg = belegIterator.next();
        console.log(beleg.getName());
        let belegDaten = beleg.getName().split(" ");
        if (belegDaten[0].substr(0, 1) !== "✔") {
            let konto = belegDaten[0];
            if (BM.isBankkonto(konto)) {
                vorgemerkteBuchungen[beleg.getName()] = bankbuchungenImportieren(beleg, BM, monthFolder);
            } else if (konto === "Gehalt") vorgemerkteBuchungen[beleg.getName()] = gehaltsbuchungenImportieren(beleg, BM);
        }
    }

    BM.save();
    var result = {
        serverFunction: ServerFunction.bankbuchungenFolderScannen,
        BankbuchungenD: BM.getBankbuchungenTableCache().getData(),
        vorgemerkteBuchungen: vorgemerkteBuchungen
    }
    return JSON.stringify(result);
}


function gehaltsbuchungenImportieren(beleg, BM: BusinessModel) {
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

    return "Gehaltsbuchungen";
}

function bankbuchungenImportieren(beleg: GoogleAppsScript.Drive.File, BM: BusinessModel, monthFolder: GoogleAppsScript.Drive.Folder) {
    let geschaeftsjahr = BM.endOfYear().getFullYear();
    console.log("Geschäftsjahr:" + geschaeftsjahr);

    let belegDaten = beleg.getName().split(" ");
    if (belegDaten[0] === "✔") return;
    let konto = belegDaten[0];
    const datenFormat = (BM.getConfigurationCache().getValueByName(konto + "Is") as csvTypes)
    console.log("bankbuchungenImportieren:" + beleg.getName() + " " + datenFormat);
    var datenString = beleg.getBlob().getDataAsString("utf-8");
    let neuerBankbestand = parseFloat(beleg.getName().split(" ")[1].replace(".", "").replace(",", "."));
    let alterBankbestand = BM.getBankbestand(konto);
    let aktuellerBankbestand = alterBankbestand;
    console.log("alter Bankbestand:" + alterBankbestand);

    var datenArray = CSVToArray(datenString, ";");
    removeUncompleteRowOf2dArray(datenArray);
    let importDataFolder = monthFolder.createFolder(beleg.getName());
    saveDataArray(`Originaldaten: ${beleg.getName()}`, datenArray, importDataFolder);
    let transactionArray: CSVTransaction[] = datenArray.map(element => {
        return new CSVTransaction(element, konto, geschaeftsjahr, datenFormat);
    })
    if (datenFormat === csvTypes.BWVisa) transactionArray.reverse();
    let transaction2dArray: any[][] = transactionArray.map(transaction => {
        return [
            transaction.WertstellungsDatum,
            transaction.datumString,
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
    let vorgemerkteBuchungen = 0;
    if (letzteBuchung !== undefined) {
        console.log("letzte Buchung Id:" + letzteBuchung.getId());
        let foundFlag = false;
        for (index in transactionArray) {
            let transaction: CSVTransaction = transactionArray[index];
            let betrag = 0;

            //Wenn die beiden Datumsspalten und die Umsatzart leer sind, dann ist der Umsatz nur vorgemerkt und nicht gebucht. 
            //Um den Endbestand zu bestimmen, muss die Buchung berücksichtigt werden, aber gebucht werden darf sie nicht (Datum fehlt, und vielleicht wird sie nie gebucht)
            if (transaction.isPlanned) {
                betrag = transaction.Betrag;
                vorgemerkteBuchungen += betrag;
            }

            if (transaction.isValid) {
                var datumNeu = transaction.WertstellungsDatum;
                let buchungsText = transaction.Buchungstext;
                betrag = transaction.Betrag;
                //Wenn der Bestand nach der vorigen Buchung stimmt und die aktuelle Buchung identisch zur letzten gespeicherten Buchung ist, dann gehe ich davon aus,
                //dass die aktuelle Buchung und die zuletzt gespeicherte identisch sind
                console.log(index + " " + "Datum:" + formatDate(datumNeu) + " Betrag:" + betrag + " Saldendifferenz:" + Math.abs(aktuellerBankbestand - neuerBankbestand));

                console.log(
                    index +" " +(Math.abs(aktuellerBankbestand - neuerBankbestand) < 0.0001).toString() +
                    "&&" + (datumNeu.toString() === letzteBuchung.getDatum().toString()) +
                    "&&" + (betrag === letzteBuchung.getBetrag()).toString() +
                    "&&" + (buchungsText === letzteBuchung.getText()).toString()
                );
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
            transactionArray[transactionArray.length - 2].WertstellungsDatum.getFullYear() < geschaeftsjahr) foundFlag = true;
        //bei Kreditkarte zunaechst keine Prüfung auf letzte Buchung
        // if (konto==="Kreditkarte1")foundFlag=true;

        //falls alle Buchungen eingelesen wurden, die letzte Buchung aber nicht identifiziert werden konnte ...
        if (foundFlag === false) throw new Error(
            "Die Buchungen der CSV-Datei " + beleg.getName() +
            "führen nicht zum Endbestand von " + neuerBankbestand +
            "sondern: " + aktuellerBankbestand +
            "Datum erste Banktransaktion" + transactionArray[transactionArray.length - 2].datumString +
            "Geschäftsjahr" + geschaeftsjahr);
    } else {
        //Dieses Konto wurde noch nie importiert
        //Die erste Buchung erfolgt daher mit dem aus dem Endbestand berechneten Anfangsbestand
        let anfangsbestand = neuerBankbestand;
        let erstesDatum;
        for (index in transactionArray) {
            let transaction: CSVTransaction = transactionArray[index];
            if (transaction.isValid) {

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
    }

    //jetzt werden die neuen Buchungen rueckwaerts hinzugefuegt, damit die neueste Buchung am Ende oben steht
    let elementIndex = parseInt(index) - 1;
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
    return vorgemerkteBuchungen;
}

class CSVTransaction {

    public WertstellungsDatum: Date;
    public Betrag: number;
    public Buchungstext: string;
    public isValid: boolean;
    public isPlanned: boolean;
    public datumString: string;

    constructor(element, konto, geschaeftsjahr, datenFormat: csvTypes) {
        let datumString = "";

        if (datenFormat === csvTypes.KSK) {
            const valueDate = element[2];
            const purpose = element[4];
            const amount = element[14];


            this.isValid = (valueDate != "" && valueDate !== "Valutadatum" && valueDate != undefined);
            this.isPlanned = element[16] === "Umsatz vorgemerkt";
            if (this.isPlanned || this.isValid) this.Betrag = parseFloat(amount.replace(",", "."));
            if (this.isValid) {
                datumString = valueDate;
                this.Buchungstext =element[3]+" "+ purpose+" "+ element[11];
            }
            var datum = datumString.split(".");
            this.datumString = datumString;
            this.WertstellungsDatum = new Date(parseInt("20" + datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));
        }
        if (datenFormat === csvTypes.Commerzbank) {
            this.isValid = (element[1] != "" && element[1] != "Wertstellung" && element[1] != undefined);
            this.isPlanned = element[0] === "" && element[1] === "" && element[2] === "" && element[4] !== "";
            if (this.isPlanned || this.isValid) this.Betrag = parseFloat(element[4].replace(",", "."));
            if (this.isValid) {
                datumString = element[1];
                this.Buchungstext = element[3];
            }
            var datum = datumString.split(".");
            this.datumString = datumString;
            this.WertstellungsDatum = new Date(parseInt(datum[2], 10), parseInt(datum[1], 10) - 1, parseInt(datum[0], 10));

        }
        if (datenFormat === csvTypes.BWVisa) {
            Logger.log(element[0] + " " + element[5]);
            this.isValid = (element[1] != "" && element[1] != "Kaufdatum" && element[1] != undefined && element[5] != undefined);
            this.isPlanned = false;
            if (this.isValid) {
                this.Betrag = parseFloat(element[5].replace(",", "."));
                datumString = element[1];
                if (element[6] === "S") this.Betrag = -this.Betrag;
                this.Buchungstext = element[3];
            }
            var datum = datumString.split(".");
            this.datumString = datumString;
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
    if (dataArray[dataArray.length - 1].length < columns) {
        dataArray.pop();
    }
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
