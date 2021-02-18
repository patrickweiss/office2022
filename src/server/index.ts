import { deleteSystem0055 } from './oo21lib/driveConnector';
import * as publicUiFunctions from './ui';

// Expose public functions by attaching to `global`

interface IglobalFuntions {
    onOpen: () => void;
    installOO22: () => void;
    updateOO22:() => void;
    deleteSystem:()=>void;
}

declare let global: IglobalFuntions;

global.onOpen = publicUiFunctions.onOpen;
global.installOO22 = publicUiFunctions.installOO22;
global.updateOO22 = publicUiFunctions.updateOO22
global.deleteSystem = deleteSystem0055;
