import './index.css';
import { IOfficeWindow } from './framework/OfficeWindow';
import * as Action from './framework/Action';
// Startseite
import './ui/C2021OfficeOnePocket';
import './ui/DriveLeafTemplate';
import './ui/ServerError';
import './ui/WaitingForBMUpdate';

import './framework/DriveLeaf';
import { Leafs } from './framework/OfficeLeaf';
import { codeVersion, currentOOversion, developmentYear } from '../../server/oo21lib/systemEnums';

declare let window: IOfficeWindow;

// initial state 
export const initial = {
	UI: {
		status:`${developmentYear}.${currentOOversion}.${codeVersion}`,
		leaf: Leafs.C2021OfficeOnePocket,
		renderHelpOf: '',
		counter: 1,
		loggedIn: true,
		waitingForResponse: false,
		version:currentOOversion,
		UIversion:`${codeVersion}`,
		Ausgaben: {},
		Gutschriften:{content:"PhotoMachen"},
		umbuchung:{},
		vertrag:{},
		error:"keiner",
		actionBatch:false,
		triggers:"unbekannt"
	},
	BM: {
		vorjahrInstanceName:"",
		instanceName:"", 
		rootFolder:{}
	}
};
console.log("OfficeOnePocket.tsx:Z41:"+initial.UI.status);


export const reducer = (state = initial, action: Action.IAction) => {
	console.log(action);
	//let newState = state;
	const newState = JSON.parse(JSON.stringify(state));
	newState.UI.counter = state.UI.counter + 1;
	const reducerFunction = Action.reducerFunctions[action.type];
	if (reducerFunction !== undefined) {
		if (action.type!==Action.Type.PhotoGemacht) newState.UI.status= JSON.stringify(action);
		reducerFunction(newState,action);
		return newState;
	} else {
		switch (action.type) {
			case '@@INIT':
				return newState;
			default:
				window.logger.debug("1. FEHLER!!!!! kein Reducer für Action definiert");

				return newState;
		}
	}

};