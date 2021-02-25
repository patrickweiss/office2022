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
    protected text: string;
    protected id?:string;
    protected a?:string;
    protected onClick: (event: MouseEvent) => void;
    constructor(props: IServerButton) {
        super(props);
        this.text = props.text;
        this.id=props.id;
        this.a=props.a;
        this.onClick=props.onClick;
        this.handleClick=this.handleClick.bind(this);
    }
    render() { 
        let disabled = true;
        if (window.store.getState().UI.waitingForResponse===false)disabled=false;

        if (this.props.strong) return <button onClick={this.handleClick} disabled={disabled}><strong id={this.id} data-a={this.a}>{this.text}</strong></button>
        else
            return <button onClick={this.handleClick} disabled={disabled} id={this.id} data-a={this.a}>{this.text}</button>
    }
    handleClick(e:any){
        this.onClick(e);
    }
  }

export { ServerButton };