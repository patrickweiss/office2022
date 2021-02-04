export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Office One 2022') // edit me!
    .addItem('Install System', 'installOO22')
  menu.addToUi();
};

export const installOO22 = () => {
  SpreadsheetApp.getUi().prompt("Your system will be installed now");
 };

