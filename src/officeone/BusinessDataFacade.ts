import { DriveConnector } from "../server/officeone/driveconnector";
import { currentOOversion, ooTables } from "../server/oo21lib/systemEnums";


export class TableCache<RowType extends TableRow> {
  dataArray: Array<Array<string | number | Date | boolean>>;
  backgroundArray: string[][];
  formulaArray: string[][];
  formatsArray: string[][];
  columnIndex: {};
  public loadRowCount: number;
  private rootId: string;
  private tableName: ooTables;
  private rowHashTable;
  private columnHashTable = {};
  private rowArray: RowType[];
  constructor(rootId: string, tableName: ooTables) {
    let data = {}
    if (tableName === ooTables.RechnungSchreibenD || tableName === ooTables.RechnungenD) {
      data = DriveConnector.getNamedRangeDataAndFormat(rootId, tableName, currentOOversion)
      this.formatsArray = data[3];
    }
    else {
      data = DriveConnector.getNamedRangeData(rootId, tableName, currentOOversion);
      this.formatsArray = JSON.parse(JSON.stringify(data[0]));//da muss was drin stehen, sonst können keine TableRows bei Aufruf in getRowByIndex erzeugt werden
    }
    this.dataArray = data[0];
    this.backgroundArray = data[1];
    this.formulaArray = data[2];
    this.columnIndex = this.getColumnIndex(this.dataArray[0]);
    this.loadRowCount = this.dataArray.length;
    this.rootId = rootId;
    this.tableName = tableName;
  }
  public getData() {
    return [this.dataArray, this.backgroundArray, this.formulaArray];
  }
  public getRowHashTable() {
    if (this.rowHashTable === undefined) {
      this.rowHashTable = {};
      for (var index in this.dataArray) {
        if (index !== "0" && this.getRowByIndex(index).getId() !== "") {
          this.addRowToHash(this.getRowByIndex(index))
        }
      }
    }
    return this.rowHashTable;
  }
  public getOrCreateHashTable(columnName: string): Object {
    if (this.columnHashTable[columnName] === undefined) {
      this.columnHashTable[columnName] = {};
      for (let index in this.dataArray) {
        if (index !== "0") {
          let tableRow = this.getRowByIndex(index);
          this.columnHashTable[columnName][tableRow.getValue(columnName)] = tableRow;
        }
      }
    }
    return this.columnHashTable[columnName]
  }
  protected addRowToHash(tableRow: TableRow) {
    this.rowHashTable[tableRow.getId()] = tableRow;
  }
  public getRowArray() {
    if (this.rowArray === undefined) {
      this.rowArray = [];
      for (var index in this.dataArray) {
        if (index !== "0") {
          const currentRow = this.getRowByIndex(index);
          //direkt nach Installation gibt es leere Zeilen, die werden nicht zurueck gegeben
          if (currentRow.getId() !== "") this.rowArray.push(currentRow);
        }
      }
    }
    return this.rowArray;
  }
  public getRowByIndex(rowIndex: string): RowType {
    return new TableRow(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex) as RowType;
  }
  public createNewRow(): RowType {
    let newDataArray = Array.apply(null, Array(this.dataArray[0].length)).map(String.prototype.valueOf, "")
    let newFormulaArray = new Array(this.formulaArray[0].length);
    let newBackgroundArray = Array.apply(null, Array(this.backgroundArray[0].length)).map(String.prototype.valueOf, "white");
    this.dataArray.splice(1, 0, newDataArray);
    this.formulaArray.splice(1, 0, newFormulaArray);
    this.backgroundArray.splice(1, 0, newBackgroundArray);
    let tableRow = this.getRowByIndex("1");
    tableRow.setId(this.dataArray[0][0].toString());
    delete this.rowHashTable;
    delete this.columnHashTable;
    this.columnHashTable = {};
    if (this.rowArray) delete this.rowArray;
    this.getRowHashTable();
    this.dataArray[0][0] = this.dataArray[0][0].toString().substr(0, 6) + padToFive(parseInt(this.dataArray[0][0].toString().substr(6, 5), 10) + 1);
    return tableRow as RowType;
  }
  public getOrCreateRowById(id: string): RowType {
    if (id === "") throw new Error("Empty string is not allowed as id:" + this.tableName + new Error().stack);
    let tableRow = this.getRowHashTable()[id];
    if (tableRow === undefined) {
      let newDataArray = Array.apply(null, Array(this.dataArray[0].length)).map(String.prototype.valueOf, "")
      let newFormulaArray = new Array(this.formulaArray[0].length);
      let newBackgroundArray = Array.apply(null, Array(this.backgroundArray[0].length)).map(String.prototype.valueOf, "white");
      this.dataArray.splice(1, 0, newDataArray);
      this.formulaArray.splice(1, 0, newFormulaArray);
      this.backgroundArray.splice(1, 0, newBackgroundArray);
      tableRow = this.getRowByIndex("1");
      tableRow.setId(id);
      delete this.rowHashTable;
      delete this.columnHashTable;
      this.columnHashTable = {};
      if (this.rowArray) delete this.rowArray;
      this.getRowHashTable();
    }
    return tableRow as RowType;
  }
  public putBackFirstRow() {
    this.dataArray.push(this.dataArray.splice(1, 1)[0]);
    this.backgroundArray.push(this.backgroundArray.splice(1, 1)[0]);
    this.formulaArray.push(this.formulaArray.splice(1, 1)[0]);
    this.formatsArray.push(this.formatsArray.splice(1, 1)[0]);
  }
  public putBackRowById(id:string){
    for (let index in this.dataArray){
      const dataRow = this.dataArray[index];
      if (dataRow[0]===id){
        this.dataArray.push(this.dataArray.splice(parseInt(index),1)[0]);  
        this.backgroundArray.push(this.backgroundArray.splice(parseInt(index),1)[0]);
        this.formulaArray.push(this.formulaArray.splice(parseInt(index),1)[0]);
        this.formatsArray.push(this.formatsArray.splice(parseInt(index),1)[0]);
        delete this.rowArray;
        return    
      }
    }
  }

  public save() {
    DriveConnector.saveNamedRangeData(this.rootId, this.tableName, this.loadRowCount, this.dataArray, this.backgroundArray, this.formulaArray, currentOOversion);
  }
  public deleteAll() {
    this.dataArray = [this.dataArray[0]];
    this.formulaArray = [this.formulaArray[0]];
    this.backgroundArray = [this.backgroundArray[0]];
  }
  public reset() {
    this.deleteAll();
    this.dataArray[0][0] = this.dataArray[0][0].toString().substr(0, 6) + padToFive(1);
  }
  private getColumnIndex(dataColumnNames) {
    var spalte = {};
    for (var index in dataColumnNames) {
      spalte[dataColumnNames[index]] = index;
    }
    return spalte;
  }
}


