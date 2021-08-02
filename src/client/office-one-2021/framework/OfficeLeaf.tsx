// tslint:disable:ordered-imports
// tslint:disable:object-literal-sort-keys

import * as React from "react";
import { IOfficeWindow } from './OfficeWindow';
import * as Action from './Action';
declare let window: IOfficeWindow;


export enum Leafs {
	OfficeLeaf = "OfficeLeaf",
	DriveLeaf = "DriveLeaf",
	LeafTemplate = "LeafTemplate",
	DriveLeafTemplate = "DriveLeafTemplate",
	Systemstatus = "Systemstatus",
	Monatsabschluss = "Monatsabschluss",
	AusgabenListen = "AusgabenListen",
	AusgabeErfassen = "AusgabeErfassen",
	BuchungsperiodeWaehlen = "BuchungsperiodeWaehlen",
	Ausgaben = "Ausgaben",
	Einnahmen = "Einnahmen",
	Bankbuchungen = "Bankbuchungen",
	KontoEingeben = "KontoEingeben",
	BetragEingeben = "BetragEingeben",
	MwStEingeben = "MwStEingeben",
	GegenkontoEingeben = "GegenkontoEingeben",
	PhotoMachen = "PhotoMachen",
	BelegSpeichern = "BelegSpeichern",
	SAWAG = "SAWAG",
	Datenschutz = "Datenschutz",
	Eroeffnungsbilanz = "Eroeffnungsbilanz",
	Jahresabschluss = "Jahresabschluss",
	BelegSpeichernTest = "BelegSpeichernTest",
	DasProdukt = "DasProdukt",
	JahrMonat = "JahrMonat",
	GutschriftErfassen = "GutschriftErfassen",
	GutschriftenListen = "GutschriftenListen",
	Gutschriften = "Gutschriften",
	Rechnungen = "Rechnungen",
	RechnungenListen = "RechnungenListen",
	GutschriftSpeichern = "GutschriftSpeichern",
	UStVAAbgeben = "UStVAAbgeben",
	UStVAberechnet = "UStVAberechnet",
	ServerError = "ServerError",
	WaitingForBMUpdate = "WaitingForBMUpdate",
	C2021OfficeOnePocket = "C2021OfficeOnePocket"
}

export interface IchangeLeaf extends Action.IAction {
    newLeaf: Leafs;
}

// tslint:disable-next-line:only-arrow-functions
Action.reducerFunctions[Action.Type.ChangeLeaf] = function (newState: any, action: IchangeLeaf) {
    newState.UI.leaf = action.newLeaf;
    if (action.newLeaf === Leafs.BuchungsperiodeWaehlen) { delete newState.UI.buchungsperiode; }
    return newState;
}





const leafClasses = {};

export interface ILeaf {
    size?: string;
    title?: string;
    sentence?: string;
    charactericon?: string;
    path?: Leafs[];
}



// tslint:disable-next-line:max-classes-per-file
class OfficeLeaf extends React.Component<ILeaf, object> {
    public size: string;
    protected leafName: Leafs;
    protected title: string;
    protected sentence: string;
    protected charactericon: string;
    protected path: Leafs[];
   
    constructor(props: ILeaf) {
        super(props);
        // this is needed, because after minification for production build, the class name will be random
        this.leafName = Leafs.OfficeLeaf;
        this.size = props.size || "BUTTON";
        this.title = props.title || "Leaf";
        this.sentence = props.sentence || "OfficeLeaf is the base class for everything that can appear on any screen";
        this.charactericon = props.charactericon || "I-O";
        this.path = props.path || [Leafs.OfficeLeaf];
        this.handleClick = this.handleClick.bind(this);
    }
    public render() {
        window.logger.debug("render:" + this.leafName + " " + this.size);
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
                </div>;
            default:
                return <h1>Component has no valid size</h1>;
        }
    }
    public formatMoney(betrag:any){
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
    }
    public formatDate(date:Date){
        return new Intl.DateTimeFormat("de-DE").format(date);
    }
    protected handleClick(e: any) {
        window.logger.debug("1. Event: handleClick " + this.leafName);
        const a: IchangeLeaf = {
            type: Action.Type.ChangeLeaf,
            // tslint:disable-next-line:object-literal-sort-keys
            newLeaf: this.leafName
        }
        this.handleAction(a);
    }
    protected handleAction(a: Action.IAction) {
        window.store.dispatch(a);
    }
    protected getUIState() {
        return window.store.getState().UI;
    }
    protected renderIcon() {
        return <button className="linkButton" type="button" onClick={this.handleClick}>{this.charactericon}</button>;
    }
    protected renderButton() {
        return <button className="linkButton" type="button" onClick={this.handleClick}>{this.title}</button>;
    }
    protected renderListItem() {
        return <div className="LIST_ITEM"><button className="linkButton" type="button" onClick={this.handleClick}>{this.sentence}</button></div>;
    }
    protected renderMobile() {
        return (
            <div className="MOBILE">
                <h1>{this.title}</h1>
                <p>{this.sentence}</p>
                <button type="button" onClick={this.handleClick}>{this.title}</button>
                <ul>
                    <li>path:StringArray with oo-leaf-names</li>
                    <li>size = ICON || BUTTON || LIST_ITEM || MOBILE || TABLET</li>
                    <li>purpose = INFORMATION || NAVIGATION || DATA_ENTRY</li>
                    <li>subject = String describing the type of the entity the element is doing something with</li>
                    <li>verb = String describing the type of action the element is doing with the subject</li>
                    <li>sentence = String describing verb and subject in more detail</li>
                </ul>
            </div>
        );
    }
    protected renderPath() {
        let CurrentLeaf;
        const pathHTML:JSX.Element[] = [];
         for (let i = 0; i < this.path.length; i++) {
            CurrentLeaf = leafClasses[this.path[i]];
            if (i === this.path.length - 1) {
                pathHTML.push(<CurrentLeaf size="BUTTON" key={i} />);
            }
            else {
                pathHTML.push(<CurrentLeaf size="ICON" key={i} />);
                pathHTML.push(<> {">"} </>);
            }
        }
        return <div className="TOPBAR">
            <div className="STATUSBAR">OfficeOne.Pocket</div>
            <div className="NAVBAR">{pathHTML}</div>
        </div>;
    }
}

// tslint:disable-next-line:no-string-literal
leafClasses[Leafs.OfficeLeaf] = OfficeLeaf;


export { OfficeLeaf, leafClasses };    