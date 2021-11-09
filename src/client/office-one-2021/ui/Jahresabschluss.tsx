// tslint:disable:ordered-imports
import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { IOfficeWindow } from '../framework/OfficeWindow';
import { ServerButton } from '../framework/ServerButton';
declare let window: IOfficeWindow;


class Jahresabschluss extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Jahresabschluss",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Jahresabschluss],
      sentence: "Jahresabschluss erstellen",
      charactericon: "EB"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.Jahresabschluss;
  }

  protected renderDriveData() {
    return (
      <div>
        <div className="LIST_ITEM">
          <ServerButton text="Umsatzsteuer Jahresabrechnung erstellen" onClick={this.handleBuchungenFuerUmsatzsteuerBerechnenUndEintragen}></ServerButton>
          <ServerButton text="Simbaexport erstellen" onClick={window.serverProxy.SimbaExportErstellen}></ServerButton>
          <ServerButton text={`${(this.getBM().beginOfYear().getFullYear()+1).toString()} installieren`} onClick={window.serverProxy.naechstesJahrInstallieren}></ServerButton>
        </div>
        <div className="LIST_ITEM">{this.renderTableArray(this.getBM().getKontenArray(),"Subtyp,Konto,Summe")}</div>
      </div>
    )
  }

  protected handleBuchungenFuerUmsatzsteuerBerechnenUndEintragen() {
    window.serverProxy.BuchungenFuerUmsatzsteuerBerechnenUndEintragen();
  }

}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Jahresabschluss] = Jahresabschluss;

export default Jahresabschluss;