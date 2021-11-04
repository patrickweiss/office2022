import { DriveConnector } from "./driveconnector";

export class TableCache<RowType extends TableRow> {
    dataArray: Object[][];
    backgroundArray: string[][];
    formulaArray: string[][];
    formatsArray: string[][];
    columnIndex: {};
    private loadRowCount: number;
    private fileId: string;
    private tableName: string;
    private rowHashTable;
    private columnHashTable = {};
    private rowArray: RowType[];
    constructor(fileId: string, tableName: string,columns?:string[]) {
        let data = {}
        if (columns){
            let newDataArray = [columns];
            let newFormulaArray = [new Array(newDataArray[0].length)];
            let newBackgroundArray = [Array.apply(null, Array(newDataArray[0].length)).map(String.prototype.valueOf, "white")];
            data = [newDataArray,newBackgroundArray,newFormulaArray,];
        }else  data = DriveConnector.getTableData(fileId,tableName)
        this.formatsArray = data[3];
        this.dataArray = data[0];
        this.backgroundArray = data[1];
        this.formulaArray = data[2];
        this.columnIndex = this.getColumnIndex(this.dataArray[0]);
        this.loadRowCount = this.dataArray.length;
        this.fileId = fileId;
        this.tableName = tableName;
    }
    public getData() {
        return [this.dataArray, this.backgroundArray, this.formulaArray, this.formatsArray];
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
        return new TableRow(this, rowIndex) as RowType;
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
            if (this.rowArray) delete this.rowArray;
            this.getRowHashTable();
        }
        return tableRow;
    }
    public save() {
        DriveConnector.saveTableData(this.fileId, this.tableName, this.loadRowCount, this.dataArray, this.backgroundArray, this.formulaArray);
    }
    public deleteAll() {
        this.dataArray = [this.dataArray[0]];
        this.formulaArray = [this.formulaArray[0]];
        this.backgroundArray = [this.backgroundArray[0]];
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
    private tableCache: TableCache<TableRow>;
    private index: string;
    constructor(tableCache: TableCache<TableRow>, tableCacheIndex: string) {
        if (tableCacheIndex == "0") throw new Error("TableRow with index 0 contains column names, no data");
        this.tableCache = tableCache;
        this.index = tableCacheIndex;
    }
    public getId() { return this.getDataArray()[0].toString(); }
    public setId(value: string) { this.getDataArray()[0] = value; }
    public getTitlesArray() { return this.tableCache.dataArray[0]; }
    public getDataArray() { return this.tableCache.dataArray[this.index]; }
    public getTitle(columnName: string) { return this.tableCache.dataArray[0][this.tableCache.columnIndex[columnName]].toString(); }
    public getValueStringOrNumber(columnName: string) {
        const value = this.tableCache.dataArray[this.index][this.tableCache.columnIndex[columnName]];
        if (typeof value === "string") {
            let a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
            if (a) {
                return this.getDateString(new Date(value));
            } else if (columnName === "ID" || columnName === "Nr") return value.substr(0, 5); else return value.substr(0, 20);
        }
        if (value instanceof Date) {
            return this.getDateString(value);
        }
        return value.toFixed(2).replace(".", ",");
    }
    public setValue(columnName: string, value: string | number | Date | Object) {
        this.tableCache.dataArray[this.index][this.tableCache.columnIndex[columnName]] = value;
    }
    public getValue(columnName: string) {
        return this.tableCache.dataArray[this.index][this.tableCache.columnIndex[columnName]];
    }
    public getFormat(columnName: string) {
        return this.tableCache.formatsArray[this.index][this.tableCache.columnIndex[columnName]];
    }
    public setFormula(columnName: string, value: string) {
        this.tableCache.formulaArray[this.index][this.tableCache.columnIndex[columnName]] = value;
    }
    protected getFormula(columnName: string) {
        return this.tableCache.formulaArray[this.index][this.tableCache.columnIndex[columnName]];
    }
    public setBackground(columnName: string, value: string) {
        this.tableCache.backgroundArray[this.index][this.tableCache.columnIndex[columnName]] = value;
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
