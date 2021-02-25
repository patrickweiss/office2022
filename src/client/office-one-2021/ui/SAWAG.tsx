import * as React from "react";
// tslint:disable:ordered-imports
import * as OfficeLeaf from '../framework/OfficeLeaf';
// tslint:disable:object-literal-sort-keys

import Datenschutz from './Datenschutz';

class SAWAG extends OfficeLeaf.OfficeLeaf {
  constructor(props: OfficeLeaf.ILeaf) {
    const newProps: OfficeLeaf.ILeaf = {
      size: props.size,
      title:  props.title || "Schwarz auf Weiss AG",
      path: [OfficeLeaf.Leafs.C2021OfficeOnePocket, OfficeLeaf.Leafs.SAWAG],
      sentence: props.sentence || "Schwarz auf Weiss AG",
      charactericon: props.charactericon || "SaW AG"
    }
    super(newProps);
    this.leafName = OfficeLeaf.Leafs.SAWAG;
    
  }
  protected renderMobile() {
    return (
      <div>
        <h1>Schwarz auf Weiss AG</h1>
        <p className="MITTIG">2012 von 16 Aktionären in Stuttgart gegründet</p>
        <p/>
        <h2>Produkte</h2>
        <p className="MITTIG">OfficeOne.Pocket, OfficeOne.Office, OfficeOne.Server, <a href="http://officeone.team">OfficeOne.Team</a></p>
        <p/>
        <h2>Dienstleistungen</h2>
        <p className="MITTIG">Unternehmensberatung, IT-Beratung, Prozessdesign und Software-Entwicklung</p>
        <p/>
        <h2>Gesellschaft</h2>
        <p className="MITTIG">67 Aktionäre, 60.711 Stückaktien, 6,00 € Ausgabekurs</p>
        <p/>
        <h2>Impressum</h2>
        <ul>
          <li>Vorstand: Patrick Sbrzesny</li>
          <li>Vorsitzende des Aufsichtsrats: Karin Sbrzesny</li>
          <li>Adresse: Filderbahnstrasse 54, 70567 Stuttgart</li>
          <li>E-Mail: info@schwarz-auf-weiss.net</li>
          <li>Registergericht: Amtsgericht Stuttgart</li>
          <li>Registernummer: HRB 740790</li>
          <li>Inhaltlich Verantwortlicher gem. § 55 II RStV: Patrick Sbrzesny</li>
          <li><Datenschutz size="BUTTON" /></li>
        </ul>

      </div>
    );

  }
}

// tslint:disable-next-line:no-string-literal
OfficeLeaf.leafClasses[OfficeLeaf.Leafs.SAWAG] = SAWAG;

export default SAWAG;