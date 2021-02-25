import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';


class UStVAberechnet extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Ausgaben auflisten",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.AusgabenListen],
      sentence: "Ausgaben auflisten",
      charactericon: "DT"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.UStVAberechnet;

  }

  protected renderDriveData() {
    const data = this.getBM().getUStVAFuerMonat(this.getUIState().buchungsperiode);
   
     // const data = this.getBM().getUStVAArray();
      if (data.length > 0) {
        /*const listItems = data.map((d: AusgabenRechnung) => <tr key={d.getId()}><td>{d.getBetrag()}</td><td>{d.getKonto()}</td><td>{d.getGegenkonto()}</td></tr>);
        return (
          <div className="LIST_ITEM">
            <table>
              <tbody>
                {listItems}
              </tbody>
            </table>

          </div>
        );
        */
       return (
         <div>
           <h2>Letzte UStVA Berechnung</h2>
         {this.renderTableArray(data, "Datum,Periode und Status,erstellt am,83")}
         </div>
       )
      } 
      else { return <h2> Noch keine UStVA berechnet</h2> }
  }
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.UStVAberechnet] = UStVAberechnet;

export default UStVAberechnet;