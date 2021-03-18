import { AusgabenRechnung, Bewirtungsbeleg, EinnahmenRechnung, Konto, EURechnung } from "../../officeone/BusinessDataFacade";
import { BusinessModel } from "../../officeone/BusinessModel";
import { office, ServerFunction } from "../oo21lib/systemEnums";

export function EroeffnungsbilanzAusVorjahrAktualisieren(rootFolderId: string, rootFolderNameVorjahr: string) {
  const BMnow = new BusinessModel(rootFolderId, "EroeffnungsbilanzAusVorjahrAktualisieren");
  try {
    var rootFolderIdLastYear = BMnow.getConfigurationCache().getValueByName(office.vorjahrOfficeRootID_FolderId);

    var BMlastYear = new BusinessModel(rootFolderIdLastYear, "EroeffnungsbilanzAusVorjahrAktualisieren");
    KontenStammdatenAusVorjahrAktualisieren(BMlastYear, BMnow);
    //  AnlagenUndAbschreibungenAusVorjahrAktualisieren(BMlastYear, BMnow);
    //  OffenePostenAusVorjahrAktualisieren(BMlastYear, BMnow);
    //    AnfangsbestaendeVonKontenGruppeBestandAktualisieren(BMlastYear, BMnow);
    //Der Anfangsbestand kommt über den ersten Transaktionsimport im Januar des nächsten Jahres in die Tabelle
    //AnfangsbestandBankkontenAktualisieren(BMlastYear, BMnow);


    OffenePostenUndKorrekturAusVorjahrAktualisieren(BMlastYear, BMnow);
    AnfangsbestaendeVonBilanzkontenAktualisieren(BMlastYear, BMnow);

    BMnow.save();

    var result = {
      serverFunction: ServerFunction.EroeffnungsbilanzAusVorjahrAktualisieren,
      testName: createObjectArray(BMlastYear.getBilanzkontenArray()),
    }
    BMnow.saveLog("EroeffnungsbilanzAusVorjahrAktualisieren");
    return JSON.stringify(result);
  }
  catch (e) {
    return BMnow.saveError(e)

  }
}

function KontenStammdatenAusVorjahrAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  BMlastYear.getKontenArray().forEach(element => {
    if ((element.getKontentyp() === "Bilanz" || element.getKontentyp() === "GuV") && !element.isDatenschluerferKonto()) {
      let aktuellesKonto = BMnow.getOrCreateKonto(element.getId());
      aktuellesKonto.setKontentyp(element.getKontentyp());
      aktuellesKonto.setSubtyp(element.getSubtyp());
      aktuellesKonto.setGruppe(element.getGruppe());
      aktuellesKonto.setSKR03(element.getSKR03());
      aktuellesKonto.setFormula("SKR04", element.getFormula("SKR04"));
      aktuellesKonto.setFormula("Exportgruppe", element.getFormula("Exportgruppe"));
      aktuellesKonto.setFormular(element.getFormular());
      aktuellesKonto.setZN(element.getZN());
    }
  });
}


