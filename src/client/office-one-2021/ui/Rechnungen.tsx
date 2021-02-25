import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import JahrMonat from './JahrMonat';
import RechnungenListen from './RechnungenListen';
 

class Rechnungen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
        size: props.size,
        title: "Rechnungen",
        path:[OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Rechnungen],
        sentence:"1 Rechnungen erfassen",
        charactericon: "Re"
        }
        super(newProps);
        this.leafName=OfficeLeaf.Leafs.Rechnungen;
     
  }
  protected renderButton(){
    return <div className="INLINE">Rechnungen in <JahrMonat size="BUTTON" /></div>;
  }

  protected renderListItem() {
    return <button className="linkButton" type="button" onClick={this.handleClick}>{this.title}</button>;
  }
  protected renderMobile() {
    return this.renderLeafContent();
  }

  protected renderDriveData() {
    return (
      <div>
        <RechnungenListen size="LIST_ITEM" />
      </div>
    )
  }
}

 OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Rechnungen]=Rechnungen;

 export default Rechnungen;