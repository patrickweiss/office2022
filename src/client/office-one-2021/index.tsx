import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import './index.css';
import Logger from './framework/Logger';
import { leafClasses } from './framework/OfficeLeaf';
import { IOfficeWindow } from './framework/OfficeWindow';
import { ServerProxy } from './framework/ServerProxy';

//import registerServiceWorker from './registerServiceWorker';

// add react support: npm install redux
import { createStore } from 'redux';
import { compose } from 'redux';
import { applyMiddleware } from 'redux';
// add thunk to dispatch multiple actions for just one UI event: npm install redux-thunk
import ReduxThunk from 'redux-thunk';

// tslint:disable-next-line:ordered-imports
import { reducer } from './OfficeOnePocket';
//import { BusinessModel } from './AppDasBuch/BusinessModel';

// import {reducer} from './AppDasBuch/AppDasBuch';

// tslint:disable:no-namespace
declare namespace gapi.auth2 {
  export function getAuthInstance(): any
}
declare namespace gapi.client {
  export function init(a: any): any
}

declare namespace gapi {
  export function load(a: string, b: Function): any
}

declare let window: IOfficeWindow;
window.serverProxy = new ServerProxy();
//window.BM = new BusinessModel();

let reduxMiddleware;

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxMiddleware = compose(
    applyMiddleware(ReduxThunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
} else { reduxMiddleware = applyMiddleware(ReduxThunk); }
//reduxMiddleware = applyMiddleware(ReduxThunk);
window.logger = new Logger("debug");

//handleClientLoad();

window.logger.debug("index.tsx 57");
window.store = createStore(
  reducer,
  reduxMiddleware
);

window.logger.debug("index.tsx 62");
console.log(window.store.getState());
class App extends React.Component {
  public render() {
    window.logger.debug("3. App.render--------------------------------------------");
    const CurrentLeaf = leafClasses[window.store.getState().UI.leaf];
    return <CurrentLeaf size="MOBILE" />;
  }
}


//registerServiceWorker();
//ReactDOM.render(<App />, document.getElementById('index'));

ReactDOM.render(<App />, document.getElementById('index'));
window.store.subscribe(() => {
  window.logger.debug("index.tsx --> 3. before render ---------------------------------------------");
  console.log(window.store.getState())
  ReactDOM.render(<App />, document.getElementById('index'));
  console.log(window.store.getState())
  window.logger.debug("index.tsx --> 3. after render ---------------------------------------------");
});
