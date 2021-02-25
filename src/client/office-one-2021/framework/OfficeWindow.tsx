import {BusinessModel} from '../bm/BusinessModel'
import {ServerProxy} from './ServerProxy'
import Logger from './Logger';

export interface IOfficeWindow extends Window {
    store: any;
    logger: Logger;
    accessToken: any;
    __REDUX_DEVTOOLS_EXTENSION__: any;
    globaleBelegDatei:any
    BM:BusinessModel;
    serverProxy:ServerProxy;
}