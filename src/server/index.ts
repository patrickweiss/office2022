import * as publicUiFunctions from './ui';

// Expose public functions by attaching to `global`

interface IglobalFuntions {
    onOpen: () => void;
    installOO22: () => void;
}

declare let global: IglobalFuntions;

global.onOpen = publicUiFunctions.onOpen;
global.installOO22 = publicUiFunctions.installOO22;
