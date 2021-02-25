import * as React from "react";
import { DriveLeaf } from "../framework/DriveLeaf";
import * as OfficeLeaf from "../framework/OfficeLeaf";
import { IOfficeWindow } from "../framework/OfficeWindow";
import Ausgaben from "./Ausgaben";
import Bankbuchungen from "./Bankbuchungen";
import Einnahmen from "./Einnahmen";
import Eroeffnungsbilanz from "./Eroeffnungsbilanz";
import Jahresabschluss from "./Jahresabschluss";
import JahrMonat from "./JahrMonat";
import SAWAG from "./SAWAG";
import UStVAAbgeben from "./UStVAAbgeben";
declare let window: IOfficeWindow;


class C2021OfficeOnePocket extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {

    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: props.title || "2021 OfficeOne.Pocket",
      path: props.path || [OfficeLeaf.Leafs.C2021OfficeOnePocket],
      sentence: props.sentence || "Business mit Google Workplace",
      charactericon: props.charactericon || "OOP"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.C2021OfficeOnePocket;
  }


  protected renderMobile() {
    return (
      <div>
        <p className="MITTIG">Ein Produkt der <SAWAG size="BUTTON" /></p>
        {this.renderLeafContent()}
      </div>
    )
  }
  protected renderLoggedOut() {
    return (
        <div className="LIST_ITEM">
            <button id="authorize-button" >Mit Google Account anmelden, um OfficeOne.Pocket mit Google Drive zu verbinden</button>
        </div>
    )
}

  protected renderDriveData() {
    let driveData = <div> 
      <div className="LIST_ITEM">

         <Eroeffnungsbilanz size="BUTTON" />
        </div>
      <JahrMonat size="LIST_ITEM"/>
      <Einnahmen size="LIST_ITEM" />
      <h2><Ausgaben size="LIST_ITEM" /></h2>
      <h2><Bankbuchungen size="LIST_ITEM" /></h2>
      <h2><UStVAAbgeben size="LIST_ITEM" /></h2>
      <h1><Jahresabschluss size="BUTTON" /></h1>
      <p className="MITTIG">EÜR </p>
      </div>
      ;

    return (
      <div>
        {driveData}
        <p className="MITTIG"><SAWAG size="BUTTON" title="Impressum" /></p>
      </div>
    );
  }

}
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.C2021OfficeOnePocket] = C2021OfficeOnePocket;

export default C2021OfficeOnePocket;