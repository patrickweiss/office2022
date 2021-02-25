import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import JahrMonat from './JahrMonat';

class GutschriftenListen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Gutschriften auflisten",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.GutschriftenListen],
      sentence: "Gutschriften auflisten",
      charactericon: "DT"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.GutschriftenListen;

  }

  protected renderDriveData() {

      const data = this.getBM().getGutschriftenFuerMonat(this.getUIState().buchungsperiode);
      if (data.length > 0) {
       return (
         <div>
           <h2>Gutschriften <JahrMonat size="BUTTON"/></h2>
         {this.renderTableArray(data, "Name,Gutschriftbetrag,Summe Umsatzsteuer,Summe netto")}
         </div>
       )
      } 
      else { return <h2>Keine Gutschriften in <JahrMonat size="BUTTON"/></h2> }
  }
}

OfficeLeaf.leafClasses[OfficeLeaf.Leafs.GutschriftenListen] = GutschriftenListen;

export default GutschriftenListen;