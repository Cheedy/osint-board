<h1 align="center">osint-canvas</h1>

<p align="center">
  <b>Die Arbeitstafel für deine OSINT-Ermittlungen, komplett lokal.</b><br>
  Setz ab, was du findest, verbinde jeden Fund mit dem vorigen,<br>
  und halt fest, <i>wie</i> du dorthin gekommen bist.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.it.md">Italiano</a> ·
  <b>Deutsch</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%2024-5FA04E?logo=nodedotjs&logoColor=white" alt="Node >= 24">
  <img src="https://img.shields.io/badge/Daten-100%25%20lokal-2ea44f" alt="Daten 100% lokal">
  <img src="https://img.shields.io/badge/null-Netzwerkaufrufe-blue" alt="Null Netzwerkaufrufe">
  <img src="https://img.shields.io/badge/Lizenz-MIT-lightgrey" alt="MIT-Lizenz">
  <img src="https://img.shields.io/badge/Sprachen-6-9b59b6" alt="6 Sprachen">
</p>

<p align="center">
  <img src="docs/hero.png" alt="Eine Ermittlung in osint-canvas: ein Name in der Mitte, die Funde ringsum verbunden" width="100%">
</p>

> Die Screenshots auf dieser Seite zeigen die englische Oberfläche; die Anwendung spricht auch Deutsch.

---

## Das Problem

Eine OSINT-Ermittlung ist eine Folge kleiner Sprünge: ein Name führt zu einem Nutzernamen, der
Nutzername zu einem GitHub-Repository, das Repository zu einer E-Mail-Adresse in den Commits. Drei
Tage später hast du zwanzig offene Tabs, eine unsortierte Textdatei, und du weißt nicht mehr,
**woher diese Adresse kam** — also weißt du auch nicht mehr, ob sie etwas wert ist.

osint-canvas behält die Karte: Jeder Fund ist ein Element, und jeder Pfeil sagt, was ihn mit dem
vorigen verbindet und mit welchem Werkzeug du ihn bekommen hast.

## Was es nicht ist

- **Kein Sammler.** Kein Scraping, keine API, keine ausgehenden Anfragen. Die Anwendung öffnet die
  OSINT-Seiten in deinem Browser mit dem passenden Wert; gesucht wird von dir.
- **Kein Dienst.** Kein Konto, keine Cloud, keine Telemetrie.
- **Keine Nachrichtendatenbank.** Es ist eine Arbeitstafel: Du legst hinein, was du willst.

## Loslegen

```bash
git clone https://github.com/Cheedy/osint-board.git
cd osint-board
npm install
npm start
```

Die Anwendung öffnet sich auf <http://localhost:5180>. Keine native Abhängigkeit zu kompilieren:
Die Datenbank übernimmt das in Node 24 eingebaute Modul `node:sqlite`.

---

## So arbeitet man damit

### 1. Ein Element setzen

**Doppelklick** irgendwo auf die Tafel, dann tippen oder einfügen. Der Typ wird erraten: E-Mail,
Telefon, Geburtsdatum, Wallet, Kennzeichen, Domain… und Profil-Links werden nach Plattform
erkannt.

<p align="center"><img src="docs/creation.png" alt="Schnellanlage: ein eingefügter GitHub-Link, erkannt als Social-Konto" width="620"></p>

### 2. Verbinden

**Zieh einen Faden** vom Rand eines Elements:

- auf ein anderes Element → sie sind verbunden. Lass irgendwo auf der Zielkarte los, du musst
  keinen 9-Pixel-Punkt treffen;
- **ins Leere** → die Anwendung bietet an, das nächste Element anzulegen, **schon verbunden**. So
  verfolgt man eine Spur, ohne die Maus loszulassen.

### 3. Festhalten, wie du es gefunden hast

Das ist der Kern des Werkzeugs. Ein Pfeil trägt, **was er behauptet**, **womit** du es belegt hast
und eine **Quelle**. Drei Monate später liest du deine eigene Argumentation wieder.

<p align="center"><img src="docs/lien.png" alt="Das Panel einer Verbindung: was sie aussagt, wie sie gefunden wurde, ihre Verlässlichkeit" width="760"></p>

### 4. Die Abkürzung, die du ständig brauchst

Wähl das Element aus, von dem die Information stammt, und drück **`Strg+V`**.

Du findest das LinkedIn deiner Zielperson? Klick auf ihren Knoten, kopier die Profil-URL, `Strg+V`
→ ein Element **LinkedIn · john-doe-92** erscheint daneben, **schon verbunden**, mit der URL als
anklickbare Quelle. Rund dreißig Plattformen werden erkannt (LinkedIn, X, Instagram, Facebook,
TikTok, Telegram, Reddit, GitHub, Twitch, Steam, Mastodon, Bluesky, Malt, Leboncoin…).

