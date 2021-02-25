import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from '../framework/OfficeLeaf';
// tslint:disable:object-literal-sort-keys
import * as Action from '../framework/Action';
import Ausgaben from './Ausgaben';
import Einnahmen from './Einnahmen';
import Bankbuchungen from './Bankbuchungen';
import { DriveLeaf } from '../framework/DriveLeaf';


export interface IBuchungsperiodeWaehlen extends Action.IAction {
  newBuchungsperiode: string;
}

// tslint:disable-next-line:only-arrow-functions






class BuchungsperiodeWaehlen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Buchungsperiode wählen",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Monatsabschluss, OfficeLeaf.Leafs.BuchungsperiodeWaehlen],
      sentence: "Buchungsperiode wählen",
      charactericon: "SV"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.BuchungsperiodeWaehlen;
    if (this.getUIState().buchungsperiode){
      this.title=this.getUIState().buchungsperiode.split(" ")[1];
      this.charactericon=this.getUIState().buchungsperiode.split(" ")[0];
    }
  }
  protected renderListItem() {
    return (
      <div className="LIST_ITEM">
        <h2>Buchungsperiode Wählen</h2>
        <table>
          <tbody>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>01 Januar</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>07 Juli</button></td>
            </tr>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>02 Februar</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>08 August</button></td>
            </tr>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>03 März</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>09 September</button></td>
            </tr>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>04 April</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>10 Oktober</button></td>
            </tr>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>05 Mai</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>11 November</button></td>
            </tr>
            <tr>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>06 Juni</button></td>
              <td><button className="linkButton" type="button" onClick={this.handleClick}>12 Dezember</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  protected renderMobile() {
    return (
      <div>
        <h1>Monatsabschluss im {this.title}</h1>
        {this.renderLeafContent()}
      </div>
    )

  }

  protected renderDriveData() {
    return (
      <div>
        <div className="LIST_ITEM"><Ausgaben size="BUTTON" /></div>
        <div className="LIST_ITEM"><Einnahmen size="BUTTON" /></div>
        <div className="LIST_ITEM"><Bankbuchungen size="BUTTON" /></div>
      </div>
    )
  }

  protected handleClick(e: any) {
    if (this.size === "MOBILE" || this.size === "LIST_ITEM") {
      const monat = e.target.textContent;
      const a: IBuchungsperiodeWaehlen = {
        type: Action.Type.ChangeBuchungsperiode,
        newBuchungsperiode: monat
      }
      this.handleAction(a);
    } else {
      const a: OfficeLeaf.IchangeLeaf = {
        type: Action.Type.ChangeLeaf,
        newLeaf: OfficeLeaf.Leafs.Monatsabschluss
      }
      this.handleAction(a);
    }
  }
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.BuchungsperiodeWaehlen] = BuchungsperiodeWaehlen;

export default BuchungsperiodeWaehlen;