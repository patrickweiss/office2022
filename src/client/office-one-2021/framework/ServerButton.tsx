import * as React from "react";
import { IOfficeWindow } from './OfficeWindow';
declare let window: IOfficeWindow;

export interface IServerButton {
    text: string;
    id?:string;
    a?:string;
    strong?: boolean;
    onClick: (arg0: MouseEvent) => void;
}

class ServerButton extends React.Component<IServerButton, object> {
    //protected text: string;
    //protected id?:string;
    //protected a?:string;
    protected onClick: (event: MouseEvent) => void;
    constructor(props: IServerButton) {
        super(props);
      //  this.text = props.text;
      //  this.id=props.id;
      //  this.a=props.a;
        this.onClick=props.onClick;
        this.handleClick=this.handleClick.bind(this);
    }
    render() {
        try{ 
        let disabled = true;
        if (window.store.getState().UI.waitingForResponse===false)disabled=false;

        if (this.props.strong) return <button onClick={this.handleClick} disabled={disabled}><strong id={this.props.id} data-a={this.props.a}>{this.props.text}</strong></button>
        else
            return <button onClick={this.handleClick} disabled={disabled} id={this.props.id} data-a={this.props.a}>{this.props.text}</button>
        }catch (e){
            return <button>{e.toString()}</button>
        }
    }
    handleClick(e:any){
        console.log("Serverbutton geklickt:"+this.props.text);
        this.onClick(e);
    }
  }

export { ServerButton };