import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { IBuchungsperiodeWaehlen } from './BuchungsperiodeWaehlen';
import * as Action from '../framework/Action';

const monate={
    0:"01 Januar",
    1:"02 Februar",
    2:"03 März",
    3:"04 April",
    4:"05 Mai",
    5:"06 Juni",
    6:"07 Juli",
    7:"08 August",
    8:"09 September",
    9:"10 Oktober",
    10:"11 November",
    11:"12 Dezember"
};
Action.reducerFunctions[Action.Type.ChangeBuchungsperiode] = function (newState: any, action: IBuchungsperiodeWaehlen) {
    newState.UI.buchungsperiode = action.newBuchungsperiode;
  //  newState.UI.leaf = OfficeLeaf.Leafs.BuchungsperiodeWaehlen;
    return newState;
  }
class JahrMonat extends DriveLeaf {
   
    constructor(props: OfficeLeaf.ILeaf) {
      const newProps: OfficeLeaf.ILeaf = {
        size: props.size,
        title: "JahrMonat",
        path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.JahrMonat],
        sentence: "2019 << 01 Januar >>",
        charactericon: "JM"
      }
      super(newProps);
      this.leafName = OfficeLeaf.Leafs.JahrMonat;
      this.handleBackward=this.handleBackward.bind(this);
      this.handleForward=this.handleForward.bind(this);
    }
    protected renderDriveData(){
        const back="<<";
        const forward=">>";
        return (<div className="LIST_ITEM"><h1>{this.getBM().endOfYear().getFullYear()} <button className="linkButton" onClick={this.handleBackward}>{back}</button> {this.getBuchungsperiode()} <button className="linkButton" onClick={this.handleForward}>{forward}</button>
        </h1></div>);
    }
    protected renderButton(){
      const back="<<";
      const forward=">>";
      return <span className="INLINE"><button className="linkButton" onClick={this.handleBackward}>{back}</button> {this.getBuchungsperiode()} <button className="linkButton" onClick={this.handleForward}>{forward}</button></span>;
    }
    protected handleBackward(){
        let monat = this.getBuchungsperiode();
        if (monat==="01 Januar"){monat ="12 Dezember"}
        else{
            monat=monate[parseInt(monat.split(" ")[0])-2];
        }
        const a: IBuchungsperiodeWaehlen = {
            type: Action.Type.ChangeBuchungsperiode,
            newBuchungsperiode: monat
          }
          this.handleAction(a);
    }
    protected handleForward(){
        let monat = this.getBuchungsperiode();
        if (monat==="12 Dezember"){monat ="01 Januar"}
        else{
            monat=monate[parseInt(monat.split(" ")[0])];
        }
        const a: IBuchungsperiodeWaehlen = {
            type: Action.Type.ChangeBuchungsperiode,
            newBuchungsperiode: monat
          }
          this.handleAction(a);
    }
    protected getBuchungsperiode(){
        if (this.getUIState().buchungsperiode) return this.getUIState().buchungsperiode
        const a: IBuchungsperiodeWaehlen = {
          type: Action.Type.ChangeBuchungsperiode,
          newBuchungsperiode: monate[new Date().getMonth()]
        }
        this.handleAction(a);
        return monate[new Date().getMonth()];
    } 
  }
  
  // tslint:disable-next-line:no-string-literal
  OfficeLeaf.leafClasses[OfficeLeaf.Leafs.JahrMonat] = JahrMonat;
  
  export default JahrMonat;