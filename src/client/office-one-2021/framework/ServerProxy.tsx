
import { IOfficeWindow } from './OfficeWindow';
declare let window: IOfficeWindow;
import { IAction } from "./Action";

import { serverCall } from './serverActions'
import { BusinessModel } from '../bm/BusinessModel';
import { UStVA } from '../bm/BusinessDataFacade';
//import { Server } from 'http';
import { Leafs } from './OfficeLeaf';
import { createVorjahrInstanceNameFromFolderName } from './DriveLeaf';
import { ServerFunction } from '../../../server/oo21lib/systemEnums';



export const reducerFunctions = {};

reducerFunctions[ServerFunction.unbehandelterFehler] = function (newState: any, serverResponse: any) {
    if (serverResponse.error){
        newState.UI.error = serverResponse.error;
        newState.UI.leaf = Leafs.ServerError;
        return;
    }
}

reducerFunctions[ServerFunction.getOrCreateOfficeOneFolders] = function (newState: any, serverResponse: any) {
    if (serverResponse.error){
        newState.BM.serverError = serverResponse.error;
        newState.UI.leaf = Leafs.SAWAG;
        return;
    }
    newState.BM.OfficeOneFolders = serverResponse.foldersArray as Object;
    const folderIds: string[] = Object.keys(newState.BM.OfficeOneFolders);
    
    if (folderIds.length === 1) {
        const rootFolder = newState.BM.OfficeOneFolders[folderIds[0]]
        newState.BM.instanceName = rootFolder.name;
        newState.BM.rootFolder = {};
        newState.BM.rootFolder.id = folderIds[0];
        newState.BM.rootFolder.name = rootFolder.name;
        newState.BM.vorjahrInstanceName= createVorjahrInstanceNameFromFolderName(rootFolder.name);
        newState.BM.rootFolder.version = rootFolder.version;
        newState.BM[folderIds[0]] = {};
        window.BM = new BusinessModel();
        if (rootFolder.leaf)
            newState.UI.leaf = rootFolder.leaf;
        else
            newState.UI.leaf = Leafs.C2021OfficeOnePocket;
    } else {
        newState.BM.instanceName = "not selected";
        newState.BM.rootFolder = {};
        newState.UI.leaf = Leafs.C2021OfficeOnePocket;
    }
}
reducerFunctions[ServerFunction.getOrCreateRootFolder] = function (newState: any, serverResponse: any) {
    newState.BM.rootFolder.id = serverResponse.id;
    newState.BM.rootFolder.name = serverResponse.name;
    //    newState.BM[serverResponse.id]=serverResponse.data;
    newState.BM[serverResponse.id] = {};
    window.BM = new BusinessModel();
}

reducerFunctions[ServerFunction.getOrCreateAusgabenFolder] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].ausgabenFolder = serverResponse.ausgabenFolder;
}
reducerFunctions[ServerFunction.ausgabenFolderScannen] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].AusgabenD = serverResponse.AusgabenD;
    newState.BM[newState.BM.rootFolder.id].BewirtungsbelegeD = serverResponse.BewirtungsbelegeD;
    delete window.BM.ausgabenTableCache;
    delete window.BM.bewirtungsbelegeTableCache;
}
reducerFunctions[ServerFunction.vertraegeFolderScannen] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].VerträgeD = serverResponse.VerträgeD;
    delete window.BM.vertraegeTableCache;
}
reducerFunctions[ServerFunction.gutschriftenFolderScannen] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].GutschriftenD = serverResponse.GutschriftenD;
    delete window.BM.gutschriftenTableCache;
}
reducerFunctions[ServerFunction.bankbuchungenFolderScannen] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].BankbuchungenD = serverResponse.BankbuchungenD;
    delete window.BM.bankbuchungenTableCache;
}
reducerFunctions[ServerFunction.UStVAberechnen] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].BuchungenD = serverResponse.BuchungenD;
    delete window.BM.normalisierteBuchungenTableCache;
}
reducerFunctions[ServerFunction.getOrCreateGutschriftenFolder] = function (newState: any, serverResponse: any) {
    newState.BM[newState.BM.rootFolder.id].gutschriftenFolder = serverResponse.gutschriftenFolder;
}

reducerFunctions[ServerFunction.getNamedRangeData] = function (newState: any, serverResponse: any) {
    window.BM.deleteCache(serverResponse.rangeName);
    newState.BM[newState.BM.rootFolder.id][serverResponse.rangeName] = serverResponse.namedRangeData;
}

reducerFunctions[ServerFunction.getSpreadsheetIdbyFolderIdAndName] = function (newState: any, serverResponse: any) {
    newState.BM.spreadsheetId[serverResponse.name] = serverResponse.id;
}