function OffenePostenUndKorrekturAusVorjahrAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {

  BMlastYear.getOffeneAusgabenRechnungArray().forEach(
    offeneAusgabeLastYear => {
      AusgabeKopierenOhneBezahltAmZuUeberschreiben(offeneAusgabeLastYear, BMnow, offeneAusgabeLastYear.getGegenkonto(), "nicht bezahlte Ausgabe aus dem Vorjahr (offener Posten)");
    }
  );
  BMlastYear.getOffeneBewirtungsbelegeArray().forEach(
    offeneAusgabeLastYear => {
      BewirtungsbelegKopierenOhneBezahltAmZuUeberschreiben(offeneAusgabeLastYear, BMnow, offeneAusgabeLastYear.getGegenkonto(), "nicht bezahlte Ausgabe aus dem Vorjahr (offener Posten)");
    }
  );

  BMlastYear.getOffeneEinnahmenRechnungArray().forEach(
    offeneRechnungLastYear => {
      RechnungKopierenOhneBezahltAmzuUeberschreiben(offeneRechnungLastYear, BMnow);
    }
  );
  BMlastYear.getOffeneEURechnungArray().forEach(
    offeneRechnungLastYear => {
      EURechnungKopierenOhneBezahltAmzuUeberschreiben(offeneRechnungLastYear, BMnow);
    }
  )


  BMlastYear.getOffeneGutschriftenArray().forEach(
    offeneGutschrift => {
      let aktuelleGutschrift = BMnow.getOrCreateGutschrift(offeneGutschrift.getId());
      aktuelleGutschrift.setFileId(offeneGutschrift.getFileId());
      aktuelleGutschrift.setLink(offeneGutschrift.getLink());
      aktuelleGutschrift.setStatus("offener Posten");
      aktuelleGutschrift.setDatum(offeneGutschrift.getDatum());
      aktuelleGutschrift.setNettoBetrag(offeneGutschrift.getNettoBetrag());
      aktuelleGutschrift.setMehrwertsteuer(offeneGutschrift.getMehrwertsteuer());
      aktuelleGutschrift.setBetrag(offeneGutschrift.getBetrag());
      aktuelleGutschrift.setGegenkonto(offeneGutschrift.getGegenkonto());
      aktuelleGutschrift.setDokumententyp(offeneGutschrift.getDokumententyp());
      aktuelleGutschrift.setDateiTyp(offeneGutschrift.getDateiTyp());

      //Korrekturbuchung
      aktuelleGutschrift = BMnow.getOrCreateGutschrift(offeneGutschrift.getId() + "KO");
      aktuelleGutschrift.setFileId(offeneGutschrift.getFileId());
      aktuelleGutschrift.setLink(offeneGutschrift.getLink());
      aktuelleGutschrift.setStatus("offener Posten");
      aktuelleGutschrift.setDatum(offeneGutschrift.getDatum());
      //Korrekturbuchung ist immer bezahlt
      aktuelleGutschrift.setBezahltAm(offeneGutschrift.getDatum());
      aktuelleGutschrift.setNettoBetrag(-offeneGutschrift.getNettoBetrag());
      aktuelleGutschrift.setMehrwertsteuer(-offeneGutschrift.getMehrwertsteuer());
      aktuelleGutschrift.setBetrag(-offeneGutschrift.getBetrag());
      aktuelleGutschrift.setGegenkonto(offeneGutschrift.getGegenkonto());
      aktuelleGutschrift.setDokumententyp(offeneGutschrift.getDokumententyp());
      aktuelleGutschrift.setDateiTyp(offeneGutschrift.getDateiTyp());


    }
  )
  BMlastYear.getOffeneUmbuchungenArray().forEach(offeneUmbuchung => {
    var aktuelleUmbuchung = BMnow.getOrCreateUmbuchung(offeneUmbuchung.getId());
    aktuelleUmbuchung.setFileId(offeneUmbuchung.getFileId());
    aktuelleUmbuchung.setLink(offeneUmbuchung.getLink());
    aktuelleUmbuchung.setDatum(offeneUmbuchung.getDatum());
    aktuelleUmbuchung.setKonto(offeneUmbuchung.getKonto());
    aktuelleUmbuchung.setBetrag(offeneUmbuchung.getBetrag());
    aktuelleUmbuchung.setGegenkonto(offeneUmbuchung.getGegenkonto());
    //bezahlt am wird nicht überschrieben
    aktuelleUmbuchung.setText("offener Posten aus Vorjahr");

    //Korrekturbuchung
    aktuelleUmbuchung = BMnow.getOrCreateUmbuchung(offeneUmbuchung.getId() + "KO");
    aktuelleUmbuchung.setFileId(offeneUmbuchung.getFileId());
    aktuelleUmbuchung.setLink(offeneUmbuchung.getLink());
    aktuelleUmbuchung.setDatum(offeneUmbuchung.getDatum());
    aktuelleUmbuchung.setKonto(offeneUmbuchung.getKonto());
    aktuelleUmbuchung.setBetrag(-offeneUmbuchung.getBetrag());
    aktuelleUmbuchung.setGegenkonto(offeneUmbuchung.getGegenkonto());
    //Korrektur ist immer bezahlt
    aktuelleUmbuchung.setBezahltAm(offeneUmbuchung.getDatum());
    aktuelleUmbuchung.setText("offener Posten aus Vorjahr");
  })
}

function AnfangsbestaendeVonBilanzkontenAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  BMlastYear.getBilanzkontenArray().forEach(bestandsKonto => {
    if (!bestandsKonto.isDatenschluerferKonto() && !bestandsKonto.isBankkonto() && bestandsKonto.getSumme() != 0) {
      var anfangsbestandsbuchung = BMnow.getOrCreateUmbuchung("UmEB" + bestandsKonto.getId().toString().replace(/ /g, "-"));
      anfangsbestandsbuchung.setDatum(BMlastYear.endOfYear());
      anfangsbestandsbuchung.setKonto("Geld Vorjahre");
      anfangsbestandsbuchung.setBetrag(bestandsKonto.getSumme());
      anfangsbestandsbuchung.setGegenkonto(bestandsKonto.getId());
      anfangsbestandsbuchung.setBezahltAm(BMlastYear.endOfYear());
      anfangsbestandsbuchung.setText("Anfangsbestand");
    }
  })

}


