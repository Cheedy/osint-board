<h1 align="center">osint-canvas</h1>

<p align="center">
  <b>Il piano di lavoro delle tue indagini OSINT, in locale.</b><br>
  Metti quello che trovi, collega ogni scoperta alla precedente,<br>
  e tieni traccia di <i>come</i> ci sei arrivato.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <b>Italiano</b> ·
  <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%2024-5FA04E?logo=nodedotjs&logoColor=white" alt="Node >= 24">
  <img src="https://img.shields.io/badge/dati-100%25%20locali-2ea44f" alt="Dati 100% locali">
  <img src="https://img.shields.io/badge/zero-chiamate%20di%20rete-blue" alt="Zero chiamate di rete">
  <img src="https://img.shields.io/badge/licenza-MIT-lightgrey" alt="Licenza MIT">
  <img src="https://img.shields.io/badge/lingue-6-9b59b6" alt="6 lingue">
</p>

<p align="center">
  <img src="docs/hero.png" alt="Un'indagine aperta in osint-canvas: un nome al centro e le scoperte collegate intorno" width="100%">
</p>

> Le schermate di questa pagina mostrano l'interfaccia in inglese; l'applicazione parla anche italiano.

---

## Il problema

Un'indagine OSINT è una serie di piccoli salti: un nome ti dà un username, l'username ti dà un
repository GitHub, il repository ti dà un'email nei commit. Tre giorni dopo hai venti schede
aperte, un file di testo alla rinfusa, e non ricordi più **da dove veniva** quell'email — quindi
non sai più se vale qualcosa.

osint-canvas conserva la mappa: ogni scoperta è un elemento e ogni freccia dice cosa la lega alla
precedente e con quale strumento l'hai ottenuta.

## Cosa non è

- **Non è un raccoglitore.** Niente scraping, niente API, nessuna richiesta in uscita.
  L'applicazione apre i siti OSINT nel tuo browser con il valore già inserito; a cercare sei tu.
- **Non è un servizio.** Nessun account, nessun cloud, nessuna telemetria.
- **Non è una banca dati di intelligence.** È un piano di lavoro: ci metti quello che decidi tu.

## Iniziare

```bash
git clone https://github.com/Cheedy/osint-board.git
cd osint-board
npm install
npm start
```

L'applicazione si apre su <http://localhost:5180>. Nessuna dipendenza nativa da compilare: il
database è gestito dal modulo `node:sqlite` integrato in Node 24.

---

## Come si usa

### 1. Mettere un elemento

**Doppio clic** ovunque sulla mappa, poi scrivi o incolla il valore. Il tipo viene indovinato:
email, telefono, data di nascita, wallet, targa, dominio… e i link ai profili sono riconosciuti
per piattaforma.

<p align="center"><img src="docs/creation.png" alt="Creazione rapida: un link GitHub incollato e rilevato come account social" width="620"></p>

### 2. Collegare

**Tira un filo** dal bordo di un elemento:

- verso un altro elemento → vengono collegati. Rilascia in qualsiasi punto della scheda di
  destinazione, non serve mirare a un punto di 9 pixel;
- **nel vuoto** → l'applicazione propone di creare l'elemento successivo, **già collegato**. È
  così che si segue una pista senza mai lasciare il mouse.

### 3. Dire come l'hai trovato

È il cuore dello strumento. Una freccia porta **cosa afferma**, **con quale mezzo** l'hai
stabilito e una **fonte**. Tre mesi dopo rileggi il tuo stesso ragionamento.

<p align="center"><img src="docs/lien.png" alt="Il pannello di un collegamento: cosa dice, come è stato trovato, la sua affidabilità" width="760"></p>

### 4. La scorciatoia che userai sempre

Seleziona l'elemento da cui viene l'informazione, poi premi **`Ctrl+V`**.

Hai trovato il LinkedIn del tuo obiettivo? Clic sul suo nodo, copia l'URL del profilo, `Ctrl+V` →
un elemento **LinkedIn · john-doe-92** compare accanto, **già collegato**, con l'URL conservato
come fonte cliccabile. Sono riconosciute una trentina di piattaforme (LinkedIn, X, Instagram,
Facebook, TikTok, Telegram, Reddit, GitHub, Twitch, Steam, Mastodon, Bluesky, Malt, Leboncoin…).

Funziona allo stesso modo con un'email, un numero, **più righe in una volta** (un elemento per
riga, tutti collegati) o uno **screenshot** incollato dagli appunti.

---

## Cosa c'è dentro

### 17 tipi di elementi

Persona · Data di nascita · Username · Email · Telefono · Account social · Dominio / sito ·
IP / dispositivo · Foto / screenshot · Luogo / indirizzo · Organizzazione · Documento · Veicolo ·
Wallet cripto · Conto bancario · Ricerca effettuata · Nota

Ogni tipo ha i suoi campi, e puoi sempre aggiungerne uno al volo. Una data di nascita mostra
l'età di oggi, calcolata sul momento.

### ~75 strumenti OSINT, filtrati per contesto

Seleziona un elemento: la colonna di destra mostra solo gli strumenti adatti al suo tipo e
riempie il valore per te. Motori e dork, username (WhatsMyName, Sherlock, Maigret), email (Epieos,
Holehe, HIBP, Hunter), telefono, social network, ricerca inversa immagini, domini e infrastruttura
(crt.sh, urlscan, Shodan, Censys), fughe di dati, geo, e una sezione Francia (registro imprese,
Pappers, BODACC, matchID, Geneanet…).

Gli strumenti da riga di comando copiano il comando pronto da incollare. `+ Strumento` aggiunge i
tuoi: un URL con `{{value}}` al posto del valore. La casella **traccia** lascia inoltre un
elemento «Ricerca» collegato ogni volta che apri uno strumento — il tuo percorso resta sulla mappa.

<p align="center"><img src="docs/outils.png" alt="Il pannello di un elemento e gli strumenti filtrati per il suo tipo" width="760"></p>

### Affidabilità

Ogni elemento e ogni collegamento è **confermato**, **probabile** o **da verificare**, con un
codice colore. I collegamenti da verificare sono tratteggiati: vedi a colpo d'occhio cosa regge e
cosa è solo un'ipotesi.

### Duplicati e riscontri

Se un valore esiste già, l'applicazione lo segnala e propone di unire i due elementi — e ti avvisa
quando quel valore compare in **un'altra indagine**. `Ctrl+F` cerca nella mappa corrente e in
tutte le altre.

### Salvataggio automatico e cronologia

Tutto viene salvato un secondo dopo la tua ultima azione. La mappa si riapre esattamente come
l'avevi lasciata: posizioni, zoom, selezione.

In più, ogni indagine conserva una **linea di versioni**. Un clic su `20:23` ripristina la mappa
com'era in quel momento — e lo stato attuale viene fotografato prima di cambiare, quindi un
ripristino non perde mai nulla.

<p align="center"><img src="docs/historique.png" alt="L'elenco delle indagini e la linea delle versioni" width="300"></p>

### Esportare

<img src="docs/rapport.png" alt="Il rapporto stampabile generato dalla mappa" width="380" align="right">

- **PNG** della mappa, in alta risoluzione;
- **rapporto stampabile** (PDF con `Ctrl+P`): elementi raggruppati per tipo, collegamenti con il
  loro metodo e la cronologia della ricerca;
- **rapporto Markdown**;
- **backup JSON**, reimportabile, per archiviare o passare l'indagine a qualcuno.

<br clear="right">

### Sei lingue

L'interfaccia parla **italiano, inglese, francese, spagnolo, portoghese e tedesco** — compresi i
17 tipi di elementi, i loro campi, le categorie di strumenti e i rapporti esportati. Il selettore
è in fondo alla colonna di sinistra; al primo avvio si usa la lingua del browser, poi la tua
scelta viene ricordata.

I tuoi dati non vengono mai tradotti: quello che scrivi resta com'è.

<p align="center"><img src="docs/langues.png" alt="La tavolozza degli elementi in inglese" width="290"></p>

### Tema chiaro

<p align="center"><img src="docs/theme-clair.png" alt="La stessa mappa con il tema chiaro" width="100%"></p>

---

## Scorciatoie

| Gesto | Effetto |
|---|---|
| Doppio clic sulla mappa | Creare un elemento (tipo indovinato, opzione «collega a») |
| Trascinare un tipo da destra | Creare un elemento in quel punto |
| Tirare un filo da un elemento | Collegare, o creare l'elemento successivo già collegato |
| Doppio clic sul titolo di un elemento | Rinominare sul posto |
| `Ctrl+V` | Incollare una scoperta: tipizzata e collegata alla selezione |
| `Ctrl+F` | Cercare qui **e** nelle altre indagini |
| `Ctrl+Z` / `Ctrl+Y` | Annulla / ripristina |
| `Ctrl+S` | Fissare una versione nella cronologia |
| `Canc` | Eliminare la selezione |
| `Maiusc` + clic | Selezione multipla (2 elementi → Unisci) |
| `Esc` | Chiudere il pannello o la ricerca |

---

## Dove stanno i miei dati

```
data/osint.db            indagini, collegamenti, cronologia delle versioni
data/attachments/<id>/   gli screenshot incollati, ordinati per indagine
```

Un file SQLite, nient'altro. Copialo, fanne un backup, mettilo su una chiavetta. `data/` è nel
`.gitignore`: le tue indagini non finiranno mai in un commit per sbaglio.

Per lavorare su un database separato (demo, test, compartimentare un caso):

```bash
OSINT_DATA_DIR=/percorso/alla/cartella npm run server
```

> Per ora nessuna cifratura a riposo. Se le tue indagini sono sensibili, metti `data/` su un
> volume cifrato (VeraCrypt, BitLocker, LUKS).

## Uso responsabile

Questo strumento serve a **organizzare** informazioni raccolte altrove. Non ti esonera da nulla:
la liceità di quello che fai dipende da cosa raccogli, su chi e perché.

In Europa, aggregare dati pubblici su una persona fisica resta un trattamento di dati personali ai
sensi del GDPR — servono una base giuridica, una finalità e un periodo di conservazione.
Giornalismo, ricerca accademica, sicurezza difensiva, due diligence, un penetration test
autorizzato: benissimo. Molestie, doxxing, sorvegliare un privato cittadino: no, e non è per
questo che esiste questo repository.

Le schermate di questa pagina mostrano un'indagine di fantasia.

## Sotto il cofano

| | |
|---|---|
| Interfaccia | React 18 + TypeScript, [React Flow](https://reactflow.dev) per la tela, Zustand |
| Server | Express, ~200 righe, una API REST |
| Database | `node:sqlite` (integrato in Node 24) — **nessuna dipendenza nativa** |
| Build | Vite |

```
server/      API REST + schema SQLite
src/i18n/    i sei dizionari
src/lib/     tipi di elementi, catalogo strumenti, rilevamento, esportazione, disposizione
src/         componenti dell'interfaccia e store di stato
```

Il server serve anche `dist/` se esiste (`npm run build`), per funzionare su una sola porta.
L'architettura è pronta per essere impacchettata come applicazione desktop (Electron) senza
riscritture.

## Limiti noti

- Gli elementi non si ridimensionano a mano.
- Due schede aperte sulla stessa indagine non si sincronizzano in tempo reale.
- Testato su Windows con Chrome; dovrebbe funzionare ovunque funzioni Node 24.

## Contribuire

Issue e PR sono benvenute — in particolare nuovi strumenti in `src/lib/tools.ts`, nuove
piattaforme in `src/lib/platforms.ts` e nuove lingue.

**Aggiungere una lingua**: copia `src/i18n/fr.ts`, traducilo e dichiaralo in `src/i18n/langs.ts` e
`src/i18n/current.ts`. Il dizionario francese fa da tipo di riferimento, quindi
`npx tsc --noEmit` rifiuta una traduzione a cui manca una chiave — non puoi dimenticarne nessuna.
Quel comando deve passare prima di aprire una PR.

## Licenza

MIT — vedi [LICENSE](LICENSE).
