import {
    AusgabenTableCache, AusgabenRechnung,
    BewirtungsbelegeTableCache, Bewirtungsbeleg,
    AbschreibungenTableCache, Abschreibung,
    VertraegeTableCache, Vertrag,
    EinnahmenRechnungTableCache, KundenTableCache, EinnahmenRechnung,
    EURechnungTableCache, EURechnung,
    GutschriftenTableCache, Gutschrift,
    BankbuchungenTableCache, Bankbuchung,
    UmbuchungenTableCache, Umbuchung,
    KontenTableCache, Konto,
    UStVATableCache, UStVA,
    EURTableCache, EUR,
    VerpflegungsmehraufwendungenTableCache, Verpflegungsmehraufwendung,
    NormalisierteBuchungenTableCache, NormalisierteBuchung,
    GdpduTableCache, Gdpdu
} from './BusinessDataFacade';
import { Type } from '../framework/Action';
import { IOfficeWindow } from '../framework/OfficeWindow';
import { IBelegZuBankbuchungZuordnen } from '../ui/Bankbuchungen';
import { ValuesCache } from './ValuesCache';
declare let window: IOfficeWindow;
function belegBuchenActionCreator(serverResponse: any) {
    // tslint:disable-next-line:only-arrow-functions
    return function (dispatch: any) {
        // First dispatch: the app state is updated to inform
        // that the API call is starting.

        window.logger.debug("1. belegBuchenActionCreator.dispatch --> Action vor dem Serveraufruf");

        dispatch({ type: Type.BelegGespeichert, serverResponse: serverResponse });
    };
}

export enum BelegTyp {
    Ausgabe = "Ausgabe",
    Bewirtungsbeleg = "Bewirtungsbeleg",
    Rechnung = "Rechnung",
    EURechnung = "EURechnung",
    Gutschrift = "Gutschrift",
    Umbuchung = "Umbuchung",
    Vertrag = "Vertrag"
  }
export class BusinessModel {
    //private rootFolderId: string;

    public einnahmenRechnungTableCache: EinnahmenRechnungTableCache;
    private kundenTableCache: KundenTableCache;
    public EURechnungTableCache: EURechnungTableCache;
    public gutschriftenTableCache: GutschriftenTableCache;
    public ausgabenTableCache: AusgabenTableCache;
    public bewirtungsbelegeTableCache: BewirtungsbelegeTableCache;
    public abschreibungenTableCache: AbschreibungenTableCache;
    public verpflegungsmehraufwendungenTableCache: VerpflegungsmehraufwendungenTableCache;
    public vertraegeTableCache: VertraegeTableCache;
    public bankbuchungenTableCache: BankbuchungenTableCache;
    public umbuchungenTableCache: UmbuchungenTableCache;
    public kontenTableCache: KontenTableCache;
    public ustvaTableCache: UStVATableCache;
    public eurTableCache: EURTableCache;
    public normalisierteBuchungenTableCache: NormalisierteBuchungenTableCache;
    private gdpduTableCache:GdpduTableCache;
    public configurationCache: ValuesCache;

    // Client specific code
    // public setRootFolderId(id: string) { this.rootFolderId = id; }
    public getRootFolderId() { return window.store.getState().BM.rootFolder.id; }
    public deleteCache(rangeName:string){
        switch (rangeName){
        case "UStVAD":
            delete this.ustvaTableCache;
            break;
        }
    }
    public getAusgabenKonten() {
        return [
            "Fahrkarte",
            "Bewirtungsbeleg",
            "Diesel",
            "Benzin"
        ];
    }
    public getMwSt() {
        return ["19%", "7%", "0%"];
    }
    public getGegenkontoAusgaben() {
        return ["bar", "auf Rechnung"];
    }
    public getInstanceName(): string {
        return window.store.getState().BM.instanceName;
    }
    public getVorjahrInstanceName(): string {
        return window.store.getState().BM.vorjahrInstanceName;

    }
    public getAusgabenFolder() {
        return window.store.getState().BM.ausgabenFolder;
    }
    
