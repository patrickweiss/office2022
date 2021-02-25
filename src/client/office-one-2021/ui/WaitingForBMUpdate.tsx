// tslint:disable:ordered-imports
// import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';


class WaitingForBMUpdate extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "WaitingForBMUpdate",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.WaitingForBMUpdate],
      sentence: "WaitingForBMUpdate",
      charactericon: "WBMU"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.WaitingForBMUpdate;
 
  }

  
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.WaitingForBMUpdate] = WaitingForBMUpdate;

export default WaitingForBMUpdate;