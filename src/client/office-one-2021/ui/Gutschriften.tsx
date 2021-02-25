import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import JahrMonat from './JahrMonat';
import GutschriftErfassen from './GutschriftErfassen';
import GutschriftenListen from './GutschriftenListen';
 

class Gutschriften extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
        size: props.size,
        title: "Gutschriften",
        path:[OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Gutschriften],
        sentence:"1 Gutschriften erfassen",
        charactericon: "Au"
        }
        super(newProps);
        this.leafName=OfficeLeaf.Leafs.Gutschriften;
     
  }
  protected renderButton(){
    return <div className="INLINE">Gutschriften in <JahrMonat size="BUTTON" /></div>;
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
        <GutschriftErfassen size="LIST_ITEM" />
        <GutschriftenListen size="LIST_ITEM" />
      </div>
    )
  }
}

 OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Gutschriften]=Gutschriften;

 export default Gutschriften;