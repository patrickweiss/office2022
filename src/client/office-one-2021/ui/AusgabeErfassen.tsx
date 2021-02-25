import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
//  { DriveLeaf } from '../framework/DriveLeaf';
import * as Action from '../framework/Action';


import { IOfficeWindow } from '../framework/OfficeWindow';
import { ServerButton } from '../framework/ServerButton';
declare let window: IOfficeWindow;

export interface IchangeContent extends Action.IAction {
  content: string;
}

// tslint:disable-next-line:only-arrow-functions
Action.reducerFunctions[Action.Type.ChangeLeafContent] = function (newState: any, action: IchangeContent) {
  newState.UI[newState.UI.leaf].content = action.content;
  return newState;
}



class AusgabeErfassen extends OfficeLeaf.OfficeLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Ausgabe erfassen",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Monatsabschluss, OfficeLeaf.Leafs.BuchungsperiodeWaehlen, OfficeLeaf.Leafs.Ausgaben, OfficeLeaf.Leafs.AusgabeErfassen],
      sentence: "Ausgabe erfassen",
      charactericon: "erfassen"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.AusgabeErfassen;
    this.handleDriveScannen = this.handleDriveScannen.bind(this);
    this.handleVertraegeScannen = this.handleVertraegeScannen.bind(this);
  }

  protected renderListItem() {
    return (
      <div>
        <div className="LIST_ITEM">
          <h2>Neue Ausgabe erfassen</h2>
          <ServerButton text="Drive Ordner 2 Ausgaben scannen" onClick={this.handleDriveScannen}></ServerButton>
          <ServerButton text="Drive Ordner 6 Verträge scannen" onClick={this.handleVertraegeScannen}></ServerButton>
        </div>
      </div>
    );
  }

  protected handleDriveScannen() {
    window.serverProxy.ausgabenFolderScannen(window.BM.getRootFolderId(), this.getUIState().buchungsperiode.split(" ")[0]);
  }
  protected handleVertraegeScannen() {
    window.serverProxy.vertraegeFolderScannen(window.BM.getRootFolderId());
  }
  protected handleClick(e: any) {
    if (this.size === "LIST_ITEM") {
      const a: IchangeContent = {
        type: Action.Type.ChangeLeafContent,
        content: e.target.parentElement.id
      }
      this.handleAction(a);
    }
    else {
      super.handleClick(e);
    }
  }

  private renderBewirtungsanlassButton() {
    if (this.getUIState().konto === "Bewirtungsbeleg")
      return (
        <button onClick={this.handleClick} id='BewirtungsanlassEingeben'>{this.renderBewirtungsanlass()}</button>
      );
    else
      return ("");
  }
  private renderBewirtungsanlass() {
    const Bewirtungsanlass = this.getUIState().Bewirtungsanlass;
    if (Bewirtungsanlass === undefined) return "Bewirtungsanlass";
    else return Bewirtungsanlass;
  }
  private renderBetrag() {
    if (this.getUIState().betrag) {
      return <span className="VALID">{this.formatMoney(this.getUIState().betrag / 100)}</span>;
    }
    else
      return <span className="INVALID">Betrag</span>;
  }
  private renderKonto() {
    const konto = this.getUIState().konto;
    if (konto === undefined) return <span className="INVALID">Konto</span>; else return <span className="VALID">{konto}</span>;
  }
  private renderMwSt() {
    const mwst = this.getUIState().MwSt;
    if (mwst === undefined) return <span className="INVALID">MwSt</span>; else return <span className="VALID">{mwst}</span>;
  }
  private renderGegenkonto() {
    const gegenkonto = this.getUIState().gegenkonto;
    if (gegenkonto === undefined) return <span className="INVALID">Gegenkonto</span>; else return <span className="VALID">{gegenkonto}</span>;
  }
  private renderPhoto() {
    const belegPhoto = this.getUIState().belegPhoto;
    const belegDateiname = this.getUIState().belegDateiname;
    if (belegPhoto === undefined) return <span className="INVALID">Beleg</span>;
    if (belegDateiname === undefined) return <img id="PhotoMachen" src={belegPhoto} alt="Belegfoto" width="20" height="15" />;
    return <span className="VALID">{belegDateiname.substr(0, 8)}</span>;
  }

  private renderSpeichern() {
    if (this.getUIState().betrag && this.getUIState().konto && this.getUIState().MwSt && this.getUIState().belegPhoto && this.getUIState()[OfficeLeaf.Leafs.Ausgaben].content !== "BelegSpeichern")
      return (<p><button onClick={this.handleClick} id='BelegSpeichern'><span className="VALID">Speichern</span></button></p>);
    else
      return "";
  }

}

OfficeLeaf.leafClasses[OfficeLeaf.Leafs.AusgabeErfassen] = AusgabeErfassen;

export default AusgabeErfassen;