// Generic code for client and server identical
function padToFive(number: number) { return ("0000" + number).slice(-5); }
//Abstrakte Basisklasse fuer Tabellenzeilen
export class TableRow {
  //private tableCache: TableCache<TableRow>;
  //private index: string;
  private titleRow: Array<string>
  private valueRow: Array<string | number | Date | boolean>
  private formulaRow: Array<string>
  private backgroundRow: Array<string>
  protected formatRow: Array<string>
  private columnIndex: {};
  constructor(titleRow: Array<string>, valueRow: Array<string | number | Date | boolean>, formulaRow: Array<string>, backgroundRow: Array<string>, columnIndex: {}) {
    this.titleRow = titleRow
    this.valueRow = valueRow
    // this.formatRow = formatRow
    this.formulaRow = formulaRow
    this.backgroundRow = backgroundRow
    this.columnIndex = columnIndex
  }
  public getId() { return this.getDataArray()[0].toString(); }
  public setId(value: string) { this.getDataArray()[0] = value; }
  public getTitlesArray() { return this.titleRow }
  public getDataArray() { return this.valueRow; }
  public getTitle(columnName: string) { return this.titleRow[this.columnIndex[columnName]].toString(); }
  public getValueStringOrNumber(columnName: string) {
    const value = this.getDataArray()[this.columnIndex[columnName]];
    if (typeof value === "string") {
      let a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
      if (a) {
        return this.getDateString(new Date(value));
      } else if (columnName === "ID" || columnName === "Nr") return value.substr(0, 5); else return value.substr(0, 20);
    }
    if (value instanceof Date) {
      return this.getDateString(value);
    }
    return (value as number).toFixed(2).replace(".", ",");
  }
  public setValue(columnName: string, value: string | number | Date | boolean) {
    this.valueRow[this.columnIndex[columnName]] = value;
  }
  public getValue(columnName: string) {
    return this.valueRow[this.columnIndex[columnName]];
  }
  public getValueAsDate(columnName: string): Date {
    let value = this.getValue(columnName);
    if (!(value instanceof Date)) value = new Date(value as string);
    return value
  }
  public getFormat(columnName: string) {
    return this.formatRow[this.columnIndex[columnName]];
  }
  public setFormula(columnName: string, value: string) {
    this.formulaRow[this.columnIndex[columnName]] = value;
  }
  public getFormula(columnName: string) {
    return this.formulaRow[this.columnIndex[columnName]];
  }
  public setBackground(columnName: string, value: string) {
    this.backgroundRow[this.columnIndex[columnName]] = value;
  }
  protected getDateString(date: Date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('')
  }

}
//Caches der Tabellen Daten
export class EMailIdTableCache extends TableCache<EMailId> {
  constructor(rootId: string) { super(rootId, ooTables.EMailIdD); }
  public getRowByIndex(rowIndex: string): EMailId {
    return new EMailId(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class AusgabenTableCache extends TableCache<AusgabenRechnung> {
  constructor(rootId: string) { super(rootId, ooTables.AusgabenD); }
  public getRowByIndex(rowIndex: string): AusgabenRechnung {
    return new AusgabenRechnung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class VertraegeTableCache extends TableCache<Vertrag> {
  constructor(rootId: string) {
    super(rootId, ooTables.VerträgeD);
  }
  public getRowByIndex(rowIndex: string): Vertrag {
    return new Vertrag(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class BewirtungsbelegeTableCache extends TableCache<Bewirtungsbeleg> {
  constructor(rootId: string) { super(rootId, ooTables.BewirtungsbelegeD); }
  public getRowByIndex(rowIndex: string): Bewirtungsbeleg {
    return new Bewirtungsbeleg(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class AbschreibungenTableCache extends TableCache<Abschreibung> {
  constructor(rootId: string) {
    super(rootId, ooTables.AbschreibungenD);
  }
  public getRowByIndex(rowIndex: string): Abschreibung {
    return new Abschreibung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class VerpflegungsmehraufwendungenTableCache extends TableCache<Verpflegungsmehraufwendung> {
  constructor(rootId: string) {
    super(rootId, ooTables.VerpflegungsmehraufwendungenD);
  }
  public getRowByIndex(rowIndex: string): Verpflegungsmehraufwendung {
    return new Verpflegungsmehraufwendung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class EinnahmenRechnungTableCache extends TableCache<EinnahmenRechnung> {
  constructor(rootId: string) {
    super(rootId, ooTables.RechnungenD);
  }
  public getRowByIndex(rowIndex: string): EinnahmenRechnung {
    return new EinnahmenRechnung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex, this.formatsArray[rowIndex]);
  }
}
export class RechnungSchreibenTableCache extends TableCache<RechnungSchreiben>{
  constructor(rootId: string) {
    super(rootId, ooTables.RechnungSchreibenD);
  }
  public getRowByIndex(rowIndex: string): RechnungSchreiben {
    return new RechnungSchreiben(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex, this.formatsArray[rowIndex]);
  }
}
export class KundenTableCache extends TableCache<Kunde> {
  constructor(rootId: string) { super(rootId, ooTables.KundenD); }
  public getRowByIndex(rowIndex: string): Kunde {
    return new Kunde(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class ProdukteTableCache extends TableCache<Produkt>{
  constructor(rootId: string) { super(rootId, ooTables.ProdukteD); }
  public getRowByIndex(rowIndex: string): Produkt {
    return new Produkt(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class EURechnungTableCache extends TableCache<EURechnung> {
  constructor(rootId: string) {
    super(rootId, ooTables.EURechnungenD);
  }
  public getRowByIndex(rowIndex: string): EURechnung {
    return new EURechnung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex, this.formatsArray[rowIndex]);
  }
}
export class GutschriftenTableCache extends TableCache<Gutschrift> {
  constructor(rootId: string) {
    super(rootId, ooTables.GutschriftenD);
  }
  public getRowByIndex(rowIndex: string): Gutschrift {
    return new Gutschrift(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class PositionenarchivTableCache extends TableCache<PositionenArchiv>{
  constructor(rootId: string) {
    super(rootId, ooTables.PositionenarchivD);
  }
  public getRowByIndex(rowIndex: string): PositionenArchiv {
    return new PositionenArchiv(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class BankbuchungenTableCache extends TableCache<Bankbuchung> {
  constructor(rootId: string) {
    super(rootId, ooTables.BankbuchungenD);
  }
  public getRowByIndex(rowIndex: string): Bankbuchung {
    return new Bankbuchung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class UmbuchungenTableCache extends TableCache<Umbuchung> {
  constructor(rootId: string) {
    super(rootId, ooTables.UmbuchungenD);
  }
  public getRowByIndex(rowIndex: string): Umbuchung {
    return new Umbuchung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class KontenTableCache extends TableCache<Konto> {
  private kontenSpalten: Object;
  constructor(rootId: string) {
    super(rootId, ooTables.KontenD);
  }
  public getRowByIndex(rowIndex: string): Konto {
    return new Konto(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
  public getOrCreateRowById(kontoName: string): Konto {
    return super.getOrCreateRowById(kontoName) as Konto;
  }
  public setKontenSpalten(geschaeftsjahr: number) {
    this.kontenSpalten = {
      "1": "Januar",
      "2": "Februar",
      "3": "März",
      "4": "April",
      "5": "Mai",
      "6": "Juni",
      "7": "Juli",
      "8": "August",
      "9": "September",
      "10": "Oktober",
      "11": "November",
      "12": "Dezember",
      "-1": (geschaeftsjahr - 1).toString(),
      "-2": (geschaeftsjahr - 2).toString(),
      "-3": (geschaeftsjahr - 3).toString(),
      "-4": "Vorjahre",
      "13": (geschaeftsjahr + 1).toString(),
    };
  }
  public getKontenSpalten(): Object {
    return this.kontenSpalten;
  }
  public bilanzSummenAktualisieren(normalisierteBuchungen: NormalisierteBuchung[]) {
    //Alle Kontensummen und -daten löschen
    for (let zeile in this.dataArray) {
      if (zeile !== "0") {
        let konto = this.getRowByIndex(zeile);
        konto.setValue("Erste Buchung", "-");
        konto.setValue("Betrag", "-");
        konto.setValue("Vorjahre", "-");
        for (let spalte in this.getKontenSpalten()) {
          konto.setValue(this.getKontenSpalten()[spalte], "-");
        }
        konto.setValue("Summe", "-");
      }
    }

    //Kontenspalte befüllen
    for (let buchungRow of normalisierteBuchungen) {
      let kontoRow = this.getOrCreateRowById(buchungRow.getKonto().toString());
      if (kontoRow.getQuelle() === "") kontoRow.setQuelle(buchungRow.getQuelltabelle());
      if (kontoRow.getBeispiel() === "") kontoRow.setBeispiel(buchungRow.getLink());
      //Kontenspalte befüllen
      let monat: string = buchungRow.getMonat().toString();
      let kontenSpalte = this.getKontenSpalten()[monat];
      //Beträge summieren
      var aktuellerBetrag = Number(buchungRow.getValue("Betrag"));
      var aktuelleSumme = Number(kontoRow.getValue(kontenSpalte));
      if (isNaN(aktuelleSumme)) aktuelleSumme = 0;
      kontoRow.setValue(kontenSpalte, aktuellerBetrag + aktuelleSumme);
      var gesamtSumme = Number(kontoRow.getValue("Summe"));
      if (isNaN(gesamtSumme)) gesamtSumme = 0;
      //für GuV Konten werden nur die Monate 1-12 in der Summe berücksichtigt
      if (kontoRow.getValue("Kontentyp") == "GuV") {
        if (parseInt(monat) > 0 && parseInt(monat) < 13 && monat != "") kontoRow.setValue("Summe", aktuellerBetrag + gesamtSumme);
      } else
        if (monat != "13") kontoRow.setValue("Summe", aktuellerBetrag + gesamtSumme);
    }

  }
  public kontenEinfaerben() {

    //groessten und kleinsten Bilanzwert finden
    let groessterBetrag = {};
    groessterBetrag["GuV"] = 0;
    groessterBetrag["Privat"] = 0;
    groessterBetrag["Bilanz"] = 0;
    let kleinsterBetrag = {};
    kleinsterBetrag["GuV"] = 0;
    kleinsterBetrag["Bilanz"] = 0;
    kleinsterBetrag["Privat"] = 0;




    for (let zeile of this.getRowArray()) {
      let kontoRow = zeile;
      let aktuellerBetrag = kontoRow.getValue("Summe");
      if (aktuellerBetrag >= groessterBetrag[kontoRow.getKontentyp()]) groessterBetrag[kontoRow.getKontentyp()] = aktuellerBetrag;
      if (aktuellerBetrag <= kleinsterBetrag[kontoRow.getKontentyp()]) kleinsterBetrag[kontoRow.getKontentyp()] = aktuellerBetrag;
    }



    //Werte einfärben
    for (let zeile of this.getRowArray()) {
      var kontoRow = zeile;
      var aktuellerBetrag = kontoRow.getValue("Summe");
      if (kontoRow.getValue("Kontentyp") === "GuV") {
        kontoRow.setBackground("Summe", this.createGuVColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));
        kontoRow.setBackground("Konto", this.createGuVColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));

      }
      if (kontoRow.getValue("Kontentyp") === "Bilanz") {
        kontoRow.setBackground("Summe", this.createBilanzColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));
        kontoRow.setBackground("Konto", this.createBilanzColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));

      }

    }

    //Werte einfärben
    for (let zeile of this.getRowArray()) {
      var kontoRow = zeile;
      for (var spalte in this.getData()[0][0]) {
        if (parseInt(spalte, 10) >= 12) {
          let spaltenName = this.getData()[0][0][spalte] as string;
          let aktuellerBetrag = kontoRow.getValue(spaltenName);
          if (kontoRow.getKontentyp() === "GuV")
            kontoRow.setBackground(spaltenName, this.createGuVColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));
          if (kontoRow.getKontentyp() === "Bilanz")
            kontoRow.setBackground(spaltenName, this.createBilanzColor(kleinsterBetrag[kontoRow.getKontentyp()], groessterBetrag[kontoRow.getKontentyp()], aktuellerBetrag));
        }
      }
    }
  }
  private createBilanzColor(kleinsterBetrag, groessterBetrag, aktuellerBetrag) {
    var farbe;
    var gradient;
    var max;
    if (aktuellerBetrag == "-" || aktuellerBetrag == 0) return "white";

    if (aktuellerBetrag >= 0) {
      max = Math.sqrt(groessterBetrag);
      gradient = Math.sqrt(aktuellerBetrag);
      gradient = gradient / max;
      farbe = "#" + rgbToHex(240 - gradient * 240, 240 - gradient * 240, 255);
    }
    else {
      max = Math.sqrt(-kleinsterBetrag);
      gradient = Math.sqrt(-aktuellerBetrag);
      gradient = gradient / max;
      farbe = "#" + rgbToHex(240 - gradient * 240, 255, 240 - gradient * 240);
    }

    //  farbe ="#"+rgbToHex(128,255,128);

    return farbe;
  }
  private createGuVColor(kleinsterBetrag, groessterBetrag, aktuellerBetrag) {
    var farbe;
    var gradient;
    var max;
    if (aktuellerBetrag == "-" || aktuellerBetrag == 0) return "white";

    if (aktuellerBetrag >= 0) {
      max = Math.sqrt(groessterBetrag);
      gradient = Math.sqrt(aktuellerBetrag);
      gradient = gradient / max;
      farbe = "#" + rgbToHex(240 - gradient * 240, 255, 240 - gradient * 240);
    }
    else {
      max = Math.sqrt(-kleinsterBetrag);
      gradient = Math.sqrt(-aktuellerBetrag);
      gradient = gradient / max;
      farbe = "#" + rgbToHex(255, 240 - gradient * 240, 240 - gradient * 240);
    }

    //  farbe ="#"+rgbToHex(128,255,128);

    return farbe;
  }
}

export class UStVATableCache extends TableCache<UStVA> {
  constructor(rootId: string) {
    super(rootId, ooTables.UStVAD);
  }
  public getRowByIndex(rowIndex: string): UStVA {
    return new UStVA(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
  public UStVASummenAktualisieren(normalisierteBuchungen: NormalisierteBuchung[], beginnOfYear: Date, periode: string) {
    //ZN spalte befüllen

    // alle Eintrage mit Status "aktuelle Daten" neu generieren
    //Stati: "aktuelle Daten", "verschickt","bestätigt", "berichtigt"  

    let belegNrMonatlich = {
      "1": "01aktuell",
      "2": "02aktuell",
      "3": "03aktuell",
      "4": "04aktuell",
      "5": "05aktuell",
      "6": "06aktuell",
      "7": "07aktuell",
      "8": "08aktuell",
      "9": "09aktuell",
      "10": "10aktuell",
      "11": "11aktuell",
      "12": "12aktuell"
    }
    let belegNrMonatlichProQuartal = {
      "1": "41aktuell",
      "2": "41aktuell",
      "3": "41aktuell",
      "4": "42aktuell",
      "5": "42aktuell",
      "6": "42aktuell",
      "7": "43aktuell",
      "8": "43aktuell",
      "9": "43aktuell",
      "10": "44aktuell",
      "11": "44aktuell",
      "12": "44aktuell"
    }

    //let periodenHash = periodeUndStatusProQuartal;
    if (periode === "monatlich") this.aktualisieren(belegNrMonatlich, normalisierteBuchungen, beginnOfYear);
    else this.aktualisieren(belegNrMonatlichProQuartal, normalisierteBuchungen, beginnOfYear);
  }
  private aktualisieren(periodenHash: Object, normalisierteBuchungen: NormalisierteBuchung[], beginnOfYear: Date) {
    let summenHash = this.getRowHashTable();
    //alle Perioden initialisieren------------------------------------------------------------------------------------------------------
    for (var index in periodenHash) {
      let periode = periodenHash[index];
      let ustvaRow = summenHash[periode] as UStVA;
      if (ustvaRow == undefined) {
        ustvaRow = this.getOrCreateRowById(periode);
        ustvaRow.setValue("Periode und Status", "aktuell");
        summenHash = this.getRowHashTable();
        ustvaRow.setDatum(
          new Date(beginnOfYear.getFullYear(), parseInt(index) - 1)
        );
      }
      ustvaRow.setValue("erstellt am", new Date());
      ustvaRow.setValue("21", 0);
      ustvaRow.setValue("81", 0);
      ustvaRow.setValue("35", 0);
      ustvaRow.setValue("36", 0);
      ustvaRow.setValue("66", 0);
      ustvaRow.setValue("83", 0);
    }

    //Summen für Formularfelder aus Buchungen berechnen---------------------------------------------------------------------------------
    for (let buchungRow of normalisierteBuchungen) {
      if ((buchungRow.getFileId() as string).substr(0, 4) !== "mwst") {
        switch (buchungRow.getValue("Gegenkonto")) {
          case "USt. in Rechnung gestellt":
            var monat = buchungRow.getValue("Monat bezahlt").toString();
            if (monat == "") break;//wenn nicht bezahlt wurde, muss bei Ist-Versteuerung keine Mehrwertsteuer bezahlt werden
            var periode = periodenHash[monat];
            if (periode == undefined) break;
            let ustvaRow = summenHash[periode] as UStVA;
            if (buchungRow.getDatum().getFullYear() === 2020 && parseInt(buchungRow.getValue("Monat").toString(), 10) >= 7) {
              //CoronaMwST: 16% in 35 und 36
              let aktuellerBetrag: number = Number(buchungRow.getValue("Betrag")) / 0.16;
              let aktuelleMwSt: number = Number(buchungRow.getValue("Betrag"));
              ustvaRow.set36(ustvaRow.get36() + aktuelleMwSt);
              let aktuelleSumme: number = ustvaRow.get35();
              ustvaRow.set35(aktuellerBetrag + aktuelleSumme);
            }
            else {
              //normale MwSt: 19% in 81
              var aktuellerBetrag = Number(buchungRow.getValue("Betrag")) / 0.19;
              var aktuelleSumme = ustvaRow.get81();
              ustvaRow.set81(aktuellerBetrag + aktuelleSumme);
            }
            break;
          case "Vorsteuer":
            var monat = buchungRow.getValue("Monat").toString();
            var periode = periodenHash[monat];
            if (periode == undefined) break;
            ustvaRow = summenHash[periode] as UStVA;
            var aktuellerBetrag = -Number(buchungRow.getValue("Betrag"));
            var aktuelleSumme = ustvaRow.get66();
            ustvaRow.setValue("66", aktuellerBetrag + aktuelleSumme);
            break;
          default:
            break;
        }
      }
    }
    //Feld 81 runden Feld 83 berechnen
    for (var index in periodenHash) {
      var periode = periodenHash[index];
      let ustvaRow = summenHash[periode] as UStVA;
      ustvaRow.setValue("81", Math.floor(ustvaRow.get81()));
      ustvaRow.setValue("83", ustvaRow.get81() * 0.19 + ustvaRow.get36() - ustvaRow.get66());
    }
  }
}
export class EURTableCache extends TableCache<EUR> {
  private kontenSpalten: Object;
  constructor(rootId: string) {
    super(rootId, ooTables.EÜRD);
  }
  public getRowByIndex(rowIndex: string): EUR {
    return new EUR(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
  public setKontenSpalten(geschaeftsjahr: number) {
    this.kontenSpalten = {
      "1": "Januar",
      "2": "Februar",
      "3": "März",
      "4": "April",
      "5": "Mai",
      "6": "Juni",
      "7": "Juli",
      "8": "August",
      "9": "September",
      "10": "Oktober",
      "11": "November",
      "12": "Dezember",
      "-1": (geschaeftsjahr - 1).toString(),
      "-2": (geschaeftsjahr - 2).toString(),
      "-3": (geschaeftsjahr - 3).toString(),
      "-4": "Vorjahre",
      "13": (geschaeftsjahr + 1).toString(),
    };
  }
  public getKontenSpalten(): Object {
    return this.kontenSpalten;
  }
  public eurSummenAktualisieren(normalisierteBuchungen: NormalisierteBuchung[]) {
    this.deleteAll();
    //ZN spalte befüllen
    for (let buchungRow of normalisierteBuchungen) {
      let zn = buchungRow.getZN();
      if (buchungRow.getZN() === "") zn = "keine ZN";
      let znRow = this.getOrCreateRowById(zn);
      //Kontenspalte befüllen
      let monat: string = buchungRow.getMonatbezahlt().toString();
      if (monat !== "") {
        let kontenSpalte = this.getKontenSpalten()[monat];
        //Beträge summieren
        let aktuellerBetrag = Number(buchungRow.getValue("Betrag"));
        let aktuelleSumme = Number(znRow.getValue(kontenSpalte));
        if (isNaN(aktuelleSumme)) aktuelleSumme = 0;
        znRow.setValue(kontenSpalte, aktuellerBetrag + aktuelleSumme);
        let gesamtSumme = Number(znRow.getValue("Summe"));
        if (isNaN(gesamtSumme)) gesamtSumme = 0;
        if (parseInt(monat) > 0 && parseInt(monat) < 13) znRow.setValue("Summe", aktuellerBetrag + gesamtSumme);
      }
    }
  }
}
export class NormalisierteBuchungenTableCache extends TableCache<NormalisierteBuchung> {
  constructor(rootId: string) {
    super(rootId, ooTables.BuchungenD);
  }
  public getRowByIndex(rowIndex: string): NormalisierteBuchung {
    return new NormalisierteBuchung(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
  public kontenStammdatenAktualisieren(kontenTableCache: KontenTableCache) {
    const buchungen = this.getRowArray() as NormalisierteBuchung[];
    buchungen.forEach(buchung => {
      let kontoString: string = buchung.getKonto().toString();
      let konto: Konto = kontenTableCache.getRowHashTable()[kontoString] as Konto;
      if (!konto) {
        if (buchung.getKonto() === "") throw new Error(buchung.getFileId() + buchung.getText() + buchung.getQuelltabelle() + buchung.getLink());
        konto = kontenTableCache.getOrCreateRowById(buchung.getKonto());
        if (konto.isDatenschluerferKonto()) {
          let skrKonto: Konto = kontenTableCache.getOrCreateHashTable("SKR03")[kontoString.substring(1)] as Konto;
          if (skrKonto) {
            konto.setKontentyp(skrKonto.getKontentyp());
            konto.setSubtyp("Z" + skrKonto.getSubtyp());
            konto.setGruppe(skrKonto.getGruppe());
            konto.setSKR03(skrKonto.getSKR03());
            konto.setFormula("SKR04", `=VLOOKUP(INDIRECT("R[0]C[-1]";false);'SKR04'!$A$1:$C$1443;2)`);
            konto.setFormula("Exportgruppe", `=VLOOKUP(INDIRECT("R[0]C[-2]";false);'SKR04'!$A$1:$C$1443;3)`);
            konto.setFormula("ZN", `=DSUM($E$7:$L$1000;"Summe";{"SKR03";INDIRECT("R[0]C[-6]";false)})-2*INDIRECT("R[0]C[1]";false)`);
          } else {
            konto.setKontentyp("unbekannt");
            konto.setSKR03(kontoString.substring(1));
            konto.setFormula("ZN", `=DSUM($E$7:$L$1000;"Summe";{"SKR03";INDIRECT("R[0]C[-6]";false)})-2*INDIRECT("R[0]C[1]";false)`);
          }
        }
      }
      buchung.setKontentyp(konto.getKontentyp());
      buchung.setSubtyp(konto.getSubtyp());
      buchung.setGruppe(konto.getGruppe());
      buchung.setSKR03(konto.getSKR03());
      buchung.setFormular(konto.getFormular());
      buchung.setZN(konto.getZN());
    })
  }
}
export class ElsterTransferTableCache extends TableCache<ElsterTransfer> {
  constructor(rootId: string) { super(rootId, ooTables.ElsterTransferD); }
  public getRowByIndex(rowIndex: string): ElsterTransfer {
    return new ElsterTransfer(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class LastschriftmandatTableCache extends TableCache<Lastschriftmandat>{
  constructor(rootId: string) { super(rootId, ooTables.LastschriftmandatD); }
  public getRowByIndex(rowIndex: string): Lastschriftmandat {
    return new Lastschriftmandat(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class LastschriftenTableCache extends TableCache<Lastschrift>{
  constructor(rootId: string) { super(rootId, ooTables.LastschriftenD); }
  public getRowByIndex(rowIndex: string): Lastschrift {
    return new Lastschrift(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class LastschriftproduktTableCache extends TableCache<Lastschriftprodukt>{
  constructor(rootId: string) { super(rootId, ooTables.LastschriftproduktD); }
  public getRowByIndex(rowIndex: string): Lastschriftprodukt {
    return new Lastschriftprodukt(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class CSVTableCache extends TableCache<CSVExport>{
  constructor(rootId: string) { super(rootId, ooTables.CSVExportD); }
  public getRowByIndex(rowIndex: string): CSVExport {
    return new CSVExport(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class GdpduTableCache extends TableCache<Gdpdu>{
  constructor(rootId: string) { super(rootId, ooTables.GdpduD); }
  public getRowByIndex(rowIndex: string): Gdpdu {
    return new Gdpdu(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}
export class DataFileTableCache extends TableCache<DataFile>{
  constructor(rootId: string) { super(rootId, ooTables.DataFileD); }
  public getRowByIndex(rowIndex: string): DataFile {
    return new DataFile(this.dataArray[0] as Array<string>, this.dataArray[rowIndex], this.formulaArray[rowIndex], this.backgroundArray[rowIndex], this.columnIndex);
  }
}

//EMAil
export class EMailId extends TableRow {
  public getZeitstempel() { return this.getValue("Zeitstempel"); }
  public setZeitstempel(value) { this.setValue("Zeitstempel", value); }
  public getEMail() { return this.getValue("E-Mail").toString(); }
  public setEMail(value) { this.setValue("E-Mail", value); }
  public getAuswahl() { return this.getValue("Auswahl"); }
  public setAuswahl(value) { this.setValue("Auswahl", value); }
  public getVorlage() { return this.getValue("Vorlage"); }
  public setVorlage(value) { this.setValue("Vorlage", value); }
  public getAnrede() { return this.getValue("Anrede"); }
  public setAnrede(value) { this.setValue("Anrede", value); }
  public getVorname() { return this.getValue("Vorname"); }
  public setVorname(value) { this.setValue("Vorname", value); }
  public getNachname() { return this.getValue("Nachname"); }
  public setNachname(value) { this.setValue("Nachname", value); }
  public getTelefonnummer() { return this.getValue("Telefonnummer"); }
  public setTelefonnummer(value) { this.setValue("Telefonnummer", value); }
  public getAdresse() { return this.getValue("Adresse"); }
  public setAdresse(value) { this.setValue("Adresse", value); }
  public getGeschlecht() { return this.getValue("Geschlecht"); }
  public setGeschlecht(value) { this.setValue("Geschlecht", value); }
  public getGeburtstag() { return this.getValue("Geburtstag"); }
  public setGeburtstag(value) { this.setValue("Geburtstag", value); }
  public getInteressen() { return this.getValue("Interessen"); }
  public setInteressen(value) { this.setValue("Interessen", value); }
  public getFähigkeiten() { return this.getValue("Fähigkeiten"); }
  public setFähigkeiten(value) { this.setValue("Fähigkeiten", value); }
  public getStatus() { return this.getValue("Status"); }
  public setStatus(value) { this.setValue("Status", value); }
}
//Abstrakte Fassaden für Buchungssätze ---------------------------------------------------------------------------------
export class FinanzAction extends TableRow {
  public getBetrag(): number { return this.getValue("Betrag") as number; }
  public setBetrag(value: number) { this.setValue("Betrag", value); }
  public getDatum() { return this.getValueAsDate("Datum"); }
  public setDatum(value: any) { this.setValue("Datum", value); }
  public getKonto(): string { return this.getValue("Konto").toString() }
  public setKonto(value: string) { this.setValue("Konto", value); }
  public getText() { return this.getValue("Text").toString(); }
  public setText(text: string) { this.setValue("Text", text); }
}
export class Buchung extends FinanzAction {
  public getGegenkonto() { return this.getValue("Gegenkonto").toString(); }
  public setGegenkonto(konto: string) { this.setValue("Gegenkonto", konto); }
  public getLink(): string { return this.getFormula("Link"); }
  public setLink(link: string) { this.setFormula("Link", link); }
  public createLink(id: string, name: string) { this.setFormula("Link", "=HYPERLINK(\"https://drive.google.com/file/d/" + id + "\";\"" + name + "\")"); }
  protected monat: number;
  protected monatBezahlt: Number | "offen" = "offen";

}
export class Umbuchung extends Buchung {
  public getNettoBetragMitVorzeichen() { return this.getBetragMitVorzeichen() };
  public getBetragMitVorzeichen() { return -this.getBetrag() };
  public getFileId() { return this.getValue("ID").toString(); }
  public setFileId(value: string) { this.setValue("ID", value); }
  public getBezahltAm() { return this.getValueAsDate("bezahlt am"); }
  public setBezahltAm(datum: Date) { this.setValue("bezahlt am", datum); }
  public nichtBezahlt(): boolean { return this.getValue("bezahlt am") === ""; }
  public isBezahlt(): boolean { return !this.nichtBezahlt(); }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date, quellTabelle: string) {
    this.monat = belegMonat(geschaeftsjahr, this.getDatum());
    if (this.monat === null) this.monat = Number.NaN;
    if (this.isBezahlt()) this.monatBezahlt = bezahltMonat(geschaeftsjahr, this.getBezahltAm());

    //Buchung auf Konto
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(this.getNettoBetragMitVorzeichen());
    normBuchung.setKonto(this.getKonto());

    //Buchung auf Gegenkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(-this.getNettoBetragMitVorzeichen());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }
  protected copyFields(quellTabelle: string, normBuchung: NormalisierteBuchung) {
    normBuchung.setFileId(this.getId());
    normBuchung.setLink(this.getLink());
    normBuchung.setDatum(this.getDatum());
    normBuchung.setbezahltam(this.getBezahltAm());
    normBuchung.setText(this.getText().toString());
    normBuchung.setMonat(this.monat);
    normBuchung.setMonatbezahlt(this.monatBezahlt);
    normBuchung.setQuelltabelle(quellTabelle);
  }
}
export class Rechnung extends Umbuchung {
  public getBetrag() { return this.getValue("brutto Betrag") as number; }
  public setBetrag(value: any) { this.setValue("brutto Betrag", value); }
  public getBetragMitVorzeichen() { return this.getBetrag() };
  public getNettoBetragMitVorzeichen() { return this.getNettoBetrag() };
  public getNettoBetrag() { return this.getValue("netto Betrag") as number; }
  public setNettoBetrag(betrag: number) { this.setValue("netto Betrag", betrag); }
  public getMehrwertsteuer() { return this.getValue("Summe Umsatzsteuer") as number; }
  public setMehrwertsteuer(value: any) { this.setValue("Summe Umsatzsteuer", value); }
  public getDateiTyp() { return this.getValue("Dateityp").toString(); }
  public setDateiTyp(dateityp: string) { this.setValue("Dateityp", dateityp); }
}
//Fassade der Tabellen in Einnahmen
export class EinnahmenRechnung extends Rechnung {
  constructor(titleRow: Array<string>, valueRow: Array<string | number | Date | boolean>, formulaRow: Array<string>, backgroundRow: Array<string>, columnIndex: {}, formatRow: Array<string>) {
    super(titleRow, valueRow, formulaRow, backgroundRow, columnIndex)
    this.formatRow = formatRow;
  }
  public getText() { return this.getKonto() + " " + this.getNettoBetragMitVorzeichen() + " €" }
  public getKonto() { return "Leistung:" + this.getValue("Name"); }
  public getStatus() { return this.getValue("Status"); }
  public setStatus(value: any) { this.setValue("Status", value); }
  public getRechnungsNr() { return this.getValue("Rechnungs-Nr"); }
  public setRechnungsNr(value: any) { this.setValue("Rechnungs-Nr", value); }
  public getName() { return this.getValue("Name"); }
  public setName(value: any) { this.setValue("Name", value); }
  public getLeistungvon() { return this.getValueAsDate("Leistung von"); }
  public setLeistungvon(value: any) { this.setValue("Leistung von", value); }
  public getLeistungbis() { return this.getValueAsDate("Leistung bis"); }
  public setLeistungbis(value: any) { this.setValue("Leistung bis", value); }
  public getNettoBetrag() { return this.getValue("Summe netto") as number; }
  public setNettoBetrag(value: any) { this.setValue("Summe netto", value); }
  public getBetrag() { return this.getValue("Rechnungsbetrag") as number; }
  public setBetrag(value: any) { this.setValue("Rechnungsbetrag", value); }
  public getBestellnummer() { return this.getValue("Bestellnummer"); }
  public setBestellnummer(value: any) { this.setValue("Bestellnummer", value); }
  public getAdresszusatz() { return this.getValue("Adresszusatz"); }
  public setAdresszusatz(value: any) { this.setValue("Adresszusatz", value); }
  public getStrasse() { return this.getValue("Strasse"); }
  public setStrasse(value: any) { this.setValue("Strasse", value); }
  public getHausnummer() { return this.getValue("Hausnummer"); }
  public setHausnummer(value: any) { this.setValue("Hausnummer", value); }
  public getPLZ() { return this.getValue("PLZ"); }
  public setPLZ(value: any) { this.setValue("PLZ", value); }
  public getOrt() { return this.getValue("Ort"); }
  public setOrt(value: any) { this.setValue("Ort", value); }
  public getLand() { return this.getValue("Land"); }
  public setLand(value: any) { this.setValue("Land", value); }
  public getEMail() { return this.getValue("E-Mail"); }
  public setEMail(value: any) { this.setValue("E-Mail", value); }
  public getGruss() { return this.getValue("Gruß"); }
  public setGruss(value: any) { this.setValue("Gruß", value); }
  public getAnrede() { return this.getValue("Anrede"); }
  public setAnrede(value: any) { this.setValue("Anrede", value); }
  public getVorname() { return this.getValue("Vorname"); }
  public setVorname(value: any) { this.setValue("Vorname", value); }
  public getNachname() { return this.getValue("Nachname"); }
  public setNachname(value: any) { this.setValue("Nachname", value); }
  public getGeburtsdatum() { return this.getValue("Geburtsdatum"); }
  public setGeburtsdatum(value: any) { this.setValue("Geburtsdatum", value); }
  public getUStIdNr() { return this.getValue("USt-IdNr"); }
  public setUStIdNr(value: any) { this.setValue("USt-IdNr", value); }
  public getDokumententyp() { return this.getValue("Dokumententyp"); }
  public setDokumententyp(value: any) { this.setValue("Dokumententyp", value); }
  public getZahlungsziel() { return this.getValue("Zahlungsziel"); }
  public setZahlungsziel(value: any) { this.setValue("Zahlungsziel", value); }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Rechnung";
    super.addToTableCache(tableCache, geschaeftsjahr, quellTabelle);

    //Buchung Mehrwertsteuer auf USt. in Rechnung gestellt
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(this.getMehrwertsteuer());
    //Kontenstammdaten werden später ergänzt
    normBuchung.setKonto("USt. in Rechnung gestellt");

    //Buchung Mehrwertsteuer auf Bilanzkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(-this.getMehrwertsteuer());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }

}
export class Kunde extends TableRow {
  farbeAuswahlJa() {
  }
  public getFolderId() { return this.getValue("ID"); }
  public setFolderId(value: string) { this.setValue("ID", value); }

  public getLink(): string { return this.getFormula("Link"); }
  public setLink(link: string) { this.setFormula("Link", link); }
  public createLink(id: string, name: string) { this.setFormula("Link", "=HYPERLINK(\"https://drive.google.com/drive/folders/" + id + "\";\"" + name + "\")"); }

  public getAktuellesDokument() { return this.getFormula("Aktuelles Dokument"); }
  public setAktuellesDokument(value) { this.setFormula("Aktuelles Dokument", value); }
  public createAktuellesDokument(id: string, name: string) { this.setFormula("Aktuelles Dokument", "=HYPERLINK(\"https://drive.google.com/file/d/" + id + "\";\"" + name + "\")"); }

  public getAuswahl() { return this.getValue("Auswahl"); }
  public setAuswahl(value) { this.setValue("Auswahl", value); }
  public getName() { return this.getValue("Name"); }
  public setName(value) { this.setValue("Name", value); }
  public getEMail() { return this.getValue("E-Mail"); }
  public setEMail(value) { this.setValue("E-Mail", value); }
  public getTelefon() { return this.getValue("Telefon"); }
  public setTelefon(value) { this.setValue("Telefon", value); }
  public getStrasse() { return this.getValue("Strasse"); }
  public setStrasse(value) { this.setValue("Strasse", value); }
  public getHausnummer() { return this.getValue("Hausnummer"); }
  public setHausnummer(value) { this.setValue("Hausnummer", value); }
  public getAdresszusatz() { return this.getValue("Adresszusatz"); }
  public setAdresszusatz(value) { this.setValue("Adresszusatz", value); }
  public getPLZ() { return this.getValue("PLZ"); }
  public setPLZ(value) { this.setValue("PLZ", value); }
  public getOrt() { return this.getValue("Ort"); }
  public setOrt(value) { this.setValue("Ort", value); }
  public getLand() { return this.getValue("Land"); }
  public setLand(value) { this.setValue("Land", value); }
  public getGruß() { return this.getValue("Gruß"); }
  public setGruß(value) { this.setValue("Gruß", value); }
  public getAnrede() { return this.getValue("Anrede"); }
  public setAnrede(value) { this.setValue("Anrede", value); }
  public getVorname() { return this.getValue("Vorname"); }
  public setVorname(value) { this.setValue("Vorname", value); }
  public getNachname() { return this.getValue("Nachname"); }
  public setNachname(value) { this.setValue("Nachname", value); }
  public getGeburtsdatum() { return this.getValue("Geburtsdatum"); }
  public setGeburtsdatum(value) { this.setValue("Geburtsdatum", value); }
  public getOrganisation() { return this.getValue("Organisation"); }
  public setOrganisation(value) { this.setValue("Organisation", value); }
  public getBank() { return this.getValue("Bank"); }
  public setBank(value) { this.setValue("Bank", value); }
  public getIBAN() { return this.getValue("IBAN"); }
  public setIBAN(value) { this.setValue("IBAN", value); }
  public getUStIdNr() { return this.getValue("USt-IdNr"); }
  public setUStIdNr(value) { this.setValue("USt-IdNr", value); }
  public getWebadresse() { return this.getValue("Webadresse"); }
  public setWebadresse(value) { this.setValue("Webadresse", value); }
}
export class Produkt extends TableRow {

}
export class Gutschrift extends Rechnung {
  public getKonto() { return "Leistung:" + this.getValue("Name"); }
  public getName() { return this.getValue("Name"); }
  public setName(value: string) { this.setValue("Name", value); }
  public getStatus() { return this.getValue("Status"); }
  public setStatus(value: any) { this.setValue("Status", value); }
  public getNettoBetrag() { return this.getValue("Summe netto") as number; }
  public setNettoBetrag(value: any) { this.setValue("Summe netto", value); }
  public getBetrag() { return this.getValue("Gutschriftbetrag") as number; }
  public setBetrag(value: any) { this.setValue("Gutschriftbetrag", value); }
  public getText() { return this.getDokumententyp(); }
  public setText(text: string) { this.setDokumententyp(text); }

  public getDokumententyp() { return this.getValue("Dokumententyp").toString(); }
  public setDokumententyp(value: any) { this.setValue("Dokumententyp", value); }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Gutschrift";
    super.addToTableCache(tableCache, geschaeftsjahr, quellTabelle);

    //Buchung Mehrwertsteuer auf USt. in Rechnung gestellt
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(this.getMehrwertsteuer());
    //Kontenstammdaten werden später ergänzt
    normBuchung.setKonto("USt. in Rechnung gestellt");

    //Buchung Mehrwertsteuer auf Bilanzkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(-this.getMehrwertsteuer());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }

}
export class EURechnung extends EinnahmenRechnung {
  public getBetragMitVorzeichen() { return this.getBetrag() };
  public getNettoBetragMitVorzeichen() { return this.getBetragMitVorzeichen() };
  public getBetrag() { return this.getValue("Rechnungsbetrag") as number; }
  public getText() { return this.getKonto() + " " + this.getBetrag() + " €" }
  public getKonto() { return "Leistung:" + this.getValue("USt-IdNr"); }

  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "EURechnung";
    this.monat = belegMonat(geschaeftsjahr, this.getDatum());
    if (this.monat === null) this.monat = Number.NaN;
    if (this.isBezahlt()) this.monatBezahlt = bezahltMonat(geschaeftsjahr, this.getBezahltAm());

    //Buchung auf Konto
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(this.getNettoBetragMitVorzeichen());
    normBuchung.setKonto(this.getKonto());

    //Buchung auf Gegenkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(-this.getNettoBetragMitVorzeichen());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());
  }

}
export class RechnungSchreiben extends TableRow {
  constructor(titleRow: Array<string>, valueRow: Array<string | number | Date | boolean>, formulaRow: Array<string>, backgroundRow: Array<string>, columnIndex: {}, formatRow: Array<string>) {
    super(titleRow, valueRow, formulaRow, backgroundRow, columnIndex)
    this.formatRow = formatRow;
  }
  public getBeschreibung() { return this.getValue("Beschreibung"); }
  public setBeschreibung(value) { this.setValue("Beschreibung", value); }
  public getMenge() { return this.getValue("Menge"); }
  public setMenge(value) { this.setValue("Menge", value); }
  public getEinheit() { return this.getValue("Einheit"); }
  public setEinheit(value) { this.setValue("Einheit", value); }
  public getEinzelpreis() { return this.getValue("Einzelpreis"); }
  public setEinzelpreis(value) { this.setValue("Einzelpreis", value); }
  public getUSt() { return this.getValue("USt.%"); }
  public setUSt(value) { this.setValue("USt.%", value); }
  public getNettobetrag() { return this.getValue("Nettobetrag"); }
  public setNettobetrag(value) { this.setValue("Nettobetrag", value); }
  public getUStBetrag() { return this.getValue("USt. Betrag"); }
  public setUStBetrag(value) { this.setValue("USt. Betrag", value); }
}
export class PositionenArchiv extends TableRow {

}
//Fassade der Tabellen in Ausgaben
export class AusgabenRechnung extends Rechnung {
  public getMehrwertsteuer() { return this.getValue("Vorsteuer") as number; }
  public setMehrwertsteuer(betrag: number) { this.setValue("Vorsteuer", betrag); }
  public getBetragMitVorzeichen() { return -this.getBetrag() };
  public getNettoBetragMitVorzeichen() { return -this.getNettoBetrag() };
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Ausgabe";
    super.addToTableCache(tableCache, geschaeftsjahr, quellTabelle);

    //Buchung Vorsteuer auf Vorsteuer
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(-this.getMehrwertsteuer());
    //Kontenstammdaten werden später ergänzt
    normBuchung.setKonto("Vorsteuer");

    //Buchung Vorsteuer auf Bilanzkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(this.getMehrwertsteuer());
    //Kontenstammdaten werden später ergänzt
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }

}
export class Bewirtungsbeleg extends AusgabenRechnung {
  // public getFileId() { return this.getValue("ID"); }
  public setFileId(value: string) { this.setValue("ID", value); }
  public getKonto() { return "abziehbare Bewirtungskosten" };
  public getNettoBetragMitVorzeichen() { return -this.getAbziehbareBewirtungskosten() };

  public getTrinkgeld() { return this.getValue("Trinkgeld") as number; }
  public setTrinkgeld(betrag: number) { this.setValue("Trinkgeld", betrag); }
  public getAbziehbareBewirtungskosten() { return this.getValue("abziehbare Bewirtungskosten") as number; }
  public setAbziehbareBewirtungskosten(value: any) { this.setValue("abziehbare Bewirtungskosten", value); }
  public getNichtAbziehbareBewirtungskosten() { return this.getValue("nicht abziehbare Bewirtungskosten") as number; }
  public setNichtAbziehbareBewirtungskosten(value: any) { this.setValue("nicht abziehbare Bewirtungskosten", value); }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    super.addToTableCache(tableCache, geschaeftsjahr);

    //Buchung nicht abziehbare Bewirtungskosten
    let normBuchung = tableCache.createNewRow();
    this.copyFields("Bewirtungsbeleg", normBuchung);
    normBuchung.setBetrag(-this.getNichtAbziehbareBewirtungskosten());
    //Kontenstammdaten werden später ergänzt
    normBuchung.setKonto("nicht abziehbare Bewirtungskosten");

    //Buchung nicht abziehbare Bewirtungskosten auf Bilanzkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields("Bewirtungsbeleg", normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(this.getNichtAbziehbareBewirtungskosten());
    //Kontenstammdaten werden später ergänzt
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }

}
export class Abschreibung extends Umbuchung {
  public getBezahltAm() { return this.getDatum() };
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Abschreibung";
    this.monat = belegMonat(geschaeftsjahr, this.getDatum());
    this.monatBezahlt = bezahltMonat(geschaeftsjahr, this.getDatum());

    //Buchung auf Konto
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(-this.getBetrag());
    normBuchung.setKonto(this.getKonto());

    //Buchung auf Gegenkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(this.getBetrag());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());
  }
}
export class Verpflegungsmehraufwendung extends Umbuchung {
  public getBezahltAm() { return this.getDatum() };
  public getBetrag() { return this.getValue("Verpflegungsmehr-aufwendung") as number; }
  public getKonto() { return "Verpflegungsmehraufwendung" };
  public getGegenkonto() { return "bar" };
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Verpflegungsmehraufwendung";
    this.monat = belegMonat(geschaeftsjahr, this.getDatum());
    this.monatBezahlt = bezahltMonat(geschaeftsjahr, this.getDatum());

    //Buchung auf Konto
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(-this.getBetrag());
    normBuchung.setKonto(this.getKonto());

    //Buchung auf Gegenkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(this.getBetrag());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());
  }
}
export class Vertrag extends Umbuchung {
  public getBezahltAm() { return new Date(0); }
  public setBezahltAm(datum: Date) { this.setValue("Zahlungsdatum", this.getValue("Zahlungsdatum").toString() + "," + datum.toString()); }
  public nichtBezahlt(): boolean { return true; }
  public isBezahlt(): boolean { return !this.nichtBezahlt(); }
  public getGegenkonto() { return this.getValue("Konto").toString() };
}
//Fassade der Tabellen in Bankbuchungen
export class Bankbuchung extends Umbuchung {
  public getKonto() { return this.getValue("Bilanzkonto").toString() }
  public setKonto(value: string) { this.setValue("Bilanzkonto", value); }
  public getGegenkonto() {
    let gegenkonto = super.getGegenkonto();
    if (gegenkonto === "") gegenkonto = "nicht zugeordnet";
    return gegenkonto;
  }
  public getBezahltAm() { return this.getDatum() };
  public getNr() { return this.getValue("Nr") }
  public setNr(value: string) { this.setValue("Nr", value); }
  public getBelegID() { return this.getValue("BelegID").toString() }
  public setBelegID(value: string) { this.setValue("BelegID", value); }
  public getGegenkontoBank() { return this.getValue("GegenkontoBank") }
  public setGegenkontoBank(value: string) { this.setValue("GegenkontoBank", value); }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = "Bankbuchung";
    this.monat = belegMonat(geschaeftsjahr, this.getDatum());
    this.monatBezahlt = bezahltMonat(geschaeftsjahr, this.getDatum());

    //Buchung auf Konto
    let normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    normBuchung.setBetrag(-this.getBetrag());
    normBuchung.setKonto(this.getKonto());

    //Buchung auf Gegenkonto
    normBuchung = tableCache.createNewRow();
    this.copyFields(quellTabelle, normBuchung);
    //Vorzeichen wechseln
    normBuchung.setBetrag(this.getBetrag());
    //Konto wechseln
    normBuchung.setKonto(this.getGegenkonto());

  }
  protected copyFields(quellTabelle: string, normBuchung: NormalisierteBuchung) {
    let id = this.getBelegID();
    if (id === "") id = this.getId();
    normBuchung.setFileId(id);
    normBuchung.setLink(this.getLink());
    normBuchung.setDatum(this.getDatum());
    normBuchung.setbezahltam(this.getDatum());
    normBuchung.setText(this.getText());
    normBuchung.setMonat(this.monat);
    normBuchung.setMonatbezahlt(this.monatBezahlt);
    normBuchung.setQuelltabelle(quellTabelle);
  }

}
// Fassade der Tabelle in Datenschlürfer für import in NormalisierteBuchung
export class Gdpdu extends Umbuchung {
  public getId() { return this.getValue("Beleg-Nr").toString() }
  public getLink() { return super.getId() }
  public getDatum(): Date { return this.getValueAsDate("Bg-Datum") }
  public getBezahltAm() { return this.getDatum() }
  public getText() { return this.getValue("Buchungstext").toString() }
  public getKonto() { return "G" + this.getValue("Konto-Nr") }
  public getGegenkonto() { return "G" + super.getGegenkonto() }
  public getFilename() { return this.getValue("Filename").toString() }
  public getNettoBetragMitVorzeichen() {
    if (this.getValue("SoFkt").toString() === "2")
    //richtig wäre hier "-super.getNettoBetragMitVorzeichen()"
    //indem hier 0 verwendet wird, wird aus der Steuerbilanz (bei richtiger Verrechnung) die Handelsbilanz
    //ob das in jedem Fall funktioniert (d.h. ob dieses Kennzeichnen tatsächlich immer nur verwendet wird um aus der Handelsbilanz die Steuerbilanz zu erstellen)
    //sollte mit weiteren Jahresabschlüssen geprüft werden
      return 0;
    else
      return super.getNettoBetragMitVorzeichen();
  }
  public addToTableCache(tableCache: NormalisierteBuchungenTableCache, geschaeftsjahr: Date) {
    const quellTabelle = this.getFilename();
    super.addToTableCache(tableCache, geschaeftsjahr, quellTabelle);
  }
  protected copyFields(quellTabelle: string, normBuchung: NormalisierteBuchung) {
    super.copyFields(quellTabelle, normBuchung);
    normBuchung.setValue("ID", this.getId());
  }
}

//Fassade der Tabellen in Steuern EÜR
//Fassade der Tabellen in Bilanz und GuV
export class Konto extends TableRow {
  public getId() { return this.getValue("Konto").toString(); }
  public setId(value: string) { this.setValue("Konto", value); }
  public getKontentyp() { return this.getValue("Kontentyp").toString(); }
  public setKontentyp(value: any) { this.setValue("Kontentyp", value); }
  public getSubtyp(): string { return this.getValue("Subtyp").toString(); }
  public setSubtyp(value: any) { this.setValue("Subtyp", value); }
  public getGruppe() { return this.getValue("Gruppe").toString(); }
  public setGruppe(value: any) { this.setValue("Gruppe", value); }
  public getKonto() { return this.getValue("Konto").toString(); }
  public setKonto(value: any) { this.setValue("Konto", value); }
  public getSKR03() { return this.getValue("SKR03"); }
  public setSKR03(value: any) { this.setValue("SKR03", value); }
  public getExportgruppe() { return this.getValue("Exportgruppe"); }
  public setExportgruppe(value: any) { this.setValue("Exportgruppe", value); }
  public getBeispiel() { return this.getValue("Beispiel"); }
  public setBeispiel(value: any) { this.setValue("Beispiel", value); }
  public getQuelle() { return this.getValue("Quelle"); }
  public setQuelle(value: any) { this.setValue("Quelle", value); }
  public getFormular() { return this.getValue("Formular"); }
  public setFormular(value: any) { this.setValue("Formular", value); }
  public getZN() { return this.getValue("ZN"); }
  public setZN(value: any) { this.setValue("ZN", value); }
  public isAnlage(): boolean { return this.getGruppe() === "Anlage"; }
  public isBilanzkonto(): boolean { return this.getKontentyp() === "Bilanz"; }
  public isBankkonto(): boolean { return this.getGruppe() === "Bankkonto"; }
  public getSumme() { return this.getValue("Summe") as number; }
  public getDefaultMwSt() { return this.getGruppe().split(",")[1]; }
  public isDatenschluerferKonto(): boolean { return this.getKonto().substr(0, 1) === "G" && /^\d+$/.test(this.getKonto().substr(1)) }
}
export class UStVA extends TableRow {
  public getFileId() { return this.getValue("ID"); }
  public setFileId(value: string) { this.setValue("ID", value); }
  public getLink() { return this.getValue("Link"); }
  public setLink(value) { this.setValue("Link", value); }
  public getDatum() { return this.getValueAsDate("Datum"); }
  public setDatum(value) { this.setValue("Datum", value); }
  public getKonto() { return this.getValue("Konto"); }
  public setKonto(value) { this.setValue("Konto", value); }
  public getBetrag() { return this.getValue("Betrag"); }
  public setBetrag(value) { this.setValue("Betrag", value); }
  public getGegenkonto() { return this.getValue("Gegenkonto"); }
  public setGegenkonto(value) { this.setValue("Gegenkonto", value); }
  public getbezahltam() { return this.getValue("bezahlt am"); }
  public setbezahltam(value) { this.setValue("bezahlt am", value); }
  public getPeriodeundStatus() { return this.getValue("Periode und Status"); }
  public setPeriodeundStatus(value) { this.setValue("Periode und Status", value); }
  public geterstelltam() { return this.getValue("erstellt am"); }
  public seterstelltam(value) { this.setValue("erstellt am", value); }
  public get21() { return this.getValue("21") as number; }
  public set21(value: number) { this.setValue("21", value); }
  public get81() { return this.getValue("81") as number; }
  public set81(value: number) { this.setValue("81", value); }
  public get48() { return this.getValue("48") as number; }
  public set48(value: number) { this.setValue("48", value); }
  public get35() { return this.getValue("35") as number; }
  public set35(value: number) { this.setValue("35", value); }
  public get36() { return this.getValue("36") as number; }
  public set36(value: number) { this.setValue("36", value); }
  public get66() { return this.getValue("66") as number; }
  public set66(value: number) { this.setValue("66", value); }
  public get83() { return this.getValue("83") as number; }
  public set83(value: number) { this.setValue("83", value); }
}
export class EUR extends TableRow {
  public getId() { return this.getValue("ZN").toString(); }
  public setId(value: string) { this.setValue("ZN", value); }
  public getZN() { return this.getValue("ZN"); }
  public setZN(value) { this.setValue("ZN", value); }
  public getSumme() { return this.getValue("Summe"); }
  public setSumme(value) { this.setValue("Summe", value); }
}
export class NormalisierteBuchung extends FinanzAction {
  public getFileId() { return this.getValue("ID").toString(); }
  public setFileId(value: string) { this.setValue("ID", value); }
  public getLink(): string { return this.getFormula("Link"); }
  public setLink(link: string) { this.setFormula("Link", link); }
  //public getDatum(){return this.getValue("Datum");}
  //public setDatum(value){this.setValue("Datum",value);}
  public getbezahltam() { return this.getValue("bezahlt am"); }
  public setbezahltam(value) { this.setValue("bezahlt am", value); }
  //public getBetrag(){return this.getValue("Betrag");}
  //public setBetrag(value){this.setValue("Betrag",value);}
  //public getText(){return this.getValue("Text");}
  //public setText(value){this.setValue("Text",value);}
  public getMonat() { return this.getValue("Monat"); }
  public setMonat(value) { this.setValue("Monat", value); }
  public getMonatbezahlt() { return this.getValue("Monat bezahlt"); }
  public setMonatbezahlt(value) { this.setValue("Monat bezahlt", value); }
  public getKontentyp() { return this.getValue("Kontentyp"); }
  public setKontentyp(value) { this.setValue("Kontentyp", value); }
  public getSubtyp() { return this.getValue("Subtyp"); }
  public setSubtyp(value) { this.setValue("Subtyp", value); }
  public getGruppe() { return this.getValue("Gruppe"); }
  public setGruppe(value) { this.setValue("Gruppe", value); }
  //Das ist wahrscheinlich falsch, Tabellenspalte muss semantisch "Konto" heißen
  //kann ich umstellen, wenn der ganze Code auf TS migriert ist
  public getKonto() { return this.getValue("Gegenkonto").toString(); }
  public setKonto(value) { this.setValue("Gegenkonto", value); }
  public getSKR03() { return this.getValue("SKR03"); }
  public setSKR03(value) { this.setValue("SKR03", value); }
  public getFormular() { return this.getValue("Formular"); }
  public setFormular(value) { this.setValue("Formular", value); }
  public getZN() { return this.getValue("ZN").toString(); }
  public setZN(value) { this.setValue("ZN", value); }
  public getQuelltabelle() { return this.getValue("Quelltabelle"); }
  public setQuelltabelle(value) { this.setValue("Quelltabelle", value); }
}
export class ElsterTransfer extends TableRow {
  public getdatum() { return this.getValue("datum"); }
  public setdatum(value) { this.setValue("datum", value); }
  public getemail() { return this.getValue("e-mail"); }
  public setemail(value) { this.setValue("e-mail", value); }
  public getperiode() { return this.getValue("periode"); }
  public setperiode(value) { this.setValue("periode", value); }
  public getdaten() { return this.getValue("daten"); }
  public setdaten(value) { this.setValue("daten", value); }
  public gettransferticket() { return this.getValue("transferticket"); }
  public settransferticket(value) { this.setValue("transferticket", value); }
  public getBelegDatum() { return this.getValue("beleg verschickt"); }
  public setBelegDatum(value) { this.setValue("beleg verschickt", value); }
}
export class Lastschriftmandat extends TableRow {
  public getZeitstempel() { return this.getValue("Zeitstempel"); }
  public setZeitstempel(value) { this.setValue("Zeitstempel", value); }
  public getProdukt() { return this.getValue("Produkt").toString(); }
  public setProdukt(value) { this.setValue("Produkt", value); }
  public getEMailAdresse() { return this.getValue("E-Mail-Adresse").toString(); }
  public setEMailAdresse(value) { this.setValue("E-Mail-Adresse", value); }
  public getKontoinhaber() { return this.getValue("Kontoinhaber"); }
  public setKontoinhaber(value) { this.setValue("Kontoinhaber", value); }
  public getStraßeundHausnummer() { return this.getValue("Straße und Hausnummer"); }
  public setStraßeundHausnummer(value) { this.setValue("Straße und Hausnummer", value); }
  public getPostleitzahl() { return this.getValue("Postleitzahl"); }
  public setPostleitzahl(value) { this.setValue("Postleitzahl", value); }
  public getOrt() { return this.getValue("Ort"); }
  public setOrt(value) { this.setValue("Ort", value); }
  public getIBAN() { return this.getValue("IBAN"); }
  public setIBAN(value) { this.setValue("IBAN", value); }
  public getBIC() { return this.getValue("BIC"); }
  public setBIC(value) { this.setValue("BIC", value); }
  public getNamederBank() { return this.getValue("Name der Bank"); }
  public setNamederBank(value) { this.setValue("Name der Bank", value); }
  public getVorname() { return this.getValue("Vorname"); }
  public setVorname(value) { this.setValue("Vorname", value); }
  public getNachname() { return this.getValue("Nachname"); }
  public setNachname(value) { this.setValue("Nachname", value); }
  public getErteilung() { return this.getValue("Erteilung"); }
  public setErteilung(value) { this.setValue("Erteilung", value); }
  public getStatus() { return this.getValue("Status"); }
  public setStatus(value) { this.setValue("Status", value); }
}
export class Lastschrift extends TableRow {
  public getLm() { return this.getValue("Lm").toString(); }
  public setLm(value) { this.setValue("Lm", value); }
  public getBetrag() { return this.getValue("Betrag"); }
  public setBetrag(value) { this.setValue("Betrag", value); }
  public getVerwendungszweck() { return this.getValue("Verwendungszweck"); }
  public setVerwendungszweck(value) { this.setValue("Verwendungszweck", value); }
  public getDatum() { return this.getValue("Datum"); }
  public setDatum(value) { this.setValue("Datum", value); }
  public getStatus() { return this.getValue("Status"); }
  public setStatus(value) { this.setValue("Status", value); }
}
export class Lastschriftprodukt extends TableRow {
  public getFormularname() { return this.getValue("Formularname"); }
  public setFormularname(value) { this.setValue("Formularname", value); }
  public getPreis() { return this.getValue("Preis"); }
  public setPreis(value) { this.setValue("Preis", value); }
  public getVerwendungszweck() { return this.getValue("Verwendungszweck"); }
  public setVerwendungszweck(value) { this.setValue("Verwendungszweck", value); }
}

export class CSVExport extends TableRow {
  setBelegNr(belegNr: string) {
    this.setValue("BelegNr", belegNr);
    //  this.setValue("BelegNr", shortBelegNr(belegNr));
  }
}
//Datenschlürfer
export class DataFile extends TableRow { }

//Hilfsfunktionen für noremalisierte Buchungen
function belegMonat(geschaeftsjahr: Date, belegDatum: Date) {
  if (belegDatum < geschaeftsjahr) {
    var result = belegDatum.getFullYear() - geschaeftsjahr.getFullYear();
    if (result < -4) result = -4;
    return result;
  } else {
    if (belegDatum.getFullYear() - geschaeftsjahr.getFullYear() > 0) return 13;
    return belegDatum.getMonth() + 1;
  }
}

function bezahltMonat(geschaeftsjahr: Date, bezahltDatum: Date) {
  if (bezahltDatum == undefined) return "offen";
  if (!(bezahltDatum instanceof Date)) return "offen";
  if (bezahltDatum < geschaeftsjahr) {
    var result = bezahltDatum.getFullYear() - geschaeftsjahr.getFullYear();
    if (result < -4) result = -4;
    return result;
  }
  else {
    if (bezahltDatum.getFullYear() - geschaeftsjahr.getFullYear() > 0) return 13;
    return bezahltDatum.getMonth() + 1;
  }
}


function rgbToHex(R, G, B) { return toHex(R) + toHex(G) + toHex(B) }
function toHex(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return "00";
  n = Math.max(0, Math.min(n, 255));
  return "0123456789ABCDEF".charAt((n - n % 16) / 16)
    + "0123456789ABCDEF".charAt(n % 16);
}
