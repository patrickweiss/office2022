//new system
//import * as newUiFunctions from './ui';

//old system
import * as publicUiFunctions from './menu';
import { generateAndMailTableRow, generateAndMailoooVersionsFileNameIdMap } from './officeone/driveconnector';
import { getNamedRangeData, getOrCreateOfficeOneFolders } from './officeone/directDriveConnector';
import { updateDrive } from './officeone/updateDrive';
import { UStVAberechnen } from './officeone/UStVAberechnen';
import { UStVAverschicken } from './officeone/UStVAverschicken';
import { UStVAbuchen } from './officeone/UStVAbuchen';
import { newOfficeOneVersion } from './officeone/newOfficeOneVersion';
import { ausgabenFolderScannen } from './officeone/ausgabenFolderScannen';
import { bankbuchungenFolderScannen } from './officeone/bankbuchungenFolderScannen';
import { businessModelBatchUpdate } from './officeone/businessModelBatchUpdate';
import { BuchungenFuerUmsatzsteuerBerechnenUndEintragen } from './officeone/BuchungenFuerUmsatzsteuerBerechnenUndEintragen';
import { SimbaExportErstellen } from './officeone/SimbaExportErstellen';
import { EroeffnungsbilanzAusVorjahrAktualisieren } from './officeone/EroeffnungsbilanzAusVorjahrAktualisieren';
import { gutschriftenFolderScannen } from './officeone/gutschriftenFolderScannen';
import { slurpData, slurpCSVData, slurpGDPDU } from './slurpData/slurpData';
import createLastschriften from '../officetwo/sepa/createLastschriften';
import createInvoicesAndSepaXml from '../officetwo/sepa/createInvoicesAndSepaXml';
import { deleteData } from './slurpData/deleteData';

//0055 WebAppTrue
import { mrechnungErstellen, mneuePosition } from './officeone/rechnungSchreiben';
import onEdit from './officeone/onEditRechnung';
import { installTestsystemTest, testFromForm } from './officeone/testFromForm';
import { addEmailId } from '../officetwo/application/addEMailId';
import { vertraegeFolderScannen } from './officeone/vertraegeFolderScannen';
import { rechnungsVorlageErstellen } from './oo21lib/rechnungsVorlageErstellen';
import { daily, kiSwitch } from './oo21lib/systemFunction';
import { naechstesJahrInstallieren } from './officeone/naechstesJahrInstallieren';
import { installNewInstance } from './officeone/installNewInstance';


global.onOpen = publicUiFunctions.onOpen;




interface IOfficeGlobal {
    onOpen: () => void;
    deleteSystem:()=>void;
    tryUpdateWithoutParameters:()=>boolean;
    vertraegeFolderScannen: (rootFolderId: string) => string;
    addEmailId: (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => void;
    testFromForm: (e: any) => void;
    installTestsystemTest: () => void;
    installTest: () => void;
    installFromForm: (e: any) => void;
    installNewInstance: (ooRootFolderLabel:string, ooRootFolderVersion:string) => void;
    rechnungsVorlageErstellen :  () => void;
    doGet: any;
    openAboutSidebar: any;
    generateAndMailTableRow: any;
    getOrCreateOfficeOneFolders: any;
    getNamedRangeData: any;
    updateDrive: any;
    openOfficeOne2021: any;
    UStVAberechnen: any;
    UStVAverschicken: any;
    UStVAbuchen: any;
    updateOfficeOne: any;
    newOfficeOneVersion: any;
    generateAndMailoooVersionsFileNameIdMap: any;
    ausgabenFolderScannen: any;
    bankbuchungenFolderScannen: any;
    businessModelBatchUpdate: any;
    BuchungenFuerUmsatzsteuerBerechnenUndEintragen: any;
    SimbaExportErstellen: any;
    onEdit: any;
    mrechnungErstellen: any;
    mneuePosition: any;
    EroeffnungsbilanzAusVorjahrAktualisieren: any;
    gutschriftenFolderScannen: any;
    slurpData: any;
    slurpCSVData: any;
    slurpGDPDU:any;
    createLastschriften: any;
    createInvoicesAndSepaXml: any;
    deleteData: any;
    daily: () => void;
    kiSwitch: (triggerCount:any)=>string;
    naechstesJahrInstallieren:(rootFolderId:string)=>string;
}

declare let global: IOfficeGlobal;
global.doGet = publicUiFunctions.doGet;
//
global.onOpen = publicUiFunctions.onOpen;
global.openAboutSidebar = publicUiFunctions.openAboutSidebar;
global.generateAndMailTableRow = generateAndMailTableRow;
global.getOrCreateOfficeOneFolders = getOrCreateOfficeOneFolders;
global.getNamedRangeData = getNamedRangeData;
global.updateDrive = updateDrive;
global.UStVAberechnen = UStVAberechnen;
global.UStVAverschicken = UStVAverschicken;
global.UStVAbuchen = UStVAbuchen;
global.newOfficeOneVersion = newOfficeOneVersion;
global.generateAndMailoooVersionsFileNameIdMap = generateAndMailoooVersionsFileNameIdMap;
global.ausgabenFolderScannen = ausgabenFolderScannen;
global.bankbuchungenFolderScannen = bankbuchungenFolderScannen;
global.businessModelBatchUpdate = businessModelBatchUpdate;
global.BuchungenFuerUmsatzsteuerBerechnenUndEintragen = BuchungenFuerUmsatzsteuerBerechnenUndEintragen;
global.SimbaExportErstellen = SimbaExportErstellen;
global.EroeffnungsbilanzAusVorjahrAktualisieren = EroeffnungsbilanzAusVorjahrAktualisieren;
global.gutschriftenFolderScannen = gutschriftenFolderScannen;
global.slurpData = slurpData;
global.slurpCSVData = slurpCSVData;
global.slurpGDPDU = slurpGDPDU;
global.createLastschriften = createLastschriften;
global.createInvoicesAndSepaXml = createInvoicesAndSepaXml;
global.deleteData = deleteData;
global.installTestsystemTest = installTestsystemTest;
global.testFromForm = testFromForm;
global.kiSwitch = kiSwitch;
global.naechstesJahrInstallieren=naechstesJahrInstallieren;

//Rechnung
global.onEdit = onEdit;
global.mneuePosition = mneuePosition;
global.mrechnungErstellen = mrechnungErstellen;
//E Mail Form
global.addEmailId = addEmailId;
global.vertraegeFolderScannen = vertraegeFolderScannen;
global.installNewInstance = installNewInstance;
global.rechnungsVorlageErstellen = rechnungsVorlageErstellen;
global.daily=daily;

