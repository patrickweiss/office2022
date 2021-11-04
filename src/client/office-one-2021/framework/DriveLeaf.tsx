import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from './OfficeLeaf';
// tslint:disable:object-literal-sort-keys

import { IOfficeWindow } from './OfficeWindow';
import * as Action from './Action';
import { TableRow } from '../bm/BusinessDataFacade';
import { BusinessModel } from '../bm/BusinessModel';
import { ServerButton } from './ServerButton';
import { currentOOversion } from "../../../server/oo21lib/systemEnums";

declare let window: IOfficeWindow;

export interface IOOFolderSelected extends Action.IAction {
    folderId: string;
    folderName: string;
    folderVersion: string;
}
export interface IOOFolderDisconnected extends Action.IAction { }

export function createVorjahrInstanceNameFromFolderName(folderName:string){
   return (parseInt(folderName.substr(0, 4)) - 1).toString() + folderName.substr(4) + " "+ currentOOversion;
}

Action.reducerFunctions[Action.Type.OOFolderSelected] = function (newState: any, action: IOOFolderSelected) {
    newState.BM.instanceName = action.folderName;
    newState.BM.vorjahrInstanceName = createVorjahrInstanceNameFromFolderName(action.folderName);
    newState.BM.rootFolder.id = action.folderId;
    newState.BM.rootFolder.name = action.folderName;
    newState.BM.rootFolder.version = action.folderVersion;
    newState.BM[action.folderId] = {};
    window.BM = new BusinessModel();
    return newState;
}
Action.reducerFunctions[Action.Type.StartBatchUpdate] =  function (newState: any, action) {
    newState.UI.leaf=OfficeLeaf.Leafs.WaitingForBMUpdate;
    return newState;
}