     // Generic code for client and server identical 
     public endOfYear() { 
        const jahr = this.getConfigurationCache().getValueByName("zeitraumJahr");
        if (jahr==="")throw new Error("Konfiguration:zeitraumJahr fehlt");
        return new Date(parseInt(jahr,10), 11, 31); }
    public beginOfYear() { return new Date(this.endOfYear().getFullYear(), 0, 1) }
    public handleAction(action: any) {
        if (action.type === Type.BelegZuBankbuchungZuordnen) {
            if (action.belegTyp === BelegTyp.Ausgabe) this.belegZuordnen(this.getOrCreateAusgabenRechnung(action.belegID), action);
            if (action.belegTyp === BelegTyp.Bewirtungsbeleg) this.belegZuordnen(this.getOrCreateBewirtungsbeleg(action.belegID), action);
            if (action.belegTyp === BelegTyp.Rechnung) this.belegZuordnen(this.getOrCreateEinnahmenRechnung(action.belegID), action);  
            if (action.belegTyp === BelegTyp.EURechnung) this.belegZuordnen(this.getOrCreateEURechnung(action.belegID), action);           
            if (action.belegTyp === BelegTyp.Gutschrift) this.belegZuordnen(this.getOrCreateGutschrift(action.belegID), action);
            if (action.belegTyp === BelegTyp.Umbuchung) this.belegZuordnen(this.getOrCreateUmbuchung(action.belegID), action);
            if (action.belegTyp === BelegTyp.Vertrag) this.belegZuordnen(this.getOrCreateVertrag(action.belegID), action);
        }
        if (action.type === Type.AusgabeBuchen) {
            const neueAusgabe = this.createAusgabenRechnung();
            neueAusgabe.setFileId(action.id);
            neueAusgabe.createLink(action.id, action.name);
            neueAusgabe.setDatum(new Date(action.datum));
            if (action.gegenkonto === "bar") neueAusgabe.setBezahltAm(new Date(action.datum));
            neueAusgabe.setKonto(action.konto);
            neueAusgabe.setBetrag(action.betrag);
            neueAusgabe.setNettoBetrag(this.netto(action.betrag, action.mwst));
            neueAusgabe.setMehrwertsteuer(this.mehrwertsteuer(action.betrag, action.mwst));
            neueAusgabe.setGegenkonto(action.gegenkonto);
            neueAusgabe.setText(action.name);
            this.createKontoFromAusgabe(action, neueAusgabe);
        }
        if (action.type === Type.GutschriftBuchen) {
            const neueGutschrift = this.createGutschrift();
            neueGutschrift.setFileId(action.id);
            neueGutschrift.createLink(action.id, action.dateiname);
            neueGutschrift.setDatum(new Date(action.datum));
            neueGutschrift.setName(action.name);
            neueGutschrift.setBetrag(action.betrag);
            neueGutschrift.setNettoBetrag(action.betrag - action.mwst);
            neueGutschrift.setMehrwertsteuer(action.mwst);
            neueGutschrift.setGegenkonto(action.gegenkonto);
        }
    }
    public getEinnahmenRechnungArray(): EinnahmenRechnung[] { return this.getEinnahmenRechnungTableCache().getRowArray() as EinnahmenRechnung[]; }
    public getEURechnungArray():EURechnung[] {return this.getEURechnungTableCache().getRowArray()as EURechnung[];}
    public getOrCreateEinnahmenRechnung(id: string) { return this.getEinnahmenRechnungTableCache().getOrCreateRowById(id); }
    public getOrCreateEURechnung(id: string) { return this.getEURechnungTableCache().getOrCreateRowById(id); }
    public getOffeneEinnahmenRechnungArray(): EinnahmenRechnung[] { return this.getEinnahmenRechnungArray().filter(rechnung => { return (rechnung.nichtBezahlt() && rechnung.getId() !== ""); }) }
    public getOffeneEURechnungArray(): EURechnung[] { return this.getEURechnungArray().filter(rechnung => { return (rechnung.nichtBezahlt() && rechnung.getId() !== ""); }) }
    public getRechnungenFuerMonat(monat: string): EinnahmenRechnung[] {
        //kopiert aus "Ausgabe" und angepasst!!!
        return this.getEinnahmenRechnungArray().filter(ausgabe => {
            const ausgabeDatum = ausgabe.getDatum();
            return (ausgabeDatum.getFullYear() === this.endOfYear().getFullYear() && ausgabeDatum.getMonth() === parseInt(monat) - 1);
        });
    }
    public getImGeschaeftsjahrBezahlteEinnahmenRechnungen(): EinnahmenRechnung[] { return this.getEinnahmenRechnungArray().filter(rechnung => { return rechnung.isBezahlt() }) }
    public getGutschriftenArray(): Gutschrift[] { return this.getGutschriftenTableCache().getRowArray() as Gutschrift[]; }
    public createGutschrift() { return this.getGutschriftenTableCache().createNewRow(); }
    public getOrCreateGutschrift(id: string) { return this.getGutschriftenTableCache().getOrCreateRowById(id); }
    public getOffeneGutschriftenArray(): Gutschrift[] { return this.getGutschriftenArray().filter(gutschrift => { return (gutschrift.nichtBezahlt() && gutschrift.getId() !== ""); }) }
    public getGutschriftenFuerMonat(monat: string): Gutschrift[] {
        //kopiert aus "Ausgabe" und angepasst!!!
        return this.getGutschriftenArray().filter(ausgabe => {
            const ausgabeDatum = ausgabe.getDatum();
            return (ausgabeDatum.getFullYear() === this.endOfYear().getFullYear() && ausgabeDatum.getMonth() === parseInt(monat) - 1);
        });
    }
    public getImGeschaeftsjahrBezahlteGutschriften(): Gutschrift[] { return this.getGutschriftenArray().filter(gutschrift => { return gutschrift.isBezahlt(); }) }
    public getAusgabenRechnungArray(): AusgabenRechnung[] { return this.getAusgabenTableCache().getRowArray() as AusgabenRechnung[]; }
    public createAusgabenRechnung() { return this.getAusgabenTableCache().createNewRow(); }
    public getOrCreateAusgabenRechnung(id: string):AusgabenRechnung { return this.getAusgabenTableCache().getOrCreateRowById(id); }
    public getOffeneAusgabenRechnungArray(): AusgabenRechnung[] { return this.getAusgabenRechnungArray().filter(ausgabe => { return (ausgabe.nichtBezahlt() && ausgabe.getId() !== ""); }) }
    public getAusgabenFuerMonat(monat: string): AusgabenRechnung[] {
        return this.getAusgabenRechnungArray().filter(ausgabe => {
            const ausgabeDatum = ausgabe.getDatum();
            return (ausgabeDatum.getFullYear() === this.endOfYear().getFullYear() && ausgabeDatum.getMonth() === parseInt(monat) - 1);
        });
    }
    public getAnlagenAusAusgabenRechnungArray(): AusgabenRechnung[] {
        var alleAnlagen = this.getAusgabenRechnungArray().filter(ausgabe => {
            var konto = this.getKontenTableCache().getOrCreateRowById(ausgabe.getKonto());
            if (konto === undefined) return false;
            return konto.isAnlage();
        })
        return alleAnlagen;
    }
    private belegZuordnen(beleg: Umbuchung, action: IBelegZuBankbuchungZuordnen) {
        if (action.bankbuchungID !== "") {
            let bankbuchung = this.getOrCreateBankbuchung(action.bankbuchungID);
            beleg.setBezahltAm(bankbuchung.getDatum());
            bankbuchung.setBelegID(beleg.getId());
            bankbuchung.setLink(beleg.getLink());
            bankbuchung.setGegenkonto(beleg.getGegenkonto());
            if ((action.belegTyp != BelegTyp.Vertrag || beleg.getBetrag()!==0) && Math.abs(bankbuchung.getBetrag() - beleg.getBetragMitVorzeichen()) > 0.001) {
                const splitBuchung = this.getBankbuchungenTableCache().createNewRow();
                //Wenn eine eine Zeile im Array erzeugt wird, wird die aktuelle bankbuchung nach unten verschoben
                //um weiterhin auf deren Daten zugreifen zu können, muss ein neuer Wrapper erzeugt werden
                bankbuchung = this.getOrCreateBankbuchung(action.bankbuchungID);
                splitBuchung.setKonto(beleg.getGegenkonto());
                splitBuchung.setNr(bankbuchung.getId());
                splitBuchung.setDatum(bankbuchung.getDatum());
                splitBuchung.setBetrag(bankbuchung.getBetrag() - beleg.getBetragMitVorzeichen());
                splitBuchung.setText(bankbuchung.getText());
                //todo ...
                //throw new Error("Betrag des Beleges stimmt nicht mit Bankbuchungsbetrag überein"); 
            }
        }
        else beleg.setBezahltAm(action.datum);
    }
    public getBewirtungsbelegeArray(): Bewirtungsbeleg[] { return this.getBewirtungsbelegeTableCache().getRowArray() as Bewirtungsbeleg[] }
    public createBewirtungsbeleg(): Bewirtungsbeleg { return this.getBewirtungsbelegeTableCache().createNewRow() };
    public getOrCreateBewirtungsbeleg(id: string) { return this.getBewirtungsbelegeTableCache().getOrCreateRowById(id); }
    public getOffeneBewirtungsbelegeArray(): Bewirtungsbeleg[] { return this.getBewirtungsbelegeArray().filter(bewirtung => { return (bewirtung.nichtBezahlt() && bewirtung.getId() !== ""); }) }
    public getAbschreibungenArray(): Abschreibung[] { return this.getAbschreibungenTableCache().getRowArray() as Abschreibung[]; }
    public getOrCreateAbschreibung(id: string) { return this.getAbschreibungenTableCache().getOrCreateRowById(id); }
    public getAbschreibungenZuAnlageArray(anlageKonto: string): Abschreibung[] {
        var abschreibungenZuAnlageKonto = this.getAbschreibungenArray().filter(abschreibung => {
            return abschreibung.getGegenkonto() === anlageKonto;
        })
        return abschreibungenZuAnlageKonto;
    }
    public getVerpflegungsmehraufwendungenArray(): Verpflegungsmehraufwendung[] { return this.getVerpflegungsmehraufwendungenTableCache().getRowArray() as Verpflegungsmehraufwendung[]; }
    public getVertraegeArray(): Vertrag[] { return this.getVertraegeTableCache().getRowArray() as Vertrag[] }
    public getOrCreateVertrag(id: string) { return this.getVertraegeTableCache().getOrCreateRowById(id); }
    public getOffeneVertraegeArray(): Vertrag[] { return this.getVertraegeArray() };
    public getBankbuchungenArray(): Bankbuchung[] { return this.getBankbuchungenTableCache().getRowArray() as Bankbuchung[]; }
    public getOrCreateBankbuchung(id: string): Bankbuchung { return this.getBankbuchungenTableCache().getOrCreateRowById(id) };
    public getBankbuchungenNichtZugeordnetArray(): Bankbuchung[] { return this.getBankbuchungenArray().filter(bankbuchung => { return bankbuchung.getId() !== "" && bankbuchung.getBelegID() === ""; }) }
    public createBankbuchung(): Bankbuchung { return this.getBankbuchungenTableCache().createNewRow() }
    public getBankbestand(konto: string): number {
        let bestand = 0;
        this.getBankbuchungenArray().filter(buchung => { return buchung.getKonto() === konto }).forEach(buchung => { bestand += buchung.getBetrag() })
        return bestand;
    }
    public getBankbuchungLatest(konto: string): Bankbuchung {
        let latestEntry: Bankbuchung = undefined;
        this.getBankbuchungenArray().filter(buchung => { return buchung.getKonto() === konto && buchung.getNr() !== "EB" }).forEach(buchung => {
            if (latestEntry === undefined) latestEntry = buchung;
            if (latestEntry.getId() < buchung.getId()) latestEntry = buchung;
        })
        return latestEntry;
    }
    public getUmbuchungenArray(): Umbuchung[] { return this.getUmbuchungenTableCache().getRowArray() as Umbuchung[]; }
    public createUmbuchung() { return this.getUmbuchungenTableCache().createNewRow() };
    public getOrCreateUmbuchung(id: string) { return this.getUmbuchungenTableCache().getOrCreateRowById(id); }
    public getOffeneUmbuchungenArray(): Umbuchung[] { return this.getUmbuchungenArray().filter(ausgabe => { return (ausgabe.nichtBezahlt() && ausgabe.getId() !== ""); }) }

