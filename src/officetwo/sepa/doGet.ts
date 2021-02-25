import { doGetApplicant } from "../application/doGetApplicant";
import { doGetLastschriftmandat } from "./doGetLastschriftmandat";

export function doGet(e:GoogleAppsScript.Events.DoGet){
    if (e.parameters["email"])return doGetLastschriftmandat(e);
    if (e.parameters["applicant"])return doGetApplicant(e);
}