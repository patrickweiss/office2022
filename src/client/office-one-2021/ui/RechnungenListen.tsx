import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import JahrMonat from './JahrMonat';

class RechnungenListen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Rechnungen auflisten",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.RechnungenListen],
      sentence: "Rechnungen auflisten",
      charactericon: "DT"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.RechnungenListen;

  }

  protected renderDriveData() {

      const data = this.getBM().getRechnungenFuerMonat(this.getUIState().buchungsperiode);
      if (data.length > 0) {
       return (
         <div>
           <h2>Rechnungen <JahrMonat size="BUTTON"/></h2>
         {this.renderTableArray(data, "Rechnungsbetrag,Name")}
         </div>
       )
      } 
      else { return <h2>Keine Rechnungen in <JahrMonat size="BUTTON"/></h2> }
  }
}

OfficeLeaf.leafClasses[OfficeLeaf.Leafs.RechnungenListen] = RechnungenListen;

export default RechnungenListen;