Action.reducerFunctions[Action.Type.StartBatchUpdate] =  function (newState: any, action) {
    newState.UI.leaf=OfficeLeaf.Leafs.WaitingForBMUpdate;
    return newState;
}
Action.reducerFunctions[Action.Type.OOFolderDisconnected] = function (newState: any, action: IOOFolderDisconnected) {
    newState.BM.instanceName = "";
    delete newState.BM[newState.BM.rootFolder.id];
    delete window.BM;
    newState.BM.rootFolder = {};
    return newState;
}
class DriveLeaf extends OfficeLeaf.OfficeLeaf {
    constructor(props: OfficeLeaf.ILeaf) {
        const newProps: OfficeLeaf.ILeaf = {
            size: props.size,
            title: props.title || "Driveseite",
            path: props.path || [OfficeLeaf.Leafs.OfficeLeaf, OfficeLeaf.Leafs.DriveLeaf],
            sentence: props.sentence || "Basisklasse für Google Drive Seiten",
            charactericon: props.charactericon || "DL"
        }
        super(newProps);
        this.handleFolderSelect = this.handleFolderSelect.bind(this);
        this.handleFolderDisconnect = this.handleFolderDisconnect.bind(this);
        this.handleFolderCreate = this.handleFolderCreate.bind(this);
        this.handleKiSwitch = this.handleKiSwitch.bind(this);
    }
    protected renderDriveData() {
        return <div className="LIST_ITEM"><button className="linkButton" type="button" onClick={this.handleClick}>{this.sentence}</button></div>;
    }
    protected getBM() {
        if (window.store.getState().BM.rootFolder.id === undefined) window.serverProxy.getOrCreateRootFolder(window.store.getState().BM.instanceName);
        if (window.store.getState().BM.rootFolder.id === "loading") throw new Error("OfficeOne Ordner wird erstellt");
        return window.BM;
    }
    protected renderTableArray(tableRow: TableRow[], rowNames: string) {
        const titleArray: string[] = [];
        rowNames.split(",").forEach((column) => {
            titleArray.push(tableRow[0].getTitle(column));
        })
        const titleHTML = titleArray.map((t: string) => <th>{t}</th>);

        const dataTableHTML = tableRow.map((row) => {
            const dataTextArray: string[] = []
            rowNames.split(",").forEach((column => {
                dataTextArray.push(row.getValueStringOrNumber(column));
            }))
            const dataRowHTML = dataTextArray.map((data: any) => this.renderTd(data));
            let beginn = row.getId().length - 5;
            if (beginn < 0) beginn = 0;
            return (<tr><td>{row.getId().substr(beginn)}</td>{dataRowHTML}</tr>);
        })
        return (
            <div className="LIST_ITEM">
                <table>
                    <tbody>
                        <tr><th>Nr</th>{titleHTML}</tr>
                        {dataTableHTML}
                    </tbody>
                </table>
            </div>
        )
    }
    protected renderTableArrayComplete(tableRow: TableRow[]) {
        const titleHTML = tableRow[0].getTitlesArray().map((t: string) => <th>{t}</th>);
        const dataTableHTML = tableRow.map((row) => {
            const dataRowHTML = row.getDataArray().map((data: any) => this.renderTd(data));
            return (<tr>{dataRowHTML}</tr>);
        })
        return (
            <div className="LIST_ITEM">
                <table>
                    <tbody>
                        <tr>{titleHTML}</tr>
                        {dataTableHTML}
                    </tbody>
                </table>
            </div>
        )
    }
    protected renderTd(data: any) {
        if (typeof data === "string") return <td>{data}</td>;
        return <td className="RECHTS">{this.formatMoney(data)}</td>
    }
    protected updateBM(action: Action.IAction) {
        window.store.dispatch(businessModelUpdateActionCreator(action));
    }
    protected updateBMbatch(action: Action.IAction) {
        window.store.dispatch(businessModelAddToActionBatch(action));
    }
    public render() {
        window.logger.debug("DriveLeaf.tsx --> render:" + this.leafName + " " + this.size);
        switch (this.size) {
            case 'ICON':
                return this.renderIcon();
            case 'BUTTON':
                return this.renderButton();
            case 'LIST_ITEM':
                return this.renderListItem();
            case 'MOBILE':
                return <div>
                    {this.renderPath()}
                    {this.renderMobile()}
                    {this.renderDisconnectButton()}
                    {this.renderLeftStatusButton()}
                </div>;
            default:
                return <h1>Component has no valid size</h1>;
        }
    }
    protected renderMobile() {
        window.logger.debug("DriveLeaf.tsx --> renderMobile");
        return (
            <div>
                <h1>{this.title}</h1>
                <p className="MITTIG">{this.sentence}</p>
                {this.renderLeafContent()}
            </div>
        )
    }
    protected renderListItem() {
        return this.renderLeafContent();
    }
    protected renderLeafContent() {
        if (this.getUIState().loggedIn) return this.renderLoggedIn();
        return this.renderLoggedOut();
    }
    protected renderLoggedOut() {
        return (
            <div className="LIST_ITEM">
                <button id="authorize-button" >Mit Google Account anmelden, um OfficeOne.Pocket mit Google Drive zu verbinden</button>
            </div>
        )
    }
    //Object.keys(window.store.getState().BM.OfficeOneFolders).map( (folderId: any) => this.renderOOFolder(folderId));