function AnlagenUndAbschreibungenAusVorjahrAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  let VorsteuerAusVorjahren = 0;
  BMlastYear.getAnlagenAusAusgabenRechnungArray().forEach(
    vorjahrAnlage => {
      //Wenn die Anlage noch nicht bezahlt ist, dann wird sie als "offener Posten" aktualisiert.
      if (vorjahrAnlage.isBezahlt()) {
        AusgabeKopierenOhneBezahltAmZuUeberschreiben(vorjahrAnlage, BMnow, "Anlagen Vorjahre", "Anlage aus einem Vorjahr, die noch nicht verkauft wurde");
        VorsteuerAusVorjahren += vorjahrAnlage.getMehrwertsteuer();
      }
      BMlastYear.getAbschreibungenZuAnlageArray(vorjahrAnlage.getKonto()).forEach(
        vorjahrAbschreibung => {
          let aktuelleAbschreibung = BMnow.getOrCreateAbschreibung(vorjahrAbschreibung.getId());
          aktuelleAbschreibung.setLink(vorjahrAbschreibung.getLink());
          aktuelleAbschreibung.setDatum(vorjahrAbschreibung.getDatum());
          aktuelleAbschreibung.setKonto(vorjahrAbschreibung.getKonto());
          aktuelleAbschreibung.setBetrag(vorjahrAbschreibung.getBetrag());
          aktuelleAbschreibung.setGegenkonto(vorjahrAbschreibung.getGegenkonto());
          aktuelleAbschreibung.setText(vorjahrAbschreibung.getText());
        }
      );
    }
  );
  let vorsteuerKorrektur = BMnow.getOrCreateUmbuchung("UmEBvorsteuerAusAnlagenVorjahre");
  vorsteuerKorrektur.setDatum(BMlastYear.endOfYear());
  vorsteuerKorrektur.setBezahltAm(BMlastYear.endOfYear());
  vorsteuerKorrektur.setKonto("Vorsteuer");
  vorsteuerKorrektur.setBetrag(-VorsteuerAusVorjahren);
  vorsteuerKorrektur.setGegenkonto("Vorsteuer aus Anlagen Vorjahre");
  vorsteuerKorrektur.setText("Vorsteuer aus Anlagen die vor dem " + BMlastYear.endOfYear() + " bezahlt wurden.");
}

function OffenePostenAusVorjahrAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  let VorsteuerAusVorjahren = 0;

  BMlastYear.getOffeneAusgabenRechnungArray().forEach(
    offeneAusgabeLastYear => {
      AusgabeKopierenOhneBezahltAmZuUeberschreiben(offeneAusgabeLastYear, BMnow, offeneAusgabeLastYear.getGegenkonto(), "nicht bezahlte Ausgabe aus dem Vorjahr (offener Posten)");
      VorsteuerAusVorjahren += offeneAusgabeLastYear.getMehrwertsteuer();
    }
  );
  BMlastYear.getOffeneBewirtungsbelegeArray().forEach(
    offeneAusgabeLastYear => {
      BewirtungsbelegKopierenOhneBezahltAmZuUeberschreiben(offeneAusgabeLastYear, BMnow, offeneAusgabeLastYear.getGegenkonto(), "nicht bezahlte Ausgabe aus dem Vorjahr (offener Posten)");
      VorsteuerAusVorjahren += offeneAusgabeLastYear.getMehrwertsteuer();
    }
  );
  let vorsteuerKorrektur = BMnow.getOrCreateUmbuchung("UmEBvorsteuerAusOffeneAusgabenVorjahre");
  vorsteuerKorrektur.setDatum(BMlastYear.endOfYear());
  vorsteuerKorrektur.setBezahltAm(BMlastYear.endOfYear());
  vorsteuerKorrektur.setKonto("Vorsteuer");
  vorsteuerKorrektur.setBetrag(-VorsteuerAusVorjahren);
  vorsteuerKorrektur.setGegenkonto("Vorsteuer Ausgabenrechnungen der Vorjahre");
  vorsteuerKorrektur.setText("Vorsteuer aus Ausgabenrechnung die vor dem " + BMlastYear.endOfYear() + " nicht bezahlt wurden.");

  BMlastYear.getOffeneEinnahmenRechnungArray().forEach(
    offeneRechnungLastYear => {
      RechnungKopierenOhneBezahltAmzuUeberschreiben(offeneRechnungLastYear, BMnow);
    }
  );
  BMlastYear.getOffeneGutschriftenArray().forEach(
    offeneGutschrift => {
      let aktuelleGutschrift = BMnow.getOrCreateGutschrift(offeneGutschrift.getId());
      aktuelleGutschrift.setFileId(offeneGutschrift.getFileId());
      aktuelleGutschrift.setLink(offeneGutschrift.getLink());
      aktuelleGutschrift.setStatus("offener Posten");
      aktuelleGutschrift.setDatum(offeneGutschrift.getDatum());
      aktuelleGutschrift.setNettoBetrag(offeneGutschrift.getNettoBetrag());
      aktuelleGutschrift.setMehrwertsteuer(offeneGutschrift.getMehrwertsteuer());
      aktuelleGutschrift.setBetrag(offeneGutschrift.getBetrag());
      aktuelleGutschrift.setGegenkonto(offeneGutschrift.getGegenkonto());
      aktuelleGutschrift.setDokumententyp(offeneGutschrift.getDokumententyp());
      aktuelleGutschrift.setDateiTyp(offeneGutschrift.getDateiTyp());
    }
  )

  //Wenn eines der beiden Konten ein Konto mit Subtyp "Bestand" ist, dann ist der Subtyp falsch!!! 
  BMlastYear.getOffeneUmbuchungenArray().forEach(offeneUmbuchung => {
    var aktuelleUmbuchung = BMnow.getOrCreateUmbuchung(offeneUmbuchung.getId());
    aktuelleUmbuchung.setFileId(offeneUmbuchung.getFileId());
    aktuelleUmbuchung.setLink(offeneUmbuchung.getLink());
    aktuelleUmbuchung.setDatum(offeneUmbuchung.getDatum());
    let konto = offeneUmbuchung.getKonto()
    if (BMlastYear.getKontenTableCache().getOrCreateRowById(konto).getSubtyp() === "Bestand") konto = "Fehler in " + offeneUmbuchung.getId();
    aktuelleUmbuchung.setKonto(konto);
    aktuelleUmbuchung.setBetrag(offeneUmbuchung.getBetrag());
    let gegenkonto = offeneUmbuchung.getGegenkonto();
    if (BMlastYear.getKontenTableCache().getOrCreateRowById(gegenkonto).getSubtyp() === "Bestand") gegenkonto = "Fehler in " + offeneUmbuchung.getId();
    aktuelleUmbuchung.setGegenkonto(offeneUmbuchung.getGegenkonto());
    //bezahlt am wird nicht überschrieben
    aktuelleUmbuchung.setText("offener Posten aus Vorjahr");

  })
  //Wenn die letzte UStVA aus dem Vorjahr übernommen wird, weil sie noch nicht bezahlt ist, dann muss der Betrag 
  // von der UStVA wieder abgezogen werden (Bestandskonto mit Anfangesbestand 0)
  // und von den Verbindlichkeiten Umsatzsteuer auch, weil der Betrag dort schon enthalten ist.
  /* nach Benny import scheint das falsch zu sein ...
  BMnow.getUStVAVorjahr().forEach(ustva => {
    let korrekturUStVA = BMnow.getOrCreateUmbuchung("EBustvaOffenePostenKorrekturUStVa" + (new Date(ustva.getDatum()).getMonth() + 1));
    korrekturUStVA.setDatum(BMlastYear.endOfYear());
    korrekturUStVA.setKonto("Geld Vorjahre");
    korrekturUStVA.setBetrag(ustva.getBetrag());
    korrekturUStVA.setGegenkonto("UStVA");
    korrekturUStVA.setBezahltAm(BMlastYear.endOfYear());
    korrekturUStVA.setText("Korrektur des Bestandsfehlers durch offenen UStVA Posten")

    let korrekturVerbindlichkeitenUmsatzsteuer = BMnow.getOrCreateUmbuchung("EBustvaOffenePostenKorrekturVerbindlichkeitenUmsatzsteuer" + (new Date(ustva.getDatum()).getMonth() + 1));
    korrekturVerbindlichkeitenUmsatzsteuer.setDatum(BMlastYear.endOfYear());
    korrekturVerbindlichkeitenUmsatzsteuer.setKonto("Geld Vorjahre");
    korrekturVerbindlichkeitenUmsatzsteuer.setBetrag(-ustva.getBetrag());
    korrekturVerbindlichkeitenUmsatzsteuer.setGegenkonto("Verbindlichkeiten Umsatzsteuer");
    korrekturVerbindlichkeitenUmsatzsteuer.setBezahltAm(BMlastYear.endOfYear());
    korrekturVerbindlichkeitenUmsatzsteuer.setText("Korrektur des Bestandsfehlers durch offenen UStVA Posten")
  })*/
}

