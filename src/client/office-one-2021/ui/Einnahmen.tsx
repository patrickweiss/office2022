import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import Gutschriften from './Gutschriften';
import Rechnungen from './Rechnungen';
 

class Einnahmen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
        size: props.size,
        title: "Einnahmen",
        path:[OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Einnahmen],
        sentence:"1 Einnahmen erfassen",
        charactericon: "Au"
        }
        super(newProps);
        this.leafName=OfficeLeaf.Leafs.Einnahmen;
     
  }
 
  protected renderListItem() {
    return <div className="LIST_ITEM">
    <h2>{this.sentence}</h2>
    <p><Rechnungen size="LIST_ITEM"/> <Gutschriften size="LIST_ITEM"/></p>
    </div>;
  }
  protected renderMobile() {
    return this.renderLeafContent();
  }

 
}

 // tslint:disable-next-line:no-string-literal
 OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Einnahmen]=Einnahmen;

 export default Einnahmen;