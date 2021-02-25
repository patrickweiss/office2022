// tslint:disable:ordered-imports
// import * as React from "react";

import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';


class DriveLeafTemplate extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "DriveLeafTemplate",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.DriveLeafTemplate],
      sentence: "DriveLeafTemplate",
      charactericon: "DT"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.DriveLeafTemplate;
 
  }

  
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.DriveLeafTemplate] = DriveLeafTemplate;

export default DriveLeafTemplate;