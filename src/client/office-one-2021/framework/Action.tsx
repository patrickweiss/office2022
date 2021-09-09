enum Type {
  INIT = "@@INIT",
  UpdateSigninStatus = "UpdateSigninStatus",
  ChangeLeaf = "ChangeLeaf",
  ChangeBuchungsperiode = "ChangeBuchungsperiode",
  ChangeLeafContent = "ChangeLeafContent",
  TypePressed = "TypePressed",
  KontoSelected = "KontoSelected",
  MwstSelected = "MwstSelected",
  GegenkontoSelected = "GegenkontoSelected",
  PhotoGemacht = "PhotoGemacht",
  ServerCall = "ServerCall",
  ServerResponse = "ServerResponse",
  ServerError = "ServerError",
  BelegGespeichert = "BelegGespeichert",
  GutschriftSpeichern = "GutschriftSpeichern",
  BelegZuBankbuchungZuordnen = "BelegZuBankbuchungZuordnen",
  AusgabeBuchen = "AusgabeBuchen",
  OOFolderSelected = "OOFolderSelected",
  OOFolderDisconnected = "OOFolderDisconnected",
  NeuesKostenKonto = "NeuesKostenKonto",
  NeuesAnlageKonto = "NeuesAnlageKonto",
  KontoUpdated = "KontoUpdated",
  PDFgewaehlt = "PDFgewaehlt",
  GutschriftBuchen = "GutschriftBuchen",
  StartBatchUpdate = "StartBatchUpdate",
  KISwitch = "KISwitch",
  
  buchungZurueckstellen = "buchungZurueckstellen"
}
const reducerFunctions = {};

interface IAction {
   type:Type;
}
interface IupdateSigninStatus extends IAction{
    isSignedIn:boolean;
    email:string;
}
function updateSigninStatus(newState:any,action:IupdateSigninStatus){
    newState.UI.loggedIn=action.isSignedIn;
    newState.UI.email=action.email; 
    if (!action.isSignedIn){
      newState.BM.instanceName="";
      if (newState.BM.rootFolder.id) if (newState.BM[newState.BM.rootFolder.id]) delete newState.BM[newState.BM.rootFolder.id]
      newState.BM.rootFolder={};
      if (newState.BM.OfficeOneFolders)delete newState.BM.OfficeOneFolders;
      if (newState.BM.serverResponse)delete newState.BM.serverResponse;     
    } 
	return newState;
}
reducerFunctions[Type.UpdateSigninStatus]=updateSigninStatus;

export{Type,reducerFunctions,IAction,IupdateSigninStatus,updateSigninStatus}