/*
function AnfangsbestaendeVonKontenGruppeBestandAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  BMlastYear.getBestandskontenArray().forEach(bestandsKonto => {
    if (!bestandsKonto.isDatenschluerferKonto()) {
      var anfangsbestandsbuchung = BMnow.getOrCreateUmbuchung("UmEB" + bestandsKonto.getId().toString().replace(/ /g, "-"));
      anfangsbestandsbuchung.setDatum(BMlastYear.endOfYear());
      anfangsbestandsbuchung.setKonto("Geld Vorjahre");
      anfangsbestandsbuchung.setBetrag(bestandsKonto.getSumme());
      anfangsbestandsbuchung.setGegenkonto(bestandsKonto.getId());
      anfangsbestandsbuchung.setBezahltAm(BMlastYear.endOfYear());
      anfangsbestandsbuchung.setText("Anfangsbestand");
    }
  })

}
*/

function AusgabeKopierenOhneBezahltAmZuUeberschreiben(vorjahrAusgabe: AusgabenRechnung, BMnow: BusinessModel, gegenkonto: string, text: string) {
  let aktuelleAnlage = BMnow.getOrCreateAusgabenRechnung(vorjahrAusgabe.getId());
  aktuelleAnlage.setFileId(vorjahrAusgabe.getFileId());
  aktuelleAnlage.setLink(vorjahrAusgabe.getLink());
  aktuelleAnlage.setDatum(vorjahrAusgabe.getDatum());
  //Das bezahlt Datum wird nicht aktualisiert 
  aktuelleAnlage.setKonto(vorjahrAusgabe.getKonto());
  aktuelleAnlage.setBetrag(vorjahrAusgabe.getBetrag());
  aktuelleAnlage.setNettoBetrag(vorjahrAusgabe.getNettoBetrag());
  aktuelleAnlage.setMehrwertsteuer(vorjahrAusgabe.getMehrwertsteuer());
  aktuelleAnlage.setGegenkonto(gegenkonto);
  aktuelleAnlage.setText(text);
  aktuelleAnlage.setDateiTyp(vorjahrAusgabe.getDateiTyp());

  //Korrektur Offener Posten
  aktuelleAnlage = BMnow.getOrCreateAusgabenRechnung(vorjahrAusgabe.getId() + "KO");
  aktuelleAnlage.setFileId(vorjahrAusgabe.getFileId());
  aktuelleAnlage.setLink(vorjahrAusgabe.getLink());
  aktuelleAnlage.setDatum(vorjahrAusgabe.getDatum());
  //Korrekturbuchung ist immer bezahlt
  aktuelleAnlage.setBezahltAm(vorjahrAusgabe.getDatum());
  aktuelleAnlage.setKonto(vorjahrAusgabe.getKonto());
  aktuelleAnlage.setBetrag(-vorjahrAusgabe.getBetrag());
  aktuelleAnlage.setNettoBetrag(-vorjahrAusgabe.getNettoBetrag());
  aktuelleAnlage.setMehrwertsteuer(-vorjahrAusgabe.getMehrwertsteuer());
  aktuelleAnlage.setGegenkonto(gegenkonto);
  aktuelleAnlage.setText(text);
  aktuelleAnlage.setDateiTyp(vorjahrAusgabe.getDateiTyp());

}

