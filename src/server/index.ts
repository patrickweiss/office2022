


//new system
import { deleteSystem0055 } from './oo21lib/driveConnector';
import * as newUiFunctions from './ui';

//old system
import * as publicUiFunctions from './menu';
import { generateAndMailTableRow, generateAndMailoooVersionsFileNameIdMap } from './officeone/driveconnector';
import { getOrCreateOfficeOneFolders, getNamedRangeData } from './officeone/directDriveConnector';
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
import { slurpData, slurpCSVData } from './slurpData/slurpData';
import createLastschriften from '../officetwo/sepa/createLastschriften';
import createInvoicesAndSepaXml from '../officetwo/sepa/createInvoicesAndSepaXml';
import { deleteData } from './slurpData/deleteData';
import { installFromForm, installTest } from './officeone/installFromForm';

//0055 WebAppTrue
import { mrechnungErstellen, mneuePosition } from './officeone/rechnungSchreiben';
import onEdit from './officeone/onEditRechnung';
import { installTestsystemTest, testFromForm } from './officeone/testFromForm';
import { addEmailId } from '../officetwo/application/addEMailId';
import { doGet } from '../officetwo/sepa/doGet';
import { vertraegeFolderScannen } from './officeone/vertraegeFolderScannen';


global.onOpen = publicUiFunctions.onOpen;
global.installOO22 = newUiFunctions.installOO22;
global.updateOO22 = newUiFunctions.updateOO22
global.deleteSystem = deleteSystem0055;
global.tryUpdateWithoutParameters = newUiFunctions.tryUpdateWithoutParameters




export const webApp = false;


interface IOfficeGlobal {
    onOpen: () => void;
    installOO22: () => void;
    updateOO22:() => void;
    deleteSystem:()=>void;
    tryUpdateWithoutParameters:()=>boolean;
    vertraegeFolderScannen: (rootFolderId: string) => string;
    addEmailId: (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => void;
    testFromForm: (e: any) => void;
    installTestsystemTest: () => void;
    installTest: () => void;
    installFromForm: (e: any) => void;
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
    createLastschriften: any;
    createInvoicesAndSepaXml: any;
    deleteData: any;
}

declare let global: IOfficeGlobal;
if (webApp)
    global.doGet = publicUiFunctions.doGet;
else
    global.doGet = doGet;
//
global.onOpen = publicUiFunctions.onOpen;
global.openAboutSidebar = publicUiFunctions.openAboutSidebar;
global.openOfficeOne2021 = publicUiFunctions.openOfficeOne2021;
global.generateAndMailTableRow = generateAndMailTableRow;
global.getOrCreateOfficeOneFolders = getOrCreateOfficeOneFolders;
global.getNamedRangeData = getNamedRangeData;
global.updateDrive = updateDrive;
global.UStVAberechnen = UStVAberechnen;
global.UStVAverschicken = UStVAverschicken;
global.UStVAbuchen = UStVAbuchen;
global.updateOfficeOne = publicUiFunctions.updateOfficeOne;
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
global.createLastschriften = createLastschriften;
global.createInvoicesAndSepaXml = createInvoicesAndSepaXml;
global.deleteData = deleteData;
global.installFromForm = installFromForm;
global.installTest = installTest;
global.installTestsystemTest = installTestsystemTest;
global.testFromForm = testFromForm;

//Rechnung
global.onEdit = onEdit;
global.mneuePosition = mneuePosition;
global.mrechnungErstellen = mrechnungErstellen;
//E Mail Form
global.addEmailId = addEmailId;
global.vertraegeFolderScannen = vertraegeFolderScannen;

// Expose public functions by attaching to `global`


