import { BusinessModel } from "./businessModel";
import { ooFiles } from "./enums0001";

export function installSystem(fileId:string){
    const bm = new BusinessModel(fileId,ooFiles.SystemConfiguration);
}