    public getUStVAArray():UStVA[] { return this.getUStVATableCache().getRowArray() as UStVA[]; }
    public getUStVAFuerMonat(monat: string): UStVA[] {
        return this.getUStVAArray().filter(ausgabe => {
            const ausgabeDatum = ausgabe.getDatum();
            return (ausgabeDatum.getFullYear() === this.endOfYear().getFullYear() && ausgabeDatum.getMonth() === parseInt(monat) - 1);
        });
    }
    public getKontenArray(): Konto[] { return this.getKontenTableCache().getRowArray() as Konto[]; }
    public getOrCreateKonto(id: string): Konto { return this.getKontenTableCache().getOrCreateRowById(id); }
    public getBilanzkontenArray(): Konto[] { return this.getKontenArray().filter(konto => { return konto.isBilanzkonto(); }) }
    public getKontenAusgabe(): Konto[] { return this.getKontenArray().filter(konto => { return (konto.getGruppe().substr(0, 4) === "KoAu"); }) }
    public getBankkontenAusKontenArray(): Konto[] {
        throw new Error("Method not implemented.");
    }
    private createKontoFromAusgabe(action: any, ausgabe: AusgabenRechnung) {
        const konto = this.getOrCreateKonto(action.konto);
        if (konto.getGruppe() !== "") return;
        let kontoArt = "Au";
        if (action.kontoArt === "Anlagekonto") kontoArt = "An";
        let biggestNumber = 0;
        this.getKontenArray().forEach(
            (konto: Konto) => {
                if (konto.getGruppe().length < 8) return;
                if (konto.getGruppe().substr(0, 4) !== ("Ko" + kontoArt)) return;
                const number = parseInt(konto.getGruppe().substr(4, 4))
                if (number > biggestNumber) biggestNumber = number;
            });
        konto.setGruppe("Ko" + kontoArt + padToFour(biggestNumber + 1) + "," + action.mwst);
        konto.setBeispiel(ausgabe.getLink());
        if (kontoArt === "Au") { konto.setKontentyp("GuV"); konto.setSubtyp("Aufwand"); } else { konto.setKontentyp("Bilanz"); konto.setSubtyp("Anlage") }
    }
    public getNormalisierteBuchungenArray(): NormalisierteBuchung[] { return this.getNormalisierteBuchungenTableCache().getRowArray() as NormalisierteBuchung[]; }
    public getGdpduArray():Gdpdu[] {return this.getGdpduTableCache().getRowArray()}
    public kontoSummenAktualisieren() {
        //weitere Buchungen zum Eintragen siehe legacy Version 0050 function buchungenAktualisieren()
        console.log("BM.kontoSummenAktualisieren");
        this.getNormalisierteBuchungenTableCache().reset();
        this.addToNormalisierteBuchungen(this.getUmbuchungenArray());
        this.addToNormalisierteBuchungen(this.getEinnahmenRechnungArray());
        this.addToNormalisierteBuchungen(this.getEURechnungArray());
        this.addToNormalisierteBuchungen(this.getGutschriftenArray());   
        this.addToNormalisierteBuchungen(this.getAusgabenRechnungArray());
        this.addToNormalisierteBuchungen(this.getAbschreibungenArray());
        this.addToNormalisierteBuchungen(this.getBewirtungsbelegeArray());
        this.addToNormalisierteBuchungen(this.getVerpflegungsmehraufwendungenArray());
        this.addToNormalisierteBuchungen(this.getBankbuchungenArray());
        this.addToNormalisierteBuchungen(this.getGdpduArray());

        this.getNormalisierteBuchungenTableCache().kontenStammdatenAktualisieren(this.getKontenTableCache());
        this.getKontenTableCache().setKontenSpalten(this.endOfYear().getFullYear());
        this.getKontenTableCache().bilanzSummenAktualisieren(this.getNormalisierteBuchungenArray());
        this.getEURTableCache().setKontenSpalten(this.endOfYear().getFullYear());
        this.getEURTableCache().eurSummenAktualisieren(this.getNormalisierteBuchungenArray());
        this.getUStVATableCache().UStVASummenAktualisieren(this.getNormalisierteBuchungenArray(),this.beginOfYear(),this.getConfigurationCache().getValueByName("UStVAPeriode"));
        this.getKontenTableCache().kontenEinfaerben();

    }
    private addToNormalisierteBuchungen(umbuchungen:Umbuchung[]){
        console.log("BM.AddtoNormaliesierte Buchungen Anzahl:"+umbuchungen.length);
        for (let umbuchung of umbuchungen) {
            try{
            umbuchung.addToTableCache(this.getNormalisierteBuchungenTableCache(), this.beginOfYear(),"Umbuchung");
            }catch (e){
                console.log(e)
                console.log(umbuchung.getId());
                e.umbuchungId=umbuchung.getId();
                throw e;
            }
        }
    }
    public umsatzsteuerJahresabrechnung() {
        let fealligeUmsatzsteuer = 0;
        this.getImGeschaeftsjahrBezahlteEinnahmenRechnungen().forEach(rechnung => { fealligeUmsatzsteuer += rechnung.getMehrwertsteuer() });
        this.getImGeschaeftsjahrBezahlteGutschriften().forEach(rechnung => { fealligeUmsatzsteuer += rechnung.getMehrwertsteuer() });

        let faelligeMehrwertsteuerUmsatzsteuer = this.getOrCreateUmbuchung("mwstUmsatzsteuerFaelligAufMwSt");
        faelligeMehrwertsteuerUmsatzsteuer.setDatum(this.endOfYear());
        faelligeMehrwertsteuerUmsatzsteuer.setKonto("USt. in Rechnung gestellt");
        faelligeMehrwertsteuerUmsatzsteuer.setBetrag(fealligeUmsatzsteuer);
        faelligeMehrwertsteuerUmsatzsteuer.setGegenkonto("Jahresmehrwertsteuer");
        faelligeMehrwertsteuerUmsatzsteuer.setBezahltAm(this.endOfYear());
        faelligeMehrwertsteuerUmsatzsteuer.setText("Fällige UMSATZSTEUER - Vorsteuer = Fällige Jahresmehrwertsteuer");

        let vorsteuer = 0;
        //Summe der Vorsteuer aller im Geschäftsjahr ausgestellten Ausgaben Rechnungen
        this.getAusgabenRechnungArray().forEach(ausgabe => { if (ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear()) vorsteuer += ausgabe.getMehrwertsteuer(); })
        //Summe der Vorsteuer aller im Geschäftsjahr ausgestellten Bewirtungs Rechnungen
        this.getBewirtungsbelegeArray().forEach(ausgabe => { if (ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear()) vorsteuer += ausgabe.getMehrwertsteuer(); })
        let faelligeMehrwertsteuerVorsteuer = this.getOrCreateUmbuchung("mwstVorsteuerAufMwSt");
        faelligeMehrwertsteuerVorsteuer.setDatum(this.endOfYear());
        faelligeMehrwertsteuerVorsteuer.setKonto("Vorsteuer");
        faelligeMehrwertsteuerVorsteuer.setBetrag(-vorsteuer);
        faelligeMehrwertsteuerVorsteuer.setGegenkonto("Jahresmehrwertsteuer");
        faelligeMehrwertsteuerVorsteuer.setBezahltAm(this.endOfYear());
        faelligeMehrwertsteuerVorsteuer.setText("Fällige Umsatzsteuer - VORSTEUER = Fällige Jahresmehrwertsteuer");

        //jahresumsatzsteuer auf Verbindlichkeiten Umsatzsteuer buchen
        let mwstAufVerbindlichkeiten = this.getOrCreateUmbuchung("mwstJahrAufVerbindlichkeiten");
        mwstAufVerbindlichkeiten.setDatum(this.endOfYear());
        mwstAufVerbindlichkeiten.setKonto("Jahresmehrwertsteuer");
        mwstAufVerbindlichkeiten.setBetrag(fealligeUmsatzsteuer - vorsteuer);
        mwstAufVerbindlichkeiten.setGegenkonto("Verbindlichkeiten Umsatzsteuer");
        mwstAufVerbindlichkeiten.setBezahltAm(this.endOfYear());
        mwstAufVerbindlichkeiten.setText("Jahresmehrwertsteuer auf Verbindlichkeiten Umsatzsteuer buchen");

        //UStVA auf Verbindlichkeiten Umsatzsteuer buchen
        let ustva = 0;
        this.getAusgabenRechnungArray().forEach(ausgabe => {
            if (
                ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear() &&
                ausgabe.getKonto() === "UStVA") ustva += ausgabe.getBetrag();
        })
        let mwstUStVAaufVerbindlichkeiten = this.getOrCreateUmbuchung("mwstUStVAaufVerbindlichkeiten");
        mwstUStVAaufVerbindlichkeiten.setDatum(this.endOfYear());
        mwstUStVAaufVerbindlichkeiten.setKonto("UStVA");
        mwstUStVAaufVerbindlichkeiten.setBetrag(-ustva);
        mwstUStVAaufVerbindlichkeiten.setGegenkonto("Verbindlichkeiten Umsatzsteuer");
        mwstUStVAaufVerbindlichkeiten.setBezahltAm(this.endOfYear());
        mwstUStVAaufVerbindlichkeiten.setText("UStVs auf Verbindlichkeiten Umsatzsteuer buchen");

        //SimbaIstUmsatz
        /*
        let simbaIstUmsatz = fealligeUmsatzsteuer / 19 * 100;
        let simbaIstUmsatzBuchung = this.getOrCreateUmbuchung("simbaIstUmsatzBuchung");
        simbaIstUmsatzBuchung.setDatum(this.endOfYear());
        simbaIstUmsatzBuchung.setKonto("E9310");
        simbaIstUmsatzBuchung.setBetrag(simbaIstUmsatz);
        simbaIstUmsatzBuchung.setGegenkonto("E9313");
        simbaIstUmsatzBuchung.setBezahltAm(this.endOfYear());
        simbaIstUmsatzBuchung.setText("Bezahlter Umsatz im Geschaeftsjahr damit Simba Umsatzsteuerautomatik funktioniert");
  */ 
    }
    public getUStVAVorjahr(): AusgabenRechnung[] {
        return this.getAusgabenRechnungArray().filter(ausgabe => {
            return (ausgabe.getKonto() === "UStVA" && ausgabe.getDatum().getFullYear() === (this.endOfYear().getFullYear() - 1))
        })
    }
    public save() {
        if (this.ausgabenTableCache !== undefined) this.ausgabenTableCache.save();
        if (this.bewirtungsbelegeTableCache !== undefined) this.bewirtungsbelegeTableCache.save();
        if (this.kontenTableCache !== undefined) this.kontenTableCache.save();
        if (this.ustvaTableCache!==undefined)this.ustvaTableCache.save();
        if (this.eurTableCache !== undefined) this.eurTableCache.save();
        if (this.abschreibungenTableCache !== undefined) this.abschreibungenTableCache.save();
        if (this.verpflegungsmehraufwendungenTableCache!== undefined) this.verpflegungsmehraufwendungenTableCache.save();
        if (this.bankbuchungenTableCache !== undefined) this.bankbuchungenTableCache.save();
        if (this.umbuchungenTableCache !== undefined) this.umbuchungenTableCache.save();
        if (this.einnahmenRechnungTableCache !== undefined) this.einnahmenRechnungTableCache.save();
        if (this.kundenTableCache !== undefined)this.kundenTableCache.save();
        if (this.EURechnungTableCache !== undefined) this.EURechnungTableCache.save();
        if (this.gutschriftenTableCache !== undefined) this.gutschriftenTableCache.save();
        if (this.vertraegeTableCache !== undefined) this.vertraegeTableCache.save();
        if (this.normalisierteBuchungenTableCache !== undefined) this.normalisierteBuchungenTableCache.save();
    }
    public getEinnahmenRechnungTableCache(): EinnahmenRechnungTableCache {
        if (this.einnahmenRechnungTableCache === undefined) this.einnahmenRechnungTableCache = new EinnahmenRechnungTableCache(this.getRootFolderId());
        return this.einnahmenRechnungTableCache;
    }
    public getKundenTableCache(): KundenTableCache {
        if (this.kundenTableCache === undefined) this.kundenTableCache = new KundenTableCache(this.getRootFolderId());
        return this.kundenTableCache;
    }
    public getEURechnungTableCache():EURechnungTableCache {
        if (this.EURechnungTableCache === undefined) this.EURechnungTableCache = new EURechnungTableCache(this.getRootFolderId());
        return this.EURechnungTableCache;      
    }
    public getGutschriftenTableCache(): GutschriftenTableCache {
        if (this.gutschriftenTableCache === undefined) this.gutschriftenTableCache = new GutschriftenTableCache(this.getRootFolderId());
        return this.gutschriftenTableCache;
    }
    public getAusgabenTableCache(): AusgabenTableCache {
        if (this.ausgabenTableCache === undefined) this.ausgabenTableCache = new AusgabenTableCache(this.getRootFolderId());
        return this.ausgabenTableCache;
    }
    public getBewirtungsbelegeTableCache(): BewirtungsbelegeTableCache {
        if (this.bewirtungsbelegeTableCache === undefined) this.bewirtungsbelegeTableCache = new BewirtungsbelegeTableCache(this.getRootFolderId());
        return this.bewirtungsbelegeTableCache;
    }
    private getAbschreibungenTableCache(): AbschreibungenTableCache {
        if (this.abschreibungenTableCache === undefined) this.abschreibungenTableCache = new AbschreibungenTableCache(this.getRootFolderId());
        return this.abschreibungenTableCache;
    }
    private getVerpflegungsmehraufwendungenTableCache(): VerpflegungsmehraufwendungenTableCache {
        if (this.verpflegungsmehraufwendungenTableCache === undefined) this.verpflegungsmehraufwendungenTableCache = new VerpflegungsmehraufwendungenTableCache(this.getRootFolderId());
        return this.verpflegungsmehraufwendungenTableCache;
    }
    public getVertraegeTableCache(): VertraegeTableCache {
        if (this.vertraegeTableCache === undefined) this.vertraegeTableCache = new VertraegeTableCache(this.getRootFolderId());
        return this.vertraegeTableCache;
    }
    public getBankbuchungenTableCache(): BankbuchungenTableCache {
        if (this.bankbuchungenTableCache === undefined) this.bankbuchungenTableCache = new BankbuchungenTableCache(this.getRootFolderId());
        return this.bankbuchungenTableCache;
    }
    private getUmbuchungenTableCache(): UmbuchungenTableCache {
        if (this.umbuchungenTableCache === undefined) this.umbuchungenTableCache = new UmbuchungenTableCache(this.getRootFolderId());
        return this.umbuchungenTableCache;
    }
    public getKontenTableCache(): KontenTableCache {
        if (this.kontenTableCache === undefined) this.kontenTableCache = new KontenTableCache(this.getRootFolderId());
        return this.kontenTableCache;
    }
    public getUStVATableCache(): UStVATableCache {
        if (this.ustvaTableCache === undefined) this.ustvaTableCache = new UStVATableCache(this.getRootFolderId());
        return this.ustvaTableCache;
    }
    private getEURTableCache(): EURTableCache {
        if (this.eurTableCache === undefined) this.eurTableCache = new EURTableCache(this.getRootFolderId());
        return this.eurTableCache;
    }
    
