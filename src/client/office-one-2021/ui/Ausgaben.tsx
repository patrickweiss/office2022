import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from '../framework/OfficeLeaf';
import AusgabeErfassen from './AusgabeErfassen';
import AusgabenListen from './AusgabenListen';
// tslint:disable:object-literal-sort-keys
import { DriveLeaf } from '../framework/DriveLeaf';
import JahrMonat from './JahrMonat';
// import { IOfficeWindow } from '../oo-components/OfficeWindow';
// declare let window: IOfficeWindow;


class Ausgaben extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "Ausgaben",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.Ausgaben],
      sentence: "2 Ausgaben erfassen",
      charactericon: "Au"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.Ausgaben;
  }

  protected renderButton(){
    return <div className="INLINE">Ausgaben in <JahrMonat size="BUTTON" /></div>;
  }

  protected renderListItem() {
    return <div className="LIST_ITEM"><button className="linkButton" type="button" onClick={this.handleClick}>{this.sentence}</button></div>;
  }
  protected renderMobile() {
    return this.renderLeafContent();
  }

  protected renderDriveData() {
    return (
      <div>
        <AusgabeErfassen size="LIST_ITEM" />
        <AusgabenListen size="LIST_ITEM" />
      </div>
    )
  }
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.Ausgaben] = Ausgaben;

export default Ausgaben;