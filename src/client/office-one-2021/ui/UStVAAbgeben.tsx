// tslint:disable:ordered-imports
import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';

import { IOfficeWindow } from '../framework/OfficeWindow';
import { ServerButton } from '../framework/ServerButton';
import JahrMonat from './JahrMonat';
import UStVAberechnet from './UStVAberechnet';
declare let window: IOfficeWindow;


class UStVAAbgeben extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "UStVA",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.UStVAAbgeben],
      sentence: "4 UStVA abgeben",
      charactericon: "UStVA"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.UStVAAbgeben;
    this.handleUStVAberechnen=this.handleUStVAberechnen.bind(this);
    this.handleUStVAverschicken=this.handleUStVAverschicken.bind(this);
    this.handlePostfachScannen=this.handlePostfachScannen.bind(this);
  }

  protected renderButton() {
    return <div className="INLINE">UStVA für <JahrMonat size="BUTTON" /></div>;
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
    return (
      <div>
        <div className="LIST_ITEM">
          <ServerButton text="UStVA berechnen" onClick={this.handleUStVAberechnen}></ServerButton>
          <ServerButton text="UStVA verschicken" onClick={this.handleUStVAverschicken}></ServerButton>
          <ServerButton text="UStVA E-Mail scannen" onClick={this.handlePostfachScannen}></ServerButton>
        </div>
        <UStVAberechnet size="LIST_ITEM"/>
      </div>
    )
  }

  protected renderKonten(){
    const data = this.getBM().getNormalisierteBuchungenArray();
    if (data.length > 0) {
     return (
       <div>
         <h2>Buchungen</h2>
       {this.renderTableArray(data, "ID,Gegenkonto,Betrag")}
       </div>
     )
    } 
    else { return <h2> Noch keine Ausgaben erfasst</h2> }
  }

  protected handleUStVAberechnen() {
    window.serverProxy.UStVAberechnen(window.BM.getRootFolderId(), this.getUIState().buchungsperiode.split(" ")[0]);
  }
  protected handleUStVAverschicken() {
    window.serverProxy.UStVAverschicken(window.BM.getRootFolderId(), this.getBM().getUStVAFuerMonat(this.getUIState().buchungsperiode)[0]);
  }
  private handlePostfachScannen(){
    window.serverProxy.UStVAbuchen(window.BM.getRootFolderId(), this.getUIState().buchungsperiode.split(" ")[0]);

  }


}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.UStVAAbgeben] = UStVAAbgeben;

export default UStVAAbgeben;