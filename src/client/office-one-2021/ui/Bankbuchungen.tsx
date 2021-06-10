import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { Umbuchung, Bankbuchung } from '../bm/BusinessDataFacade';
import { Type, reducerFunctions, IAction } from '../framework/Action';

import { IOfficeWindow } from '../framework/OfficeWindow';
import JahrMonat from './JahrMonat';
import { ServerButton } from '../framework/ServerButton';
import { BelegTyp } from "../bm/BusinessModel";
import RechnungenListen from "./RechnungenListen";
declare let window: IOfficeWindow;


// tslint:disable:object-literal-sort-keys

export interface IBankbuchungZurueck extends IAction {
  bankbuchungID: string;
}

export interface IBelegZuBankbuchungZuordnen extends IBankbuchungZurueck {
  belegTyp: BelegTyp;
  belegID: string;
  datum: Date;
}

// tslint:disable-next-line:only-arrow-functions
reducerFunctions[Type.BelegZuBankbuchungZuordnen] = function (newState: any, action: IBelegZuBankbuchungZuordnen) {
  window.BM.handleAction(action);
  newState.UI.actionBatch=true;
  return newState;
}
// tslint:disable-next-line:only-arrow-functions
reducerFunctions[Type.buchungZurueckstellen] = function (newState: any, action: IBelegZuBankbuchungZuordnen) {
  window.BM.handleAction(action);
  newState.UI.actionBatch=true;
  return newState;
}