function BewirtungsbelegKopierenOhneBezahltAmZuUeberschreiben(vorjahrAusgabe: Bewirtungsbeleg, BMnow: BusinessModel, gegenkonto: string, text: string) {
  let aktuellerBewirtungsbeleg = BMnow.getOrCreateBewirtungsbeleg(vorjahrAusgabe.getId());
  aktuellerBewirtungsbeleg.setFileId(vorjahrAusgabe.getFileId());
  aktuellerBewirtungsbeleg.setLink(vorjahrAusgabe.getLink());
  aktuellerBewirtungsbeleg.setDatum(vorjahrAusgabe.getDatum());
  //Das bezahlt Datum wird nicht aktualisiert
  aktuellerBewirtungsbeleg.setKonto(vorjahrAusgabe.getKonto());
  aktuellerBewirtungsbeleg.setBetrag(vorjahrAusgabe.getBetrag());
  aktuellerBewirtungsbeleg.setNettoBetrag(vorjahrAusgabe.getNettoBetrag());
  aktuellerBewirtungsbeleg.setMehrwertsteuer(vorjahrAusgabe.getMehrwertsteuer());
  aktuellerBewirtungsbeleg.setTrinkgeld(vorjahrAusgabe.getTrinkgeld());
  aktuellerBewirtungsbeleg.setAbziehbareBewirtungskosten(vorjahrAusgabe.getAbziehbareBewirtungskosten());
  aktuellerBewirtungsbeleg.setNichtAbziehbareBewirtungskosten(vorjahrAusgabe.getNichtAbziehbareBewirtungskosten());
  aktuellerBewirtungsbeleg.setGegenkonto(gegenkonto);
  aktuellerBewirtungsbeleg.setText(text);
  aktuellerBewirtungsbeleg.setDateiTyp(vorjahrAusgabe.getDateiTyp());

  //Korrekturbuchung
  aktuellerBewirtungsbeleg = BMnow.getOrCreateBewirtungsbeleg(vorjahrAusgabe.getId() + "KO");
  aktuellerBewirtungsbeleg.setFileId(vorjahrAusgabe.getFileId());
  aktuellerBewirtungsbeleg.setLink(vorjahrAusgabe.getLink());
  aktuellerBewirtungsbeleg.setDatum(vorjahrAusgabe.getDatum());
  //ist immer bezahlt
  aktuellerBewirtungsbeleg.setBezahltAm(vorjahrAusgabe.getDatum());
  aktuellerBewirtungsbeleg.setKonto(vorjahrAusgabe.getKonto());
  aktuellerBewirtungsbeleg.setBetrag(-vorjahrAusgabe.getBetrag());
  aktuellerBewirtungsbeleg.setNettoBetrag(-vorjahrAusgabe.getNettoBetrag());
  aktuellerBewirtungsbeleg.setMehrwertsteuer(-vorjahrAusgabe.getMehrwertsteuer());
  aktuellerBewirtungsbeleg.setTrinkgeld(-vorjahrAusgabe.getTrinkgeld());
  aktuellerBewirtungsbeleg.setAbziehbareBewirtungskosten(-vorjahrAusgabe.getAbziehbareBewirtungskosten());
  aktuellerBewirtungsbeleg.setNichtAbziehbareBewirtungskosten(-vorjahrAusgabe.getNichtAbziehbareBewirtungskosten());
  aktuellerBewirtungsbeleg.setGegenkonto(gegenkonto);
  aktuellerBewirtungsbeleg.setText(text);
  aktuellerBewirtungsbeleg.setDateiTyp(vorjahrAusgabe.getDateiTyp());

}