    public getNormalisierteBuchungenTableCache(): NormalisierteBuchungenTableCache {
        if (this.normalisierteBuchungenTableCache === undefined) this.normalisierteBuchungenTableCache = new NormalisierteBuchungenTableCache(this.getRootFolderId());
        return this.normalisierteBuchungenTableCache;
    }
    public getGdpduTableCache():GdpduTableCache {
        if (this.gdpduTableCache === undefined) this.gdpduTableCache = new GdpduTableCache(this.getRootFolderId());
        return this.gdpduTableCache;
    }
    public getConfigurationCache():ValuesCache{
        if (this.configurationCache ===undefined) this.configurationCache=new ValuesCache("Konfiguration",this.getRootFolderId());
        return this.configurationCache;
    }
    public netto(brutto: number, prozent: string) {
        if (prozent == "19%") return Math.round(brutto / 1.19 * 100) / 100;
        if (prozent == "7%") return Math.round(brutto / 1.07 * 100) / 100;
        if (prozent == "0%") return brutto;
        return brutto;
    }
    public mehrwertsteuer(brutto: number, prozent: string) {
        return brutto - this.netto(brutto, prozent);
    }
    public germanDate(datum: Date) { return datum.getDate() + "." + (datum.getMonth() + 1) + "." + datum.getFullYear() }
    public getBankontenArray(){
       return (this.getConfigurationCache().getValueByName("bankKonten") as string).split(",");
    }
    public isBankkonto(kontoName:string){return this.getBankontenArray().indexOf(kontoName)>=0;}
}



function padToFour(number: number) { return ("000" + number).slice(-4); }
function moneyString(number: number) { return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number); }