class Bankbuchungen extends DriveLeaf {
  private bankbuchungOhneZuordnung: Bankbuchung;
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Bankbuchungen",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Bankbuchungen],
      sentence: "3 Bankbuchungen zuordnen",
      charactericon: "Bb"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.Bankbuchungen;
    this.belegZuordnen = this.belegZuordnen.bind(this);
    this.buchungZurueckstellen = this.buchungZurueckstellen.bind(this);
    this.handleDriveScannen = this.handleDriveScannen.bind(this);

  }
  protected renderButton() {
    return <div className="INLINE">Zahlungen in <JahrMonat size="BUTTON" /></div>;
  }

  protected renderListItem() {
    return <div className="LIST_ITEM"><button className="linkButton" type="button" onClick={this.handleClick}>{this.sentence}</button></div>;
  }

  protected renderMobile() {
    return (
      <div>
        {this.renderLeafContent()}
      </div>
    )
  }
  protected renderDriveData() {
    this.bankbuchungOhneZuordnung = this.getBM().getBankbuchungenNichtZugeordnetArray()[0];
    let bankbuchungHTML = <p><strong>Alle Bankbuchungen sind schon zugeordnet. Bei Knopfdruck wird {this.getBM().endOfYear().getFullYear()} <JahrMonat size="BUTTON" /> als Bezahldatum OHNE Zuordnung zu einer Bankbuchung eingetragen.</strong></p>;
    if (this.bankbuchungOhneZuordnung !== undefined) bankbuchungHTML = 
    <p>
      {this.formatDate(this.bankbuchungOhneZuordnung.getDatum())} <strong>{this.formatMoney(this.bankbuchungOhneZuordnung.getBetrag())}</strong>
       {this.bankbuchungOhneZuordnung.getText()} <ServerButton text="zurückstellen" onClick={this.buchungZurueckstellen} />
    </p>

    const offeneAusgaben = this.getBM().getOffeneAusgabenRechnungArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Ausgabe));
    const offeneBewirtungsbelege = this.getBM().getOffeneBewirtungsbelegeArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Bewirtungsbeleg));
    const offeneEinnahmen = this.getBM().getOffeneEinnahmenRechnungArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Rechnung));
    const offeneEUEinnahmen = this.getBM().getEURechnungArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.EURechnung));
    const offeneGutschriften = this.getBM().getOffeneGutschriftenArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Gutschrift));
    const offeneUmbuchungen = this.getBM().getOffeneUmbuchungenArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Umbuchung));
    const offeneVertraege = this.getBM().getOffeneVertraegeArray().map((rechnung: Umbuchung) => this.renderOffeneRechnung(rechnung, BelegTyp.Vertrag));
    return (
      <div>
        <h1>Bankkonten und Bestände</h1>
        <p className="MITTIG">{this.renderBankkonten()}
          <ServerButton text="Drive scannen" onClick={this.handleDriveScannen} />
        </p>
        {bankbuchungHTML}
        <div className="LIST_ITEM">
          <table>
            <tbody>
              <tr key="ausgaben"><th colSpan={3}>offene Ausgaben</th></tr>
              {offeneAusgaben}
              <tr key="bewirtungsbelege"><th colSpan={3}>offene Bewirtungsbelege</th></tr>
              {offeneBewirtungsbelege}
              <tr key="einnahmen"><th colSpan={3}>offene Einnahmen</th></tr>
              {offeneEinnahmen}
              <tr key="eueinnahmen"><th colSpan={3}>offene EU Einnahmen</th></tr>
              {offeneEUEinnahmen}
              <tr key="gutschriften"><th colSpan={3}>offene Gutschriften</th></tr>
              {offeneGutschriften}
              <tr key="umbuchungen"><th colSpan={3}>offene Umbuchungen</th></tr>
              {offeneUmbuchungen}
              <tr key="vertraege"><th colSpan={3}>Laufende Verträge</th></tr>
              {offeneVertraege}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  protected renderBankkonten(){
    return this.getBM().getBankontenArray().map(konto => <React.Fragment>{konto}:{this.formatMoney(this.getBM().getBankbestand(konto))}  </React.Fragment>)
  }
  protected renderOffeneRechnung(umbuchung: Umbuchung, belegtyp: BelegTyp) {
    let offenerBelegBetrag = umbuchung.getBetragMitVorzeichen();
    if (belegtyp!==BelegTyp.Vertrag)offenerBelegBetrag=this.getBM().getOffenerBelegBetrag(umbuchung);
    return (
      <tr key={umbuchung.getId()}>
        <td><ServerButton
          text={this.formatMoney(offenerBelegBetrag)}
          onClick={this.belegZuordnen}
          strong={this.bankbuchungOhneZuordnung !== undefined && Math.abs(this.bankbuchungOhneZuordnung.getBetrag() - offenerBelegBetrag) < 0.001}
          id={umbuchung.getId()}
          a={belegtyp} />
        </td>
        <td>{umbuchung.getKonto().substr(0, 20)}</td>
        <td>{umbuchung.getGegenkonto().substr(0, 20)}</td>
      </tr>)
  }
  protected belegZuordnen(e: any) {
    let bankbuchungId = "";
    if (this.bankbuchungOhneZuordnung) bankbuchungId = this.bankbuchungOhneZuordnung.getId();
    let action: IBelegZuBankbuchungZuordnen = {
      type: Type.BelegZuBankbuchungZuordnen,
      belegTyp: e.target.dataset.a,
      belegID: e.target.id,
      bankbuchungID: bankbuchungId,
      datum: new Date(this.getBM().endOfYear().getFullYear(), parseInt(this.getUIState().buchungsperiode) - 1, 1),
    }
    this.updateBMbatch(action);
  }
  protected buchungZurueckstellen(e:any){
    let bankbuchungId = "";
    if (this.bankbuchungOhneZuordnung) bankbuchungId = this.bankbuchungOhneZuordnung.getId();
    let action: IBankbuchungZurueck={
      type: Type.buchungZurueckstellen,
      bankbuchungID: bankbuchungId
    }
    this.updateBMbatch(action);
  }
  protected handleDriveScannen() {
    window.serverProxy.bankbuchungenFolderScannen(window.BM.getRootFolderId(), this.getUIState().buchungsperiode.split(" ")[0]);
  }

}



// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Bankbuchungen] = Bankbuchungen;

export default Bankbuchungen;