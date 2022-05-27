import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { office, UStVAPeriode } from "../../../server/oo21lib/systemEnums";


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
    let buchungsperiode=this.getUIState().buchungsperiode
    //Q1 ist im Januar gespeichert
    if (buchungsperiode==="02" ||buchungsperiode==="03" )buchungsperiode="01";
    //Q2 ist im April gespeichert
    if (buchungsperiode==="05" ||buchungsperiode==="06" )buchungsperiode="04";
    //Q3 ist im July gespeichert
    if (buchungsperiode==="08" ||buchungsperiode==="09" )buchungsperiode="07";
    //Q4 ist im Oktober gespeichert
    if (buchungsperiode==="11" ||buchungsperiode==="12" )buchungsperiode="10";
    
    const data = this.getBM().getUStVAFuerMonat(this.getUIState().buchungsperiode);
    return <div>
      <h2>Quartal: Letzte UStVA Berechnung</h2>
      {this.renderTableArray(data, "Datum,Periode und Status,erstellt am,83")}
    </div>
  }
}


// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.UStVAberechnet] = UStVAberechnet;

export default UStVAberechnet;