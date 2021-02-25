// This is a wrapper for google.script.run that lets us use promises.
import server from '../../utils/server';
const { serverFunctions } = server;

import * as Action from './Action';
import { IOfficeWindow } from './OfficeWindow';
import { reducerFunctions, ServerFunction } from './ServerProxy';
import { Leafs } from './OfficeLeaf';


declare let window: IOfficeWindow;

export interface IserverAction extends Action.IAction {
    functionName: string;
    parametersArray: any[];
}
export interface IserverResponse extends Action.IAction {
    response: string;
}

Action.reducerFunctions[Action.Type.ServerCall] = function (newState: any, action: IserverAction) {
    // tslint:disable:curly
    window.logger.debug("2. ACTION.functionName: " + action.functionName);
    newState.UI.waitingForResponse = action.functionName;
    switch (action.functionName) {
        case ServerFunction.getOrCreateOfficeOneFolders:
            newState.BM.instanceName = "loading";
            break
        case ServerFunction.getOrCreateRootFolder:
            newState.BM.rootFolder.id = "loading";
            break
        case ServerFunction.getNamedRangeData:
            newState.BM[newState.BM.rootFolder.id][action.parametersArray[1]] = "loading";
            break
        case ServerFunction.getOrCreateAusgabenFolder:
            newState.BM[newState.BM.rootFolder.id].ausgabenFolder = "loading";
            break
        case ServerFunction.getOrCreateGutschriftenFolder:
            newState.BM[newState.BM.rootFolder.id].gutschriftenFolder = "loading";
            break
    }
}

Action.reducerFunctions[Action.Type.ServerError] = function (newState: any, action: IserverResponse) {
    if (newState === undefined) { return; }
    newState.BM.serverResponse = action.response;
    newState.UI.leaf = Leafs.ServerError;
    newState.UI.error = action.response;
}

Action.reducerFunctions[Action.Type.ServerResponse] = function (newState: any, action: IserverResponse) {
    if (newState === undefined) { return; }
    const serverResponse = JSON.parse(action.response);
    window.logger.debug("2. serverResponse:" + action.response);
    newState.BM.serverResponse = serverResponse;
    newState.UI.waitingForResponse = false;
    const reducerFunction = reducerFunctions[serverResponse.serverFunction];
    reducerFunction(newState, serverResponse);
}


export function serverCall(callParameter: any) {

    return function (dispatch: Function) {
        window.logger.debug("1. serverCall --> Action vor dem Serveraufruf");
        dispatch({
            type: Action.Type.ServerCall,
            functionName: callParameter.functionName,
            parametersArray: callParameter.parametersArray
        });

        return serverFunctions[callParameter.functionName](...callParameter.parametersArray)
            .then(function (result: any) {
                window.logger.debug("1. serverCall --> server_response ist angekommen");
                dispatch({ type: Action.Type.ServerResponse, response: result })
            }
            ).catch(
                (error) => {
                    dispatch(
                        { type: Action.Type.ServerError, response: JSON.stringify(error) }
                    )
                }
            )

    };
}