function RechnungKopierenOhneBezahltAmzuUeberschreiben(vorjahrRechnung: EinnahmenRechnung, BMnow: BusinessModel) {
  let aktuelleRechnung = BMnow.getOrCreateEinnahmenRechnung(vorjahrRechnung.getId());
  aktuelleRechnung.setFileId(vorjahrRechnung.getFileId());
  aktuelleRechnung.setLink(vorjahrRechnung.getLink());
  aktuelleRechnung.setStatus("offener Posten");
  aktuelleRechnung["setRechnungsNr"](vorjahrRechnung["getRechnungsNr"]());
  aktuelleRechnung.setName(vorjahrRechnung.getName());
  aktuelleRechnung.setGegenkonto(vorjahrRechnung.getGegenkonto());
  aktuelleRechnung.setDatum(vorjahrRechnung.getDatum());
  //bezahlt am wird nicht überschrieben
  aktuelleRechnung.setLeistungvon(vorjahrRechnung.getLeistungvon());
  aktuelleRechnung.setLeistungbis(vorjahrRechnung.getLeistungbis());
  aktuelleRechnung.setNettoBetrag(vorjahrRechnung.getNettoBetrag());
  aktuelleRechnung.setMehrwertsteuer(vorjahrRechnung.getMehrwertsteuer());
  aktuelleRechnung.setBetrag(vorjahrRechnung.getBetrag());
  aktuelleRechnung.setBestellnummer(vorjahrRechnung.getBestellnummer());
  aktuelleRechnung.setAdresszusatz(vorjahrRechnung.getAdresszusatz());
  aktuelleRechnung.setStrasse(vorjahrRechnung.getStrasse());
  aktuelleRechnung.setHausnummer(vorjahrRechnung.getHausnummer());
  aktuelleRechnung.setPLZ(vorjahrRechnung.getPLZ());
  aktuelleRechnung.setOrt(vorjahrRechnung.getOrt());
  aktuelleRechnung.setLand(vorjahrRechnung.getLand());
  aktuelleRechnung.setEMail(vorjahrRechnung.getEMail());
  aktuelleRechnung.setGruss(vorjahrRechnung.getGruss());
  aktuelleRechnung.setAnrede(vorjahrRechnung.getAnrede());
  aktuelleRechnung.setVorname(vorjahrRechnung.getVorname());
  aktuelleRechnung.setNachname(vorjahrRechnung.getNachname());
  aktuelleRechnung.setGeburtsdatum(vorjahrRechnung.getGeburtsdatum());
  aktuelleRechnung.setUStIdNr(vorjahrRechnung.getUStIdNr());
  aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
  aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
  aktuelleRechnung.setZahlungsziel(vorjahrRechnung.getZahlungsziel());

  //Korrekturtbuchung
  aktuelleRechnung = BMnow.getOrCreateEinnahmenRechnung(vorjahrRechnung.getId() + "KO");
  aktuelleRechnung.setFileId(vorjahrRechnung.getFileId());
  aktuelleRechnung.setLink(vorjahrRechnung.getLink());
  aktuelleRechnung.setStatus("offener Posten");
  aktuelleRechnung["setRechnungsNr"](vorjahrRechnung["getRechnungsNr"]());
  aktuelleRechnung.setName(vorjahrRechnung.getName());
  aktuelleRechnung.setGegenkonto(vorjahrRechnung.getGegenkonto());
  aktuelleRechnung.setDatum(vorjahrRechnung.getDatum());
  //Korrektur ist immer bezahlt am wird nicht überschrieben
  aktuelleRechnung.setBezahltAm(vorjahrRechnung.getDatum());
  aktuelleRechnung.setLeistungvon(vorjahrRechnung.getLeistungvon());
  aktuelleRechnung.setLeistungbis(vorjahrRechnung.getLeistungbis());
  aktuelleRechnung.setNettoBetrag(-vorjahrRechnung.getNettoBetrag());
  aktuelleRechnung.setMehrwertsteuer(-vorjahrRechnung.getMehrwertsteuer());
  aktuelleRechnung.setBetrag(-vorjahrRechnung.getBetrag());
  aktuelleRechnung.setBestellnummer(vorjahrRechnung.getBestellnummer());
  aktuelleRechnung.setAdresszusatz(vorjahrRechnung.getAdresszusatz());
  aktuelleRechnung.setStrasse(vorjahrRechnung.getStrasse());
  aktuelleRechnung.setHausnummer(vorjahrRechnung.getHausnummer());
  aktuelleRechnung.setPLZ(vorjahrRechnung.getPLZ());
  aktuelleRechnung.setOrt(vorjahrRechnung.getOrt());
  aktuelleRechnung.setLand(vorjahrRechnung.getLand());
  aktuelleRechnung.setEMail(vorjahrRechnung.getEMail());
  aktuelleRechnung.setGruss(vorjahrRechnung.getGruss());
  aktuelleRechnung.setAnrede(vorjahrRechnung.getAnrede());
  aktuelleRechnung.setVorname(vorjahrRechnung.getVorname());
  aktuelleRechnung.setNachname(vorjahrRechnung.getNachname());
  aktuelleRechnung.setGeburtsdatum(vorjahrRechnung.getGeburtsdatum());
  aktuelleRechnung.setUStIdNr(vorjahrRechnung.getUStIdNr());
  aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
  aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
  aktuelleRechnung.setZahlungsziel(vorjahrRechnung.getZahlungsziel());

}

