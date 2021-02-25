import * as React from "react";
import * as OfficeLeaf from '../framework/OfficeLeaf';
import { DriveLeaf } from '../framework/DriveLeaf';
import { IchangeContent } from './AusgabeErfassen';
import * as Action from '../framework/Action';
import { ServerButton } from '../framework/ServerButton';
import { IOfficeWindow } from '../framework/OfficeWindow';
declare let window: IOfficeWindow;


class GutschriftErfassen extends DriveLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title: "GutschriftErfassen",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.GutschriftErfassen],
      sentence: "GutschriftErfassen",
      charactericon: "Ge"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.GutschriftErfassen;
    this.handleDriveScannen = this.handleDriveScannen.bind(this); 
  }
  protected renderListItem() {
    return (
      <div>
        <div className="LIST_ITEM"><h2>Gutschrift erfassen</h2>
        <ServerButton text="Drive scannen" onClick={this.handleDriveScannen}></ServerButton>
        </div>

    
      </div>
    );
  }
  protected handleDriveScannen() {
    window.serverProxy.gutschriftenFolderScannen(window.BM.getRootFolderId(), this.getUIState().buchungsperiode.split(" ")[0]);
  }

  protected handleClick(e: any) {
    if (this.size === "LIST_ITEM") {
      const a: IchangeContent = {
        type: Action.Type.ChangeLeafContent,
        content: e.target.parentElement.id
      }
      this.handleAction(a);
    }
    else {
      super.handleClick(e);
    }
  }
  
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.GutschriftErfassen] = GutschriftErfassen;

export default GutschriftErfassen;