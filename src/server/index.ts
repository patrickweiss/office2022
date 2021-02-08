import { deleteSystem } from './oo21lib/driveConnector';
import { installSystem } from './oo21lib/installSystem';
import * as publicUiFunctions from './ui';

// Expose public functions by attaching to `global`

interface IglobalFuntions {
    onOpen: () => void;
    installOO22: () => void;
    deleteSystem:()=>void;
}

declare let global: IglobalFuntions;

global.onOpen = publicUiFunctions.onOpen;
global.installOO22 = publicUiFunctions.installOO22;
global.deleteSystem = deleteSystem;
