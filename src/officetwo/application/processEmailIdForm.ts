import { EMailIdTableCache } from "../../officeone/BusinessDataFacade";



//const httpEndpoint = "https://script.google.com/macros/s/AKfycbzofWRoZOPDdS8IUMVkAOv4W_TJICjpzpm--PCwZUPUdWHEKxc/exec"
//const httpEndpoint = "https://script.google.com/macros/s/AKfycbx5vYnARVxRYuHRQZDEAHWCbva9PBrTe8KTRnldtKwNPoGxGOQ/exec"
const httpEndpoint ="https://script.google.com/macros/s/AKfycbxoEPLSr0TQ05y9PwZemTXEdTdb3LfnBIQDbifM41ToZ1SNSP4/exec";

export const processEmailIdForm = (event:GoogleAppsScript.Events.SheetsOnFormSubmit,rootId:string) => {
    let mailTC = new EMailIdTableCache(rootId);
    let mail = mailTC.createNewRow();
    mail.setZeitstempel(event.namedValues["Zeitstempel"]);
    mail.setAnrede("Hi");
    mail.setVorname(event.namedValues["Name"]);
    mail.setEMail(event.namedValues["e-mail"])
    mail.setStatus(uuidv4());
    let mailBody = `${mail.getAnrede()} ${mail.getVorname()},
    thank you for submitting our application form. 

    Please confirm your application and your e-mail address by clicking on this confirmation link:
    ${httpEndpoint}?applicant=${mail.getEMail()}&r=${rootId}&uuid=${mail.getStatus()}`

    GmailApp.sendEmail(mail.getEMail(),"Schwarz auf Weiss AG Application and E-Mail Confirmation",mailBody);
    mailTC.save();
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }