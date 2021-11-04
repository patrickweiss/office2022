import { DriveConnector } from "../server/officeone/driveconnector";
import { belegNr, codeVersion, currentOOversion, developmentYear, konto, logLevel, office, ooTables, ServerFunction } from "../server/oo21lib/systemEnums";
import { Abschreibung, AbschreibungenTableCache, AusgabenRechnung, AusgabenTableCache, Bankbuchung, BankbuchungenTableCache, Bewirtungsbeleg, BewirtungsbelegeTableCache, EinnahmenRechnung, EinnahmenRechnungTableCache, EURechnung, EURechnungTableCache, EURTableCache, Gutschrift, GutschriftenTableCache, KontenTableCache, Konto, NormalisierteBuchung, NormalisierteBuchungenTableCache, Umbuchung, UmbuchungenTableCache, UStVA, UStVATableCache, Verpflegungsmehraufwendung, VerpflegungsmehraufwendungenTableCache, VertraegeTableCache, Vertrag, GdpduTableCache, Gdpdu, KundenTableCache, Rechnung } from "./BusinessDataFacade";
import { ValuesCache } from './ValuesCache';

export enum BelegTyp {
    Ausgabe = "Ausgabe",
    Bewirtungsbeleg = "Bewirtungsbeleg",
    Rechnung = "Rechnung",
    EURechnung = "EURechnung",
    Gutschrift = "Gutschrift",
    Umbuchung = "Umbuchung",
    Vertrag = "Vertrag"
}
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
    BelegSpeichern = "BelegSpeichern",
    BelegZuBankbuchungZuordnen = "BelegZuBankbuchungZuordnen",
    AusgabeBuchen = "AusgabeBuchen",
    GutschriftBuchen = "GutschriftBuchen",
    buchungZurueckstellen = "buchungZurueckstellen"
}
interface IAction {
    type: Type;
}
export interface IBelegZuBankbuchungZuordnen extends IAction {
    belegTyp: BelegTyp;
    belegID: string;
    bankbuchungID: string;
    datum: Date;
}
export class BusinessModel {
    private userLock: GoogleAppsScript.Lock.Lock;
    private logMessage: string;
    private beginBM: Date;
    private rootFolderId: string;
    private einnahmenRechnungTableCache: EinnahmenRechnungTableCache;
    private kundenTableCache: KundenTableCache;
    private EURechnungTableCache: EURechnungTableCache;
    private gutschriftenTableCache: GutschriftenTableCache;
    private ausgabenTableCache: AusgabenTableCache;
    private bewirtungsbelegeTableCache: BewirtungsbelegeTableCache;
    private abschreibungenTableCache: AbschreibungenTableCache;
    private verpflegungsmehraufwendungenTableCache: VerpflegungsmehraufwendungenTableCache;
    private vertraegeTableCache: VertraegeTableCache;
    private bankbuchungenTableCache: BankbuchungenTableCache;
    private umbuchungenTableCache: UmbuchungenTableCache;
    private kontenTableCache: KontenTableCache;
    private ustvaTableCache: UStVATableCache;
    private eurTableCache: EURTableCache;
    private normalisierteBuchungenTableCache: NormalisierteBuchungenTableCache;
    private gdpduTableCache: GdpduTableCache;
    private configurationCache: ValuesCache;

    //Server specific code
    constructor(rootfolderId: string, functionName: string) {
        this.rootFolderId = rootfolderId;
        this.logMessage = `${developmentYear}.${currentOOversion}.${codeVersion}:${functionName}`;
        this.beginBM = new Date();
        try {
            this.userLock = LockService.getUserLock();
            this.userLock.waitLock(1000);
        } catch (e) {
            this.saveError(e);
            throw e;
        }
    }

    public addLogMessage(message: string) {
        this.logMessage += "\n" + message;
    }
    public saveError(error: Error) {
        this.addLogMessage(error.message)
        const errorMail = this.getConfigurationCache().getValueByName(office.fehlerEmail);
        if (errorMail != "") {
            try {
                GmailApp.sendEmail(errorMail, "Fehler bei " + this.logMessage.split("\n")[0], this.logMessage + "\n" + error.stack);
            } catch (e) { this.addLogMessage("ungültige fehlerEmail, keine gültige Email Adresse") }
        }
        this.saveLog(error.stack);

        const result = {
            serverFunction: ServerFunction.unbehandelterFehler,
            error: this.logMessage,
        }
        return JSON.stringify(result);
    }
    public saveLog(message: string) {
        this.addLogMessage(message);
        const logSpreadsheet = DriveConnector.getSpreadsheet(this.rootFolderId, ooTables.log, currentOOversion);
        let sheet = logSpreadsheet.getSheetByName("log")
        if (!sheet) {
            sheet = logSpreadsheet.insertSheet()
            sheet.setName("log")
        }
        let now = new Date();
        sheet.appendRow([this.beginBM, now, now.valueOf() - this.beginBM.valueOf(), this.logMessage]);
        SpreadsheetApp.flush();
        this.userLock.releaseLock();
    }

    public getRootFolderId() { return this.rootFolderId; }

    // Generic code for client and server identical 
    public endOfYear() {
        const jahr = this.getConfigurationCache().getValueByName("zeitraumJahr");
        if (jahr === "") throw new Error("Konfiguration:zeitraumJahr fehlt");
        return new Date(parseInt(jahr, 10), 11, 31);
    }
    public beginOfYear() { return new Date(this.endOfYear().getFullYear(), 0, 1) }
    public handleAction(action: IBelegZuBankbuchungZuordnen) {
        if (action.type === Type.buchungZurueckstellen) this.getBankbuchungenTableCache().putBackRowById(action.bankbuchungID);
        if (action.type === Type.BelegZuBankbuchungZuordnen) {
            if (action.belegTyp === BelegTyp.Ausgabe) this.belegZuordnen(this.getOrCreateAusgabenRechnung(action.belegID), action);
            if (action.belegTyp === BelegTyp.Bewirtungsbeleg) this.belegZuordnen(this.getOrCreateBewirtungsbeleg(action.belegID), action);
            if (action.belegTyp === BelegTyp.Rechnung) this.belegZuordnen(this.getOrCreateEinnahmenRechnung(action.belegID), action);
            if (action.belegTyp === BelegTyp.EURechnung) this.belegZuordnen(this.getOrCreateEURechnung(action.belegID), action);
            if (action.belegTyp === BelegTyp.Gutschrift) this.belegZuordnen(this.getOrCreateGutschrift(action.belegID), action);
            if (action.belegTyp === BelegTyp.Umbuchung) this.belegZuordnen(this.getOrCreateUmbuchung(action.belegID), action);
            if (action.belegTyp === BelegTyp.Vertrag) this.belegZuordnen(this.getOrCreateVertrag(action.belegID), action);
        }
        /*
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
        }*/
    }
    public getOffenerBelegBetrag(umbuchung: Umbuchung) {
        let offnerBelegBetrag = umbuchung.getBetragMitVorzeichen();
        this.getBankbuchungenArray().filter(bankbuchung => umbuchung.getId() === bankbuchung.getBelegID())
            .forEach(bankbuchung => { offnerBelegBetrag -= bankbuchung.getBetrag() })
        return offnerBelegBetrag;
    }
    public getEinnahmenRechnungArray(): EinnahmenRechnung[] { return this.getEinnahmenRechnungTableCache().getRowArray() as EinnahmenRechnung[]; }
    public getEURechnungArray(): EURechnung[] { return this.getEURechnungTableCache().getRowArray() as EURechnung[]; }
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
    public getImGeschaeftsjahrBezahlteEinnahmenRechnungen(): EinnahmenRechnung[] { return this.getEinnahmenRechnungArray().filter(rechnung => { return rechnung.isBezahlt() && (rechnung.getBezahltAm() as Date).getFullYear() === this.endOfYear().getFullYear() }) }
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
    public getImGeschaeftsjahrBezahlteGutschriften(): Gutschrift[] { return this.getGutschriftenArray().filter(gutschrift => { return gutschrift.isBezahlt() && (gutschrift.getBezahltAm() as Date).getFullYear() === this.endOfYear().getFullYear(); }) }
    public getAusgabenRechnungArray(): AusgabenRechnung[] { return this.getAusgabenTableCache().getRowArray() as AusgabenRechnung[]; }
    public createAusgabenRechnung() { return this.getAusgabenTableCache().createNewRow(); }
    public getOrCreateAusgabenRechnung(id: string): AusgabenRechnung { return this.getAusgabenTableCache().getOrCreateRowById(id); }
    public getOffeneAusgabenRechnungArray(): AusgabenRechnung[] { return this.getAusgabenRechnungArray().filter(ausgabe => { return (ausgabe.nichtBezahlt() && ausgabe.getId() !== ""); }) }
    public getAusgabenFuerMonat(monat: string): AusgabenRechnung[] {
        if (parseInt(monat, 10) > 12 || parseInt(monat, 10) < 1) throw new Error("getAusgabenFuerMonat:" + monat);
        return this.getAusgabenRechnungArray().filter(ausgabe => {
            const ausgabeDatum = ausgabe.getDatum();
            return (ausgabeDatum.getFullYear() === this.endOfYear().getFullYear() && ausgabeDatum.getMonth() === parseInt(monat, 10) - 1);
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
            let offnerBelegBetrag = beleg.getBetragMitVorzeichen();
            if (action.belegTyp !== BelegTyp.Vertrag) offnerBelegBetrag = this.getOffenerBelegBetrag(beleg);
            if (
                (Math.abs(bankbuchung.getBetrag()) + 0.0001) >= Math.abs(offnerBelegBetrag)
                || action.belegTyp === BelegTyp.Vertrag) beleg.setBezahltAm(bankbuchung.getDatum());
            bankbuchung.setBelegID(beleg.getId());
            bankbuchung.setLink(beleg.getLink());
            bankbuchung.setGegenkonto(beleg.getGegenkonto());
            if ((action.belegTyp != BelegTyp.Vertrag || beleg.getBetrag() !== 0) &&
                (Math.abs(bankbuchung.getBetrag()) > (Math.abs(offnerBelegBetrag) + 0.001))
            ) {
                this.addLogMessage(`Bankbetrag:${bankbuchung.getBetrag()} Belegbetrag:${offnerBelegBetrag} BelegId:${beleg.getId()}`)
                const splitBuchung = this.getBankbuchungenTableCache().createNewRow();
                this.addLogMessage("Bankbuchung ist größer als Belegsumme, Restbetrag:" + (bankbuchung.getBetrag() - offnerBelegBetrag));
                splitBuchung.setKonto(beleg.getGegenkonto());
                splitBuchung.setNr(bankbuchung.getId());
                splitBuchung.setDatum(bankbuchung.getDatum());
                splitBuchung.setBetrag(bankbuchung.getBetrag() - offnerBelegBetrag);
                splitBuchung.setText(bankbuchung.getText());
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

    public getUStVAArray(): UStVA[] { return this.getUStVATableCache().getRowArray() as UStVA[]; }
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
    public getGdpduArray(): Gdpdu[] { return this.getGdpduTableCache().getRowArray() }
    public kontoSummenAktualisieren() {
        //weitere Buchungen zum Eintragen siehe legacy Version 0050 function buchungenAktualisieren()
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
        this.getUStVATableCache().UStVASummenAktualisieren(this.getNormalisierteBuchungenArray(), this.beginOfYear(), this.getConfigurationCache().getValueByName("UStVAPeriode"));
        this.getKontenTableCache().kontenEinfaerben();

    }
    private addToNormalisierteBuchungen(umbuchungen: Umbuchung[]) {
        for (let umbuchung of umbuchungen) {
            try {
                umbuchung.addToTableCache(this.getNormalisierteBuchungenTableCache(), this.beginOfYear(), "Umbuchung");
            } catch (e) {
                e.umbuchungId = umbuchung.getId();
                throw e;
            }
        }
    }
    public umsatzsteuerJahresabrechnung() {
        let fealligeUmsatzsteuer19 = 0;
        let umsatzMit19 = 0;//9313
        let umsatzMit16 = 0;//9312
        let umsatzMit7 = 0;//9302
        let umsatzMit5 = 0;//9320
        let umsatzMit0 = 0;//9300

        const mwstSummieren = (rechnung: Rechnung) => {
            if (rechnung.getBetrag() === 0) return;
            const mwstSatz = rechnung.getBetrag() / rechnung.getNettoBetrag();
            if (almostEqual(mwstSatz, 1.19, 0.0001)) {
                umsatzMit19 += rechnung.getNettoBetrag();
                fealligeUmsatzsteuer19 += rechnung.getMehrwertsteuer()
                return
            }
            if (almostEqual(mwstSatz, 1.0, 0.0001)) {
                umsatzMit0 += rechnung.getNettoBetrag();
                return
            }
            throw new Error(rechnung.getId() + " hat keinen eindeutigen Mehrwertsteuersatz, MwSt:" + (mwstSatz - 1) * 100 + "%");
        }

        this.getImGeschaeftsjahrBezahlteEinnahmenRechnungen().forEach(mwstSummieren);
        this.getImGeschaeftsjahrBezahlteGutschriften().forEach(mwstSummieren);

        //Alle Buchungen für 19% Umsatzsteuer
        let istUmsatzBuchung19 = this.getOrCreateUmbuchung(belegNr.mwstIstUmsatz19);
        istUmsatzBuchung19.setDatum(this.endOfYear());
        istUmsatzBuchung19.setKonto(konto.Umsatz9310);
        istUmsatzBuchung19.setBetrag(umsatzMit19);
        istUmsatzBuchung19.setGegenkonto(konto.Umsatz9313);
        istUmsatzBuchung19.setBezahltAm(this.endOfYear());
        istUmsatzBuchung19.setText("bezahlter Umsatz im Geschaeftsjahr mit 19% Umsatzsteuer");

        let faelligeMehrwertsteuerUmsatzsteuer19 = this.getOrCreateUmbuchung(belegNr.mwstUStRechnungUSt19);
        faelligeMehrwertsteuerUmsatzsteuer19.setDatum(this.endOfYear());
        faelligeMehrwertsteuerUmsatzsteuer19.setKonto(konto.USt_in_Rechnunggestellt);
        faelligeMehrwertsteuerUmsatzsteuer19.setBetrag(fealligeUmsatzsteuer19);
        faelligeMehrwertsteuerUmsatzsteuer19.setGegenkonto(konto.Umsatzsteuer19);
        faelligeMehrwertsteuerUmsatzsteuer19.setBezahltAm(this.endOfYear());
        faelligeMehrwertsteuerUmsatzsteuer19.setText("USt. in Rechnung gestellt --> wenn bezahlt --> Umsatzsteuer19");

        let umsatzsteuer19VMwSt = this.getOrCreateUmbuchung(belegNr.mwstUmsatzsteuer19AufVMwSt);
        umsatzsteuer19VMwSt.setDatum(this.endOfYear());
        umsatzsteuer19VMwSt.setKonto(konto.Umsatzsteuer_laufendes_Jahr);
        umsatzsteuer19VMwSt.setBetrag(-fealligeUmsatzsteuer19);
        umsatzsteuer19VMwSt.setGegenkonto(konto.Umsatzsteuer19);
        umsatzsteuer19VMwSt.setBezahltAm(this.endOfYear());
        umsatzsteuer19VMwSt.setText("Umsatzsteuer19 auf 1789");

        //Alle Buchungen für 0% Umsatzsteuer
        let istUmsatzBuchung0 = this.getOrCreateUmbuchung(belegNr.mwstIstUmsatz0);
        istUmsatzBuchung0.setDatum(this.endOfYear());
        istUmsatzBuchung0.setKonto(konto.Umsatz9310);
        istUmsatzBuchung0.setBetrag(umsatzMit0);
        istUmsatzBuchung0.setGegenkonto(konto.Umsatz9300);
        istUmsatzBuchung0.setBezahltAm(this.endOfYear());
        istUmsatzBuchung0.setText("bezahlter Umsatz im Geschaeftsjahr mit 0% Umsatzsteuer");

        let vorsteuer = 0;
        //Summe der Vorsteuer aller im Geschäftsjahr ausgestellten Ausgaben Rechnungen
        this.getAusgabenRechnungArray().forEach(ausgabe => { if (ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear()) vorsteuer += ausgabe.getMehrwertsteuer(); })
        //Summe der Vorsteuer aller im Geschäftsjahr ausgestellten Bewirtungs Rechnungen
        this.getBewirtungsbelegeArray().forEach(ausgabe => { if (ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear()) vorsteuer += ausgabe.getMehrwertsteuer(); })

        let faelligeMehrwertsteuerVorsteuer = this.getOrCreateUmbuchung(belegNr.mwstVorsteuerAufVMwSt);
        faelligeMehrwertsteuerVorsteuer.setDatum(this.endOfYear());
        faelligeMehrwertsteuerVorsteuer.setKonto(konto.Umsatzsteuer_laufendes_Jahr);
        faelligeMehrwertsteuerVorsteuer.setBetrag(vorsteuer);
        faelligeMehrwertsteuerVorsteuer.setGegenkonto(konto.Vorsteuer);
        faelligeMehrwertsteuerVorsteuer.setBezahltAm(this.endOfYear());
        faelligeMehrwertsteuerVorsteuer.setText("Vorsteuer auf 1789");

        //UStVA auf Verbindlichkeiten Umsatzsteuer buchen

        let ustva = 0;
        this.getAusgabenRechnungArray().forEach(ausgabe => {
            if (
                ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear() &&
                ausgabe.getKonto() === konto.UStVA) ustva += ausgabe.getBetrag();
        })
        this.getUmbuchungenArray().forEach(ausgabe => {
            if (
                ausgabe.getDatum().getFullYear() === this.endOfYear().getFullYear() &&
                ausgabe.getKonto() === konto.UStVA &&
                (ausgabe.getId() as string).substr(0, 4) !== "mwst") ustva += ausgabe.getBetrag();
        })
        let mwstUStVAaufVerbindlichkeiten = this.getOrCreateUmbuchung(belegNr.mwstUStVAAufVMwSt);
        mwstUStVAaufVerbindlichkeiten.setDatum(this.endOfYear());
        mwstUStVAaufVerbindlichkeiten.setKonto(konto.Umsatzsteuer_laufendes_Jahr);
        mwstUStVAaufVerbindlichkeiten.setBetrag(ustva);
        mwstUStVAaufVerbindlichkeiten.setGegenkonto(konto.UStVA);
        mwstUStVAaufVerbindlichkeiten.setBezahltAm(this.endOfYear());
        mwstUStVAaufVerbindlichkeiten.setText("UStVA auf 1789");

        //offenen Posten für die spätere Bankbuchung ans Finanzamt erstellen
        let mwstFinanzamtOP = this.getOrCreateUmbuchung(belegNr.mwstFinanzamtOP);
        mwstFinanzamtOP.setDatum(this.endOfYear());
        mwstFinanzamtOP.setKonto(konto.Umsatzsteuer_laufendes_Jahr);
        mwstFinanzamtOP.setBetrag(fealligeUmsatzsteuer19 - vorsteuer - ustva);
        mwstFinanzamtOP.setGegenkonto(konto.Umsatzsteuer_laufendes_Jahr);
        //mwstUStVAaufVerbindlichkeiten.setBezahltAm(this.endOfYear());
        mwstFinanzamtOP.setText("Offener Posten für Zahlung ans/vom Finanzamt im nächsten Jahr");
    }
    public getUStVAVorjahr(): AusgabenRechnung[] {
        return this.getAusgabenRechnungArray().filter(ausgabe => {
            return (ausgabe.getKonto() === konto.UStVA && ausgabe.getDatum().getFullYear() === (this.endOfYear().getFullYear() - 1))
        })
    }
    public save() {
        if (this.ausgabenTableCache !== undefined) this.ausgabenTableCache.save();
        if (this.bewirtungsbelegeTableCache !== undefined) this.bewirtungsbelegeTableCache.save();
        if (this.kontenTableCache !== undefined) this.kontenTableCache.save();
        if (this.ustvaTableCache !== undefined) this.ustvaTableCache.save();
        if (this.eurTableCache !== undefined) this.eurTableCache.save();
        if (this.abschreibungenTableCache !== undefined) this.abschreibungenTableCache.save();
        if (this.verpflegungsmehraufwendungenTableCache !== undefined) this.verpflegungsmehraufwendungenTableCache.save();
        if (this.bankbuchungenTableCache !== undefined) this.bankbuchungenTableCache.save();
        if (this.umbuchungenTableCache !== undefined) this.umbuchungenTableCache.save();
        if (this.einnahmenRechnungTableCache !== undefined) this.einnahmenRechnungTableCache.save();
        if (this.kundenTableCache !== undefined) this.kundenTableCache.save();
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
    public getEURechnungTableCache(): EURechnungTableCache {
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
    public getUmbuchungenTableCache(): UmbuchungenTableCache {
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
    public getGdpduTableCache(): GdpduTableCache {
        if (this.gdpduTableCache === undefined) this.gdpduTableCache = new GdpduTableCache(this.getRootFolderId());
        return this.gdpduTableCache;
    }
    public getConfigurationCache(): ValuesCache {
        if (this.configurationCache === undefined) this.configurationCache = new ValuesCache(ooTables.Konfiguration, this.getRootFolderId());
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
    public getBankontenArray() {
        return (this.getConfigurationCache().getValueByName("bankKonten") as string).split(",");
    }
    public isBankkonto(kontoName: string) { return this.getBankontenArray().indexOf(kontoName) >= 0; }
}



function padToFour(number: number) { return ("000" + number).slice(-4); }

function almostEqual(one: number, two: number, tolerance: number) {
    return (Math.abs(one - two) < tolerance);
}