Genauso mit einer E-Mail, einer Nummer, **mehreren Zeilen auf einmal** (ein Element pro Zeile,
alle verbunden) oder einem **Screenshot** aus der Zwischenablage.

---

## Was drin ist

### 17 Elementtypen

Person · Geburtsdatum · Nutzername · E-Mail · Telefon · Social-Konto · Domain / Website ·
IP / Gerät · Foto / Screenshot · Ort / Adresse · Organisation · Dokument · Fahrzeug ·
Krypto-Wallet · Bankkonto · Durchgeführte Suche · Notiz

Jeder Typ hat eigene Felder, und du kannst jederzeit eins dazunehmen. Ein Geburtsdatum zeigt das
heutige Alter, im Moment berechnet.

### ~75 OSINT-Werkzeuge, nach Kontext gefiltert

Wähl ein Element aus: Die rechte Spalte zeigt nur die Werkzeuge, die zu seinem Typ passen, und
füllt den Wert für dich ein. Suchmaschinen und Dorks, Nutzernamen (WhatsMyName, Sherlock,
Maigret), E-Mail (Epieos, Holehe, HIBP, Hunter), Telefon, soziale Netzwerke,
Bilder-Rückwärtssuche, Domains und Infrastruktur (crt.sh, urlscan, Shodan, Censys), Leaks, Geo und
ein Frankreich-Abschnitt (Handelsregister, Pappers, BODACC, matchID, Geneanet…).

Kommandozeilen-Werkzeuge kopieren den Befehl fertig zum Einfügen. `+ Werkzeug` fügt deine eigenen
hinzu: eine URL mit `{{value}}` an der Stelle des Werts. Das Kästchen **mitschreiben** legt
zusätzlich bei jedem geöffneten Werkzeug ein verbundenes Element „Suche“ an — dein Weg bleibt auf
der Tafel.

<p align="center"><img src="docs/outils.png" alt="Das Panel eines Elements und die für seinen Typ gefilterten Werkzeuge" width="760"></p>

### Verlässlichkeit

Jedes Element und jede Verbindung ist **bestätigt**, **wahrscheinlich** oder **zu prüfen**, mit
Farbcode. Zu prüfende Verbindungen sind gestrichelt: Du siehst auf einen Blick, was hält und was
nur eine Hypothese ist.

### Doppelte Werte und Querbezüge

Existiert ein Wert schon, meldet die Anwendung das und bietet an, die beiden Elemente
zusammenzuführen — und sie sagt dir, wenn der Wert in **einer anderen Ermittlung** auftaucht.
`Strg+F` sucht in der aktuellen Tafel und in allen anderen.

### Automatisches Speichern und Verlauf

Alles wird eine Sekunde nach deiner letzten Aktion gespeichert. Eine Tafel öffnet sich genau so
wieder, wie du sie verlassen hast: Positionen, Zoom, Auswahl.

Dazu behält jede Ermittlung eine **Versionsleiste**. Ein Klick auf `20:23` stellt die Tafel so
wieder her, wie sie in dem Moment war — und der aktuelle Stand wird vorher gesichert, ein
Wiederherstellen verliert also nie etwas.

<p align="center"><img src="docs/historique.png" alt="Die Liste der Ermittlungen und die Versionsleiste" width="300"></p>

### Exportieren

<img src="docs/rapport.png" alt="Der druckbare Bericht aus der Tafel" width="380" align="right">

- **PNG** der Tafel, in hoher Auflösung;
- **druckbarer Bericht** (PDF über `Strg+P`): Elemente nach Typ gruppiert, Verbindungen mit ihrer
  Methode und der Zeitverlauf der Recherche;
- **Markdown-Bericht**;
- **JSON-Sicherung**, wieder importierbar, zum Archivieren oder Weitergeben einer Ermittlung.

<br clear="right">

### Sechs Sprachen

Die Oberfläche spricht **Deutsch, Englisch, Französisch, Spanisch, Portugiesisch und
Italienisch** — samt den 17 Elementtypen, ihren Feldern, den Werkzeugkategorien und den
exportierten Berichten. Die Auswahl sitzt unten in der linken Spalte; beim ersten Start wird die
Browsersprache genommen, danach wird deine Wahl gemerkt.

Deine Daten werden nie übersetzt: Was du schreibst, bleibt so stehen.

<p align="center"><img src="docs/langues.png" alt="Die Elementpalette auf Englisch" width="290"></p>

### Helles Design