reducerFunctions[ServerFunction.EroeffnungsbilanzAusVorjahrAktualisieren] = function (newState: any, serverResponse: any) {
    newState.BM.test = serverResponse.testName;
}
reducerFunctions[ServerFunction.BuchungenFuerUmsatzsteuerBerechnenUndEintragen] = function (newState: any, serverResponse: any) {
    newState.BM.test = serverResponse.testName;
}
reducerFunctions[ServerFunction.businessModelUpdate] = function (newState: any, serverResponse: any) {
}
reducerFunctions[ServerFunction.businessModelBatchUpdate] = function (newState: any, serverResponse: any) {
    newState.UI.leaf = Leafs.C2021OfficeOnePocket;
    newState.UI.actionBatch = false;
}
reducerFunctions[ServerFunction.SimbaExportErstellen] = function (newState: any, serverResponse: any) {
    newState.UI.leaf = Leafs.Jahresabschluss;
}



export class ServerProxy {
    static actionBatch: IAction[] = [];
    public EroeffnungsbilanzAusVorjahrAktualisieren(rootFolderNameVorjahr: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.EroeffnungsbilanzAusVorjahrAktualisieren,
                    parametersArray: [window.BM.getRootFolderId(), rootFolderNameVorjahr]
                }
            )
        )
    }
    public getOrCreateOfficeOneFolders() {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.getOrCreateOfficeOneFolders,
                    parametersArray: [
                        window.store.getState().UI.version
                    ]
                }
            )
        )
    }
    public getOrCreateRootFolder(rootFolderName: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.getOrCreateRootFolder,
                    parametersArray: [
                        rootFolderName,
                        window.store.getState().UI.version
                    ]
                })
        );
    }
    public getOrCreateGutschriftenFolder(rootFolderId: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.getOrCreateGutschriftenFolder,
                    parametersArray: [rootFolderId]
                })
        );
    }
    public getOrCreateAusgabenFolder(rootFolderId: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.getOrCreateAusgabenFolder,
                    parametersArray: [rootFolderId]
                })
        );
    }
    public gutschriftenFolderScannen(rootFolderId: string, monat: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.gutschriftenFolderScannen,
                    parametersArray: [rootFolderId, monat]
                })
        );
    }
    public ausgabenFolderScannen(rootFolderId: string, monat: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.ausgabenFolderScannen,
                    parametersArray: [rootFolderId, monat]
                })
        );
    }
    public vertraegeFolderScannen(rootFolderId: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.vertraegeFolderScannen,
                    parametersArray: [rootFolderId]
                })
        );
    }
    public bankbuchungenFolderScannen(rootFolderId: string, monat: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.bankbuchungenFolderScannen,
                    parametersArray: [rootFolderId, monat]
                })
        );
    }
    public UStVAberechnen(rootFolderId: string, monat: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.UStVAberechnen,
                    parametersArray: [rootFolderId, monat]
                })
        );
    }
    public UStVAverschicken(rootFolderId: string, ustva: UStVA) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.UStVAverschicken,
                    parametersArray: [rootFolderId, ustva.getId()]
                })
        );
    }
    public UStVAbuchen(rootFolderId: string, ustva: UStVA) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.UStVAbuchen,
                    parametersArray: [rootFolderId]
                })
        );
    }
    public loadNamedRange(rangeName: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.getNamedRangeData,
                    parametersArray: [window.BM.getRootFolderId(), rangeName, window.store.getState().UI.version]
                })
        );
    }
    public BuchungenFuerUmsatzsteuerBerechnenUndEintragen() {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.BuchungenFuerUmsatzsteuerBerechnenUndEintragen,
                    parametersArray: [window.BM.getRootFolderId()]
                }
            )
        );
    }
    public SimbaExportErstellen() {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.SimbaExportErstellen,
                    parametersArray: [window.BM.getRootFolderId()]
                }
            )
        );
    }

    public businessModelUpdate(rootFolderId: string, action: IAction) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.businessModelUpdate,
                    parametersArray: [rootFolderId, JSON.stringify(action)]
                }
            )
        );
    }

    public businessModelAddToActionBatch(rootFolderId: string, action: IAction) {
        ServerProxy.actionBatch.push(action);
    }

    public businessModelBatchUpdate(rootFolderId: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.businessModelBatchUpdate,
                    parametersArray: [rootFolderId, JSON.stringify(ServerProxy.actionBatch)]
                }
            )
        );
    }

    public updateDrive(rootFolderId: string) {
        window.store.dispatch(
            serverCall(
                {
                    functionName: ServerFunction.updateDrive,
                    parametersArray: [rootFolderId]
                }
            )
        );
    }


}



