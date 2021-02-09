import { BusinessModel } from "./oo21lib/businessModel";
import { ooFiles, ooTables } from "./oo21lib/enums0055";
import { installSystem } from "./oo21lib/installSystem";

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Office One 2022') // edit me!
    .addItem('System starten', 'installOO22')
    .addItem('System löschen', 'deleteSystem')
  menu.addToUi();
};

interface IOO{
  installSystem: (fileId:string)=>void
}


export const installOO22 = () => {
  SpreadsheetApp.getUi().alert("Your system will be installed or updated now. This may take up to 5 minutes");
  const fileId = SpreadsheetApp.getActive().getId();
  installSystem(fileId,ooTables.businessConfiguration);
  SpreadsheetApp.getUi().alert("Your system is now up to date and running");
};

