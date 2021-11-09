//Aktuelle version (die mit der höheren Nummer) und Vorgängerversion. Die Vorgängerversion wird benötigt, um daraus die Daten zu kopieren
export const developmentYear = "2021";
export enum ooVersions {
    oo58 = "0058",
    oo59 = "0059"
}
//Die Erhöhung der Versionsnummer triggert beim nächsten Aufruf der PWA das Update aller eigenen Instanzen von OfficOne 
export const currentOOversion = ooVersions.oo59;
export const codeVersion = "034";

//Master für "00 System - Version:0057", bisher keine Änderung seit Version 0057, es gibt noch keinen Update Mechanismus!!!
//https://docs.google.com/spreadsheets/d/1V07fdHjmW0eUDd2pwN-8r6sCwY0Cy2KQOSFgtNdmirU/edit#gid=0
export const clientSystemMasterId = "1V07fdHjmW0eUDd2pwN-8r6sCwY0Cy2KQOSFgtNdmirU"

export enum systemMasterProperty {
    //Muss bei jedem Update aktualisiert werden. Folder der alle Spreadsheet Templates enthält, die von Clients kopiert werden: 2021 My Business.Office 0059
    officeOne2022_TemplateFolderId = "1A2sq-EtAs-vrwPG026iKpanMfz9QAjha",
    //Bleibt ab Version 0059 für alle Produktivsystem Nutzer gleich. Erzwingt in Kombination mit "daily" ein Update aller Instanzen in der Nacht? (Testen)
    webApp_URL = "https://script.google.com/macros/s/AKfycbxiMhdxDyK0IZFV2ZfRbL4bAlF0fOELD0Da2QlvCmuVtYrT-5M/exec"
}

export enum subscriptionPostActions {
    deleteTrigger="deleteTrigger",
    installTrigger="installTrigger"
}

//Konfigurationsvariablen die in "00 Office" definiert sein müssen
export enum office {
    fehlerEmail = "fehlerEmail",
    geschaeftsjahr = "zeitraumJahr",
    taxNumberOffice = "taxNumberOffice",
    taxNumberDistrict = "taxNumberDistrict",
    taxNumberDistinctionNumber = "taxNumberDistinctionNumber",
    firma = "bezeichnung",
    name = "name",
    vorname = "vorname",
    strasse = "strasse",
    hausnummer = "hausnummer",
    hNrZusatz = "hNrZusatz",
    anschriftenZusatz = "anschriftenZusatz",
    plz = "plz",
    ort = "ort",
    telefon = "telefon",
    email = "email",
    bank = "bank",
    iban = "iban",
    triggerMode = "triggerMode",
    officeRootID_FolderId = "officeRootID_FolderId",
    vorjahrOfficeRootID_FolderId = "vorjahrOfficeRootID_FolderId",
}

export const adminUser = "eins.stein@officeone.team";
export const subscribeRestEndpoint = "https://script.google.com/macros/s/AKfycbzeBsJ_exOfJjhUtbHeCLEbTFoLspd5GfTrKTGqi6CzDF_9lKJr/exec";


// MWSt, Konstanten für Konten und Belegnummern von definierten Abschlussbuchungen

export enum konto {
    Umsatz9310 = "Umsatz9310",
    Umsatz9313 = "Umsatz9313",
    USt_in_Rechnunggestellt = "USt. in Rechnung gestellt",
    Umsatzsteuer19 = "Umsatzsteuer19",
    Umsatzsteuer16 = "Umsatzsteuer16",
    Umsatzsteuer_laufendes_Jahr = "Umsatzsteuer laufendes Jahr",
    Umsatz9300 = "Umsatz9300",
    Vorsteuer = "Vorsteuer",
    UStVA = "UStVA",
    Umsatz9312 = "Umsatz9312",
    Umsatzsteuerforderungen="Umsatzsteuerforderungen",
    Umsatzsteuer_Vorjahr="Umsatzsteuer Vorjahr"
}
export enum belegNr {
    //Die nicht in Simba Export laufende Buchungen
    mwstOP = "mwstOP",
    mwstUStVAAufVMwSt = "mwstUStVAAufVMwSt",
    mwstVorsteuerAufVMwSt = "mwstVorsteuerAufVMwSt",
    mwstUmsatzsteuer19AufVMwSt = "mwstUmsatzsteuer19AufVMwSt",
    mwstUmsatzsteuer16AufVMwSt = "mwstUmsatzsteuer16AufVMwSt",
    //Die müssen in Simba Export laufende Buchungen 
    mwstIstUmsatz0 = "mwstIstUmsatz0",
    mwstIstUmsatz19 = "mwstIstUmsatz19",
    mwstIstUmsatz16 = "mwstIstUmsatz16",
    mwstUStRechnungUSt19 = "mwstUStRechnungUSt19",
    mwstUStRechnungUSt16 = "mwstUStRechnungUSt16"
}

