import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { IOfficeWindow } from '../framework/OfficeWindow';
import { ServerButton } from '../framework/ServerButton';
declare let window: IOfficeWindow;


class Eroeffnungsbilanz extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Eröffnungsbilanz",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Eroeffnungsbilanz],
      sentence: "Eröffnungsbilanz erstellen",
      charactericon: "EB"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.Eroeffnungsbilanz;
  }

  protected renderListItem() {
    return <div className="LIST_ITEM"><button className="linkButton" type="button" onClick={this.handleClick}>{this.sentence}</button></div>;
  }

  protected renderDriveData() {

    return <div className="LIST_ITEM">
      <ServerButton text="Eröffnungsbilanz auf Basis der Daten aus dem Vorjahr aktualisieren" onClick={this.handleEroeffnungsbilanzAusVorjahrAktualisieren}></ServerButton>
      </div>
  }

  protected handleEroeffnungsbilanzAusVorjahrAktualisieren() {
    window.serverProxy.EroeffnungsbilanzAusVorjahrAktualisieren(window.BM.getVorjahrInstanceName());
  }

}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Eroeffnungsbilanz] = Eroeffnungsbilanz;

export default Eroeffnungsbilanz;