    protected renderLoggedIn() {
        if (window.store.getState().BM.rootFolder.id !== undefined)
            if (window.store.getState().BM.rootFolder.version === window.store.getState().UI.version) return this.renderConnectedToDriveFolder();
            else return this.askForDriveUpdate();
        let driveData = <p>das sollte nie gezeigt werden ...</p>;
        try {
            if (window.store.getState().BM.instanceName === "") window.serverProxy.getOrCreateOfficeOneFolders();
            if (window.store.getState().BM.instanceName === "loading") throw new Error("OfficeOne.Office Ordner werden geladen");
            if (window.store.getState().BM.OfficeOneFolders !== undefined && window.store.getState().BM.instanceName === "not selected") {
                if (Object.keys(window.store.getState().BM.OfficeOneFolders).length > 0)
                    driveData =
                        <div>
                            {Object.keys(window.store.getState().BM.OfficeOneFolders).map((folder: any) => this.renderOOFolder(folder))}
                        </div>;
                else
                    driveData = <div className="LIST_ITEM">
                        <p> In Ihrem Google Drive wurde noch kein OfficeOne.System gefunden, soll ein neues System installiert werden?</p>
                        <button onClick={this.handleFolderCreate} >Neuen Ordner "00 System" und neuen Ordner "2021 My Business.Office" in Goolge Drive anlegen</button>
                    </div>
            }
        } catch (e) {
            driveData = <div className="LIST_ITEM"><p>OfficeOne.Pocket wird mit Google Drive verbunden</p></div>
        }
        return driveData;
    }
    protected renderOOFolder(folderId: any) {
        const folder = window.store.getState().BM.OfficeOneFolders[folderId];
        return <div className="LIST_ITEM"><button onClick={this.handleFolderSelect} id={folderId} >{folder.name}</button></div>
    }
    protected askForDriveUpdate() {
        const text = "Tabellen in Google Drive müssen auf Version " + window.store.getState().UI.version + " aktualisiert werden";
        return (
            <div>
                <ServerButton text={text} onClick={this.updateDrive}></ServerButton>
            </div>
        )
    }
    private updateDrive() {
        window.serverProxy.updateDrive(window.store.getState().BM.rootFolder.id);
    }
    public renderConnectedToDriveFolder() {
        let driveData = <p></p>;
        try {
            this.getBM();
            driveData = this.renderDriveData();
        } catch (e) {
            //driveData = <div className="LIST_ITEM"><p>Daten werden aus Google Drive geladen ...</p><p>... {e.message}</p><p>{e.stack}</p></div>
            driveData = <div className="LIST_ITEM"><p>Mit Google Drive verbinden ... {e.message}</p></div>
            window.logger.debug(e.stack);
        }
        return (
            <div>
                <div className="LIST_ITEM">
                    {driveData}
                </div>
            </div>
        )
    }
    protected renderDisconnectButton() {
        window.logger.debug("DriveLeaf.tsx --> renderDisconnectButton");
        if (this.getUIState().loggedIn) {
            if (window.store.getState().BM.rootFolder.id) return (<div className="LOGOUTBAR"><button id="signout-button" onClick={this.handleFolderDisconnect}>{window.store.getState().BM.rootFolder.name} trennen</button> </div>);
        }
        return "";
    }
    protected renderLeftStatusButton() {
        window.logger.debug("DriveLeaf.tsx --> renderLeftStatusButton"+this.getUIState().actionBatch);
        if (this.getUIState().actionBatch) {
            console.log("ActionBatch cached");
            return (<div className="SAVEBAR"><button id="save-button" onClick={this.handleSaveActionBatch}>Zuordnungen in Google Drive speichern</button> </div>);
        }
        return (<div className="KIBAR"><ServerButton text={`Buchungsautomatik: ${this.getUIState().triggers==="0" ? "Aus":"An"}`} onClick={this.handleKiSwitch}></ServerButton> </div>);
    }
    protected handleSaveActionBatch() {
        window.store.dispatch(businessModelBatchUpdateCreator());
    }
    protected handleKiSwitch() {
        console.log("DL.handleKiSwitch");
        window.serverProxy.kiSwitch(window.store.getState().UI.triggers);
    }
    protected handleFolderCreate(e: any) {
        window.serverProxy.getOrCreateRootFolder("2019 OfficeOne.Office")
    }
    protected handleFolderSelect(e: any) {
        console.log(e.target);
        const folderId = e.target.getAttribute('id').toString();
        const version = window.store.getState().BM.OfficeOneFolders[folderId].version;
        const folderName = e.target.textContent;
        const a: IOOFolderSelected = {
            type: Action.Type.OOFolderSelected,
            folderId: folderId,
            folderName: folderName,
            folderVersion: version
        }
        this.handleAction(a);
    }
    protected handleFolderDisconnect(e: any) {
        const a: IOOFolderDisconnected = {
            type: Action.Type.OOFolderDisconnected
        }
        this.handleAction(a);
    }
}

function businessModelUpdateActionCreator(action: Action.IAction) {
    return function (dispatch: any) {
        dispatch(action);
        window.serverProxy.businessModelUpdate(window.BM.getRootFolderId(), action);
    }

}

function businessModelAddToActionBatch(action: Action.IAction) {
    return function (dispatch: any) {
        dispatch(action);

        window.serverProxy.businessModelAddToActionBatch(window.BM.getRootFolderId(), action);
    }
}

function businessModelBatchUpdateCreator() {
    return function (dispatch: any) {
        dispatch({ type: Action.Type.StartBatchUpdate });

        window.serverProxy.businessModelBatchUpdate(window.BM.getRootFolderId());
    }
}
// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.DriveLeaf] = DriveLeaf;

export { DriveLeaf };