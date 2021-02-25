import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
// tslint:disable-next-line:ordered-imports
import { DriveLeaf } from '../framework/DriveLeaf';
// tslint:disable:object-literal-sort-keys
// import { serverCall } from '../framework/serverActions';

// import { IOfficeWindow } from '../framework/OfficeWindow';
// declare let window: IOfficeWindow;


class AusgabenListen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Ausgaben auflisten",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.AusgabenListen],
      sentence: "Ausgaben auflisten",
      charactericon: "DT"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.AusgabenListen;

  }

  protected renderDriveData() {

      const data = this.getBM().getAusgabenFuerMonat(this.getUIState().buchungsperiode);
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
           <h2>Bisher erfasste Ausgaben</h2>
         {this.renderTableArray(data, "brutto Betrag,Konto,Gegenkonto")}
         </div>
       )
      } 
      else { return <h2> Noch keine Ausgaben erfasst</h2> }
  }
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.AusgabenListen] = AusgabenListen;

export default AusgabenListen;