function EURechnungKopierenOhneBezahltAmzuUeberschreiben(vorjahrRechnung: EURechnung, BMnow: BusinessModel) {
  let aktuelleRechnung = BMnow.getOrCreateEURechnung(vorjahrRechnung.getId());
  aktuelleRechnung.setFileId(vorjahrRechnung.getFileId());
  aktuelleRechnung.setLink(vorjahrRechnung.getLink());
  aktuelleRechnung.setStatus("offener Posten");
  aktuelleRechnung["setRechnungsNr"](vorjahrRechnung["getRechnungsNr"]());
  aktuelleRechnung.setName(vorjahrRechnung.getName());
  aktuelleRechnung.setGegenkonto(vorjahrRechnung.getGegenkonto());
  aktuelleRechnung.setDatum(vorjahrRechnung.getDatum());
  //bezahlt am wird nicht überschrieben
  aktuelleRechnung.setLeistungvon(vorjahrRechnung.getLeistungvon());
  aktuelleRechnung.setLeistungbis(vorjahrRechnung.getLeistungbis());
  aktuelleRechnung.setNettoBetrag(vorjahrRechnung.getNettoBetrag());
  aktuelleRechnung.setMehrwertsteuer(vorjahrRechnung.getMehrwertsteuer());
  aktuelleRechnung.setBetrag(vorjahrRechnung.getBetrag());
  aktuelleRechnung.setBestellnummer(vorjahrRechnung.getBestellnummer());
  aktuelleRechnung.setAdresszusatz(vorjahrRechnung.getAdresszusatz());
  aktuelleRechnung.setStrasse(vorjahrRechnung.getStrasse());
  aktuelleRechnung.setHausnummer(vorjahrRechnung.getHausnummer());
  aktuelleRechnung.setPLZ(vorjahrRechnung.getPLZ());
  aktuelleRechnung.setOrt(vorjahrRechnung.getOrt());
  aktuelleRechnung.setLand(vorjahrRechnung.getLand());
  aktuelleRechnung.setEMail(vorjahrRechnung.getEMail());
  aktuelleRechnung.setGruss(vorjahrRechnung.getGruss());
  aktuelleRechnung.setAnrede(vorjahrRechnung.getAnrede());
  aktuelleRechnung.setVorname(vorjahrRechnung.getVorname());
  aktuelleRechnung.setNachname(vorjahrRechnung.getNachname());
  aktuelleRechnung.setGeburtsdatum(vorjahrRechnung.getGeburtsdatum());
  aktuelleRechnung.setUStIdNr(vorjahrRechnung.getUStIdNr());
  aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
  aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
  aktuelleRechnung.setZahlungsziel(vorjahrRechnung.getZahlungsziel());

  //Korrekturtbuchung
  aktuelleRechnung = BMnow.getOrCreateEURechnung(vorjahrRechnung.getId() + "KO");
  aktuelleRechnung.setFileId(vorjahrRechnung.getFileId());
  aktuelleRechnung.setLink(vorjahrRechnung.getLink());
  aktuelleRechnung.setStatus("offener Posten");
  aktuelleRechnung["setRechnungsNr"](vorjahrRechnung["getRechnungsNr"]());
  aktuelleRechnung.setName(vorjahrRechnung.getName());
  aktuelleRechnung.setGegenkonto(vorjahrRechnung.getGegenkonto());
  aktuelleRechnung.setDatum(vorjahrRechnung.getDatum());
  //Korrektur ist immer bezahlt am wird nicht überschrieben
  aktuelleRechnung.setBezahltAm(vorjahrRechnung.getDatum());
  aktuelleRechnung.setLeistungvon(vorjahrRechnung.getLeistungvon());
  aktuelleRechnung.setLeistungbis(vorjahrRechnung.getLeistungbis());
  aktuelleRechnung.setNettoBetrag(-vorjahrRechnung.getNettoBetrag());
  aktuelleRechnung.setMehrwertsteuer(-vorjahrRechnung.getMehrwertsteuer());
  aktuelleRechnung.setBetrag(-vorjahrRechnung.getBetrag());
  aktuelleRechnung.setBestellnummer(vorjahrRechnung.getBestellnummer());
  aktuelleRechnung.setAdresszusatz(vorjahrRechnung.getAdresszusatz());
  aktuelleRechnung.setStrasse(vorjahrRechnung.getStrasse());
  aktuelleRechnung.setHausnummer(vorjahrRechnung.getHausnummer());
  aktuelleRechnung.setPLZ(vorjahrRechnung.getPLZ());
  aktuelleRechnung.setOrt(vorjahrRechnung.getOrt());
  aktuelleRechnung.setLand(vorjahrRechnung.getLand());
  aktuelleRechnung.setEMail(vorjahrRechnung.getEMail());
  aktuelleRechnung.setGruss(vorjahrRechnung.getGruss());
  aktuelleRechnung.setAnrede(vorjahrRechnung.getAnrede());
  aktuelleRechnung.setVorname(vorjahrRechnung.getVorname());
  aktuelleRechnung.setNachname(vorjahrRechnung.getNachname());
  aktuelleRechnung.setGeburtsdatum(vorjahrRechnung.getGeburtsdatum());
  aktuelleRechnung.setUStIdNr(vorjahrRechnung.getUStIdNr());
  aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
  aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
  aktuelleRechnung.setZahlungsziel(vorjahrRechnung.getZahlungsziel());

}

function AnfangsbestandBankkontenAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  const bankkonten = BMlastYear.getKontenArray().filter(konto => konto.isBankkonto() && !konto.isDatenschluerferKonto());
  bankkonten.forEach(bankkonto => {
    const bestand = BMlastYear.getBankbestand(bankkonto.getKonto());
    const ebBuchung = BMnow.getOrCreateBankbuchung("EB" + bankkonto.getKonto() + BMnow.endOfYear().getFullYear().toString());
    ebBuchung.setKonto(bankkonto.getKonto());
    ebBuchung.setNr("EB");
    ebBuchung.setDatum(new Date(BMnow.endOfYear().getFullYear(), 0, 1));
    ebBuchung.setBetrag(bestand);
    ebBuchung.setText("Anfangsbestand aus den Vorjahren");
    ebBuchung.setBelegID("keine");
    ebBuchung.setGegenkonto("Bankbestand Vorjahre");
  })
}

function createObjectArray(anlagenArray: Konto[]) {
  var result = [];
  for (let index in anlagenArray) {
    result.push(anlagenArray[index].getKonto());
  }
  return result;
}

