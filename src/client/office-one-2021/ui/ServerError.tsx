import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from '../framework/OfficeLeaf';
// tslint:disable:object-literal-sort-keys
 

class ServerError extends OfficeLeaf.OfficeLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
        size: props.size,
        title: "Server Error",
        path:[OfficeLeaf.Leafs.C2021OfficeOnePocket,OfficeLeaf.Leafs.ServerError],
        sentence:"Beim ausführen einer Funktion auf dem Server ist ein Fehler aufgetreten",
        charactericon: "SE"
        }
        super(newProps);
        this.leafName=OfficeLeaf.Leafs.ServerError;  
  }
  protected renderMobile() {
    return (
      <div>
      <h1>Server Error</h1>
       {(this.getUIState().error as string).split("\n").map( text => <p>{text}</p>)}
      </div>
    );
  }
  private renderParagraph(text:string){
    return (<p>{text}</p>)
  }
}

 // tslint:disable-next-line:no-string-literal
 OfficeLeaf.leafClasses[OfficeLeaf.Leafs.ServerError]=ServerError;

 export default ServerError;