import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { buchungsperiode, office, UStVAPeriode } from "../../../server/oo21lib/systemEnums";


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
    if (this.getBM().getConfigurationCache().getValueByName(office.UStVAPeriode)===UStVAPeriode.Quartal) return this.renderQuartalData();
    if (this.getBM().getConfigurationCache().getValueByName(office.UStVAPeriode)===UStVAPeriode.Jahr) return <h2> Finanzamt will keine UStVA, nur Umsatzsteuererklärung nach Ende des Jahres</h2>  
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
  protected renderQuartalData() {
    let bp=this.getUIState().buchungsperiode
    //Q1 ist im Januar gespeichert
    if (bp===buchungsperiode.m02 ||bp===buchungsperiode.m03 )bp=buchungsperiode.m01;
    //Q2 ist im April gespeichert
    if (bp===buchungsperiode.m05 ||bp===buchungsperiode.m06 )bp=buchungsperiode.m04;
    //Q3 ist im July gespeichert
    if (bp===buchungsperiode.m08 ||bp===buchungsperiode.m09 )bp=buchungsperiode.m07;
    //Q4 ist im Oktober gespeichert
    if (bp===buchungsperiode.m11 ||bp===buchungsperiode.m12 )bp=buchungsperiode.m10;
    const quartal = {}
    quartal[buchungsperiode.m01]="Quartal Q1"
    quartal[buchungsperiode.m04]="Quartal Q2"
    quartal[buchungsperiode.m07]="Quartal Q3"
    quartal[buchungsperiode.m10]="Quartal Q4"
    const data = this.getBM().getUStVAFuerMonat(bp);
    return <div>
      <h2>{quartal[bp]}: UStVA aktuelle Berechnung und verschickte Voranmeldung</h2>
      {this.renderTableArray(data, "Datum,Periode und Status,erstellt am,83")}
    </div>
  }
}


// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.UStVAberechnet] = UStVAberechnet;

export default UStVAberechnet;