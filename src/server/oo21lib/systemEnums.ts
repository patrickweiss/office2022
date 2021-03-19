export const systemMasterId = "1LFVtqthrB3g1sWVBBeAliirFuB5zMHKdwrm7UppEsqg";
export const clientSystemMasterId = "1rWlWWpBnanSBP2oEHSLCIY6IBBiCrTKNjSN1_74lMx4"


export const adminUser = "eins.stein@officeone.team";
export enum ooVersions {
    oo55 = "0055",
    oo56 = "0056"
}

export const currentOOversion = ooVersions.oo56;

export enum belegNr {
    mwstFinanzamtOP = "mwstFinanzamtOP",
    mwstUStVAAufVMwSt = "mwstUStVAAufVMwSt",
    mwstVorsteuerAufVMwSt = "mwstVorsteuerAufVMwSt",
    mwstIstUmsatz0 = "mwstIstUmsatz0",
    mwstUmsatzsteuer19AufVMwSt = "mwstUmsatzsteuer19AufVMwSt",
    mwstUStRechnungUSt19 = "mwstUStRechnungUSt19",
    mwstIstUmsatz19 = "mwstIstUmsatz19"
}


export enum systemMasterProperty {
    officeOne2022_TemplateFolderId = "1b_Yxbqe6SRlL37fQZgHfBWYvwrZ5YKCV",
    webApp_URL = "https://script.google.com/macros/s/AKfycbwJNEXkA8U-wZlJ93DTxe3xN8ihP_qiYM10RP1gjdGltOe3U0WI/exec"
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
    vorjahrOfficeRootID_FolderId = "vorjahrOfficeRootID_FolderId"
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
