import { BusinessModel } from "./oo21lib/businessModel";
import { ooFiles, ooTables } from "./oo21lib/enums0001";

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Office One 2022') // edit me!
    .addItem('Install System', 'installOO22')
    .addItem('Delete System', 'deleteSystem')
  menu.addToUi();
};

export const installOO22 = () => {
  SpreadsheetApp.getUi().alert("Your system will be installed or updated now. This may take up to 5 minutes");
  const fileId = SpreadsheetApp.getActive().getId();
  const bm = new BusinessModel(fileId,ooFiles.SalesFunnel);
  SpreadsheetApp.getUi().alert("Your system is now up to date and running");
};