//Banktypen
export enum csvTypes {
    Commerzbank = "Commerzbank",
    BWVisa = "BWVisa",
    KSK = "KSK",
    Voba = "Voba"
}

//Google Drive Ordner Namen
export enum ooFolders {
    system = "00 System",
    office = "2021 My Business.Office",
    vorlagen = "0 Vorlagen",
    daten = "7 Daten",
    archive = "9 Archiv",
    version = "Version:",
    rechnung = "Rechnungsvorlage leer"
}

export enum systemObject {
    officeArray = "officeArray"
}

export enum logLevel{
    debug="debug"
} 

export enum ooTables {
    systemMasterConfiguration = "systemMasterConfiguration",
    officeConfiguration = "officeConfiguration",
    email = "email",
    rechnungen = "rechnungen",
    ausgaben = "ausgaben",
    gdpdu = "gdpdu",
    OfficeRootID = "OfficeRootID",
    log = "log",
    Konfiguration = "Konfiguration",
    RechnungSchreibenD = "RechnungSchreibenD",
    RechnungenD = "RechnungenD",
    EMailIdD = "EMailIdD",
    AusgabenD = "AusgabenD",
    VerträgeD = "VerträgeD",
    BewirtungsbelegeD = "BewirtungsbelegeD",
    AbschreibungenD = "AbschreibungenD",
    VerpflegungsmehraufwendungenD = "VerpflegungsmehraufwendungenD",
    KundenD = "KundenD",
    ProdukteD = "ProdukteD",
    EURechnungenD = "EURechnungenD",
    GutschriftenD = "GutschriftenD",
    PositionenarchivD = "PositionenarchivD",
    BankbuchungenD = "BankbuchungenD",
    UmbuchungenD = "UmbuchungenD",
    KontenD = "KontenD",
    UStVAD = "UStVAD",
    EÜRD = "EÜRD",
    BuchungenD = "BuchungenD",
    ElsterTransferD = "ElsterTransferD",
    LastschriftmandatD = "LastschriftmandatD",
    LastschriftenD = "LastschriftenD",
    LastschriftproduktD = "LastschriftproduktD",
    InstallationenD = "InstallationenD",
    CSVExportD = "CSVExportD",
    GdpduD = "GdpduD",
    DataFileD = "DataFileD",
    Rechnungsvorlagelink = "Rechnungsvorlagelink",
    KundenRechnungsvorlage = "KundenRechnungsvorlage"
}

export const months = {
    '01': '(01) Januar',
    '02': '(02) Februar',
    '03': '(03) März',
    '04': '(04) April',
    '05': '(05) Mai',
    '06': '(06) Juni',
    '07': '(07) Juli',
    '08': '(08) August',
    '09': '(09) September',
    '10': '(10) Oktober',
    '11': '(11) November',
    '12': '(12) Dezember',
}


export enum ServerFunction {
    kiSwitch = "kiSwitch",
    installNewInstance = "installNewInstance",
    getOrCreateAusgabenFolder = "getOrCreateAusgabenFolder",
    getNamedRangeData = "getNamedRangeData",
    getSpreadsheetIdbyFolderIdAndName = "getSpreadsheetIdbyFolderIdAndName",
    EroeffnungsbilanzAusVorjahrAktualisieren = "EroeffnungsbilanzAusVorjahrAktualisieren",
    BuchungenFuerUmsatzsteuerBerechnenUndEintragen = "BuchungenFuerUmsatzsteuerBerechnenUndEintragen",
    businessModelUpdate = "businessModelUpdate",
    getOrCreateOfficeOneFolders = "getOrCreateOfficeOneFolders",
    SimbaExportErstellen = "SimbaExportErstellen",
    getOrCreateGutschriftenFolder = "getOrCreateGutschriftenFolder",
    gutschriftenFolderScannen = "gutschriftenFolderScannen",
    ausgabenFolderScannen = "ausgabenFolderScannen",
    bankbuchungenFolderScannen = "bankbuchungenFolderScannen",
    UStVAberechnen = "UStVAberechnen",
    UStVAverschicken = "UStVAverschicken",
    UStVAbuchen = "UStVAbuchen",
    updateDrive = "updateDrive",
    businessModelBatchUpdate = "businessModelBatchUpdate",
    vertraegeFolderScannen = "vertraegeFolderScannen",
    unbehandelterFehler = "unbehandelterFehler",
    naechstesJahrInstallieren = "naechstesJahrInstallieren"
}

export enum ooFields{
    SKR03 = "SKR03"
}