<p align="center"><img src="docs/theme-clair.png" alt="Dieselbe Tafel im hellen Design" width="100%"></p>

---

## Tastenkürzel

| Geste | Wirkung |
|---|---|
| Doppelklick auf die Tafel | Element anlegen (Typ erraten, Option „verbinden mit“) |
| Typ von rechts ziehen | Element an dieser Stelle anlegen |
| Faden von einem Element ziehen | Verbinden, oder das nächste Element schon verbunden anlegen |
| Doppelklick auf den Titel eines Elements | An Ort und Stelle umbenennen |
| `Strg+V` | Einen Fund einfügen: typisiert und mit der Auswahl verbunden |
| `Strg+F` | Hier **und** in den anderen Ermittlungen suchen |
| `Strg+Z` / `Strg+Y` | Rückgängig / wiederholen |
| `Strg+S` | Eine Version im Verlauf festhalten |
| `Entf` | Auswahl löschen |
| `Umschalt` + Klick | Mehrfachauswahl (2 Elemente → Zusammenführen) |
| `Esc` | Panel oder Suche schließen |

---

## Wo meine Daten liegen

```
data/osint.db            Ermittlungen, Verbindungen, Versionsverlauf
data/attachments/<id>/   eingefügte Screenshots, je Ermittlung abgelegt
```

Eine SQLite-Datei, mehr nicht. Kopier sie, sicher sie, nimm sie auf einem Stick mit. `data/` steht
in der `.gitignore`: Deine Ermittlungen landen nie versehentlich in einem Commit.

Für eine getrennte Datenbank (Demo, Tests, Abschottung eines Falls):

```bash
OSINT_DATA_DIR=/pfad/zum/ordner npm run server
```

> Vorerst keine Verschlüsselung im Ruhezustand. Sind deine Ermittlungen heikel, leg `data/` auf
> ein verschlüsseltes Volume (VeraCrypt, BitLocker, LUKS).

## Verantwortungsvolle Nutzung

Dieses Werkzeug dient dazu, anderswo erhobene Informationen zu **ordnen**. Es nimmt dir nichts ab:
Ob dein Vorgehen rechtmäßig ist, hängt davon ab, was du erhebst, über wen und wozu.

In Europa bleibt das Zusammenführen öffentlicher Daten über eine natürliche Person eine
Verarbeitung personenbezogener Daten im Sinne der DSGVO — du brauchst eine Rechtsgrundlage, einen
Zweck und eine Speicherfrist. Journalismus, akademische Forschung, defensive Sicherheit, Due
Diligence, ein beauftragter Penetrationstest: alles in Ordnung. Belästigung, Doxxing, das
Überwachen einer Privatperson: nein, und dafür existiert dieses Repository nicht.

Die Screenshots auf dieser Seite zeigen eine erfundene Ermittlung.

## Unter der Haube

| | |
|---|---|
| Oberfläche | React 18 + TypeScript, [React Flow](https://reactflow.dev) für die Leinwand, Zustand |
| Server | Express, ~200 Zeilen, eine REST-API |
| Datenbank | `node:sqlite` (in Node 24 eingebaut) — **keine native Abhängigkeit** |
| Build | Vite |

```
server/      REST-API + SQLite-Schema
src/i18n/    die sechs Wörterbücher
src/lib/     Elementtypen, Werkzeugkatalog, Erkennung, Export, Anordnung
src/         Oberflächenkomponenten und Zustandsspeicher
```

Der Server liefert auch `dist/` aus, falls vorhanden (`npm run build`), um auf einem einzigen Port
zu laufen. Die Architektur ist bereit, ohne Neuschreiben als Desktop-Anwendung (Electron)
verpackt zu werden.

## Bekannte Grenzen

- Elemente lassen sich nicht von Hand in der Größe ändern.
- Zwei Tabs auf derselben Ermittlung gleichen sich nicht live ab.
- Getestet unter Windows mit Chrome; sollte überall laufen, wo Node 24 läuft.

## Mitmachen

Issues und PRs sind willkommen — besonders neue Werkzeuge in `src/lib/tools.ts`, neue Plattformen
in `src/lib/platforms.ts` und neue Sprachen.

**Eine Sprache hinzufügen**: Kopier `src/i18n/fr.ts`, übersetz es und trag es in
`src/i18n/langs.ts` und `src/i18n/current.ts` ein. Das französische Wörterbuch ist der Referenztyp,
deshalb lehnt `npx tsc --noEmit` eine Übersetzung mit fehlendem Schlüssel ab — vergessen kannst du
keinen. Dieser Befehl muss durchlaufen, bevor du eine PR öffnest.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
