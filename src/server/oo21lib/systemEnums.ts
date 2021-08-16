export const clientSystemMasterId = "1V07fdHjmW0eUDd2pwN-8r6sCwY0Cy2KQOSFgtNdmirU"
export enum ooVersions {
    oo57 = "0057",
    oo58 = "0058"
}
export const currentOOversion = ooVersions.oo58;
export enum systemMasterProperty {
    officeOne2022_TemplateFolderId = "1rsDPOk33OEa8x6y-jLNmjv9TL1kTwxxb",
    webApp_URL = "https://script.google.com/macros/s/AKfycbyC206ZJWY2Zv5NUhpqMQ_jgzWk2VAt9U3VnwVNhRRlHzQKG5Q/exec"
}
export const adminUser = "eins.stein@officeone.team";
export const subscribeRestEndpoint = "https://script.google.com/macros/s/AKfycbzeBsJ_exOfJjhUtbHeCLEbTFoLspd5GfTrKTGqi6CzDF_9lKJr/exec";
export enum belegNr {
    mwstFinanzamtOP = "mwstFinanzamtOP",
    mwstUStVAAufVMwSt = "mwstUStVAAufVMwSt",
    mwstVorsteuerAufVMwSt = "mwstVorsteuerAufVMwSt",
    mwstIstUmsatz0 = "mwstIstUmsatz0",
    mwstUmsatzsteuer19AufVMwSt = "mwstUmsatzsteuer19AufVMwSt",
    mwstUStRechnungUSt19 = "mwstUStRechnungUSt19",
    mwstIstUmsatz19 = "mwstIstUmsatz19"
}



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
    plz = "plz",
    ort = "ort",
    telefon = "telefon",
    email = "email",
    bank = "bank",
    iban = "iban",
    subversion = "subversion",
    importFrom2021_FolderId = "importFrom2021_FolderId",
    triggerMode = "triggerMode",
    officeRootID_FolderId = "officeRootID_FolderId",
    vorjahrOfficeRootID_FolderId = "vorjahrOfficeRootID_FolderId",
    logLevel="logLevel"
}

export enum triggerModes {
    production = "Produktion",
    test = "Test",
    stop = "Stop"
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
    getOrCreateRootFolder = "getOrCreateRootFolder",
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
    unbehandelterFehler = "unbehandelterFehler"
}
