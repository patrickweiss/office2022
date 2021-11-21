import { AusgabenRechnung, Bewirtungsbeleg, EinnahmenRechnung, Konto, EURechnung } from "../../officeone/BusinessDataFacade";
import { BusinessModel } from "../../officeone/BusinessModel";
import { konto, office, ServerFunction } from "../oo21lib/systemEnums";

export function EroeffnungsbilanzAusVorjahrAktualisieren(rootFolderId: string, rootFolderNameVorjahr: string) {
  const BMnow = new BusinessModel(rootFolderId, "EroeffnungsbilanzAusVorjahrAktualisieren");
  try {
    var rootFolderIdLastYear = BMnow.getKonfigurationValue(office.vorjahrOfficeRootID_FolderId);

    var BMlastYear = new BusinessModel(rootFolderIdLastYear, "EroeffnungsbilanzAusVorjahrAktualisieren");
    
    KontenStammdatenAusVorjahrAktualisieren(BMlastYear, BMnow);
    OffenePostenUndKorrekturAusVorjahrAktualisieren(BMlastYear, BMnow);
    AnfangsbestaendeVonBilanzkontenAktualisieren(BMlastYear, BMnow);
    AnfangsbestandBankkontenAktualisieren(BMlastYear,BMnow);

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
      if (anfangsbestandsbuchung.getGegenkonto()===konto.Umsatzsteuerforderungen)anfangsbestandsbuchung.setGegenkonto(konto.Umsatzsteuer_Vorjahr)
      anfangsbestandsbuchung.setBezahltAm(BMlastYear.endOfYear());
      anfangsbestandsbuchung.setText("Anfangsbestand");
    }
  })

}


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
 // aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
 // aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
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
  //aktuelleRechnung.setDateiTyp(vorjahrRechnung.getDateiTyp());
  //aktuelleRechnung.setDokumententyp(vorjahrRechnung.getDokumententyp());
  aktuelleRechnung.setZahlungsziel(vorjahrRechnung.getZahlungsziel());

}

function AnfangsbestandBankkontenAktualisieren(BMlastYear: BusinessModel, BMnow: BusinessModel) {
  const bankkonten = BMlastYear.getKontenArray().filter(konto => konto.isBankkonto() && !konto.isDatenschluerferKonto());
  bankkonten.forEach(bankkonto => {
    const bestand = BMlastYear.getBankbestand(bankkonto.getKonto());
    const ebBuchung = BMnow.getOrCreateBankbuchung("EB" + bankkonto.getKonto() + BMnow.endOfYear().getFullYear().toString());
    ebBuchung.setKonto(bankkonto.getKonto());
    ebBuchung.setNr("EB");
    ebBuchung.setDatum(BMlastYear.endOfYear());
    ebBuchung.setBetrag(bestand);
    ebBuchung.setText("Anfangsbestand aus den Vorjahren");
    ebBuchung.setBelegID("EB" + bankkonto.getKonto() + BMnow.endOfYear().getFullYear().toString());
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

