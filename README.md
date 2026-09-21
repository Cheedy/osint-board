<h1 align="center">osint-canvas</h1>

<p align="center">
  <b>The working board for your OSINT investigations, entirely local.</b><br>
  Drop what you find, link each finding to the previous one,<br>
  and keep a record of <i>how</i> you got there.
</p>

<p align="center">
  <b>English</b> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%2024-5FA04E?logo=nodedotjs&logoColor=white" alt="Node >= 24">
  <img src="https://img.shields.io/badge/data-100%25%20local-2ea44f" alt="100% local data">
  <img src="https://img.shields.io/badge/zero-network%20calls-blue" alt="Zero network calls">
  <img src="https://img.shields.io/badge/licence-MIT-lightgrey" alt="MIT licence">
  <img src="https://img.shields.io/badge/languages-6-9b59b6" alt="6 languages">
</p>

<p align="center">
  <img src="docs/hero.png" alt="An investigation open in osint-canvas: a name in the middle, findings linked around it" width="100%">
</p>

---

## The problem

An OSINT investigation is a series of small jumps: a name gives you a handle, the handle gives you
a GitHub repository, the repository gives you an email address in the commits. Three days later
you have twenty tabs open, a messy text file, and you no longer remember **where that email came
from** — so you no longer know whether it is worth anything.

osint-canvas keeps the map: every finding is an entity, and every arrow says what connects it to
the previous one and which tool got you there.

## What it is not

- **Not a collector.** No scraping, no API, no outbound requests. The app opens OSINT sites in
  your browser with the right value pre-filled; you do the searching.
- **Not a service.** No account, no cloud, no telemetry.
- **Not an intelligence database.** It is a working board: you put in it what you decide to put in it.

## Getting started

```bash
git clone https://github.com/Cheedy/osint-board.git
cd osint-board
npm install
npm start
```

The app opens at <http://localhost:5180>. No native dependency to compile: the database is handled
by the `node:sqlite` module built into Node 24.

---

## How you use it

### 1. Drop an entity

**Double-click** anywhere on the board, then type or paste the value. The type is guessed: email,
phone, date of birth, wallet, licence plate, domain… and profile links are recognised by platform.

<p align="center"><img src="docs/creation.png" alt="Quick add: a GitHub link pasted and detected as a social account" width="620"></p>

### 2. Link

**Pull a thread** from the edge of an entity:

- onto another entity → they are linked. Drop anywhere on the target card, no need to aim at a
  9-pixel dot;
- **into empty space** → the app offers to create the next entity, **already linked**. That is how
  you follow a lead without ever letting go of the mouse.

### 3. Say how you found it

This is the heart of the tool. An arrow carries **what it claims**, **by which means** you
established it, and a **source**. Three months later, you can read your own reasoning again.

<p align="center"><img src="docs/lien.png" alt="A link panel: what it says, how it was found, its confidence" width="760"></p>

### 4. The shortcut you will use all the time

Select the entity the information came from, then press **`Ctrl+V`**.

Found your target's LinkedIn? Click their node, copy the profile URL, `Ctrl+V` → a
**LinkedIn · john-doe-92** entity appears next to it, **already linked**, with the URL kept as a
clickable source. About thirty platforms are recognised (LinkedIn, X, Instagram, Facebook, TikTok,
Telegram, Reddit, GitHub, Twitch, Steam, Mastodon, Bluesky, Malt, Leboncoin…).

It works the same with an email, a phone number, **several lines at once** (one entity per line,
all linked), or a **screenshot** pasted from the clipboard.

---

## What is inside

### 17 entity types

Person · Date of birth · Handle · Email · Phone · Social account · Domain / site · IP / device ·
Photo / screenshot · Place / address · Organisation · Document · Vehicle · Crypto wallet ·
Bank account · Search performed · Note

Each type has its own fields, and you can always add one on the fly. A date of birth shows the
age as of today, computed on the spot.

### ~75 OSINT tools, filtered by context

Select an entity: the right column only shows the tools that apply to its type, and fills in the
value for you. Search engines and dorks, handles (WhatsMyName, Sherlock, Maigret), email (Epieos,
Holehe, HIBP, Hunter), phone, social networks, reverse image search, domains and infrastructure
(crt.sh, urlscan, Shodan, Censys), leaks, geo, and a France section (company register, Pappers,
BODACC, matchID, Geneanet…).

Command-line tools copy the command ready to paste. `+ Tool` adds your own: a URL with
`{{value}}` where the value goes. The **trace** checkbox also drops a linked “Search” entity every
time you open a tool — your path stays on the board.

<p align="center"><img src="docs/outils.png" alt="An entity panel and the tools filtered for its type" width="760"></p>

### Confidence

Every entity and every link is **confirmed**, **likely** or **to verify**, with a colour code.
Links to verify are dashed: you see at a glance what holds and what is only a hypothesis.

### Duplicates and cross-checks

If a value already exists, the app says so and offers to merge the two entities — and it tells you
when that value shows up in **another investigation**. `Ctrl+F` searches the current board and all
the others.

### Autosave and history

Everything is saved one second after your last action. A board reopens exactly as you left it:
positions, zoom, selection.

On top of that, each investigation keeps a **version timeline**. Clicking `20:23` restores the
board as it was at that moment — and the current state is captured first, so restoring never
loses anything.

<p align="center"><img src="docs/historique.png" alt="The investigation list and the version timeline" width="300"></p>

### Export

<img src="docs/rapport.png" alt="The printable report generated from the board" width="380" align="right">

- **PNG** of the board, at high resolution;
- **printable report** (PDF via `Ctrl+P`): entities grouped by type, links with their method, and
  the timeline of the search;
- **Markdown report**;
- **JSON backup**, re-importable, to archive an investigation or hand it to someone else.

<br clear="right">

### Six languages

The interface speaks **English, French, Spanish, Portuguese, Italian and German** — including the
17 entity types, their fields, the tool categories and the exported reports. The picker sits at
the bottom of the left column; your browser language is used by default on first launch, and your
choice is remembered afterwards.

Your data is never translated: what you write stays as you wrote it.

<p align="center"><img src="docs/langues.png" alt="The entity palette in English" width="290"></p>

### Light theme

<p align="center"><img src="docs/theme-clair.png" alt="The same board in the light theme" width="100%"></p>

---

## Shortcuts

| Gesture | Effect |
|---|---|
| Double-click on the board | Create an entity (type guessed, “link to” option) |
| Drag a type from the right | Create an entity at that spot |
| Pull a thread from an entity | Link, or create the next entity already linked |
| Double-click an entity title | Rename in place |
| `Ctrl+V` | Paste a finding: typed, and linked to the selection |
| `Ctrl+F` | Search here **and** in the other investigations |
| `Ctrl+Z` / `Ctrl+Y` | Undo / redo |
| `Ctrl+S` | Pin a version in the history |
| `Delete` | Delete the selection |
| `Shift` + click | Multiple selection (2 entities → Merge) |
| `Esc` | Close the panel or the search |

---

## Where my data lives

```
data/osint.db            investigations, links, version history
data/attachments/<id>/   pasted screenshots, filed per investigation
```

One SQLite file, nothing else. Copy it, back it up, put it on a USB stick. `data/` is in
`.gitignore`: your investigations can never end up in a commit by accident.

To work on a separate database (demo, tests, compartmenting a case):

```bash
OSINT_DATA_DIR=/path/to/folder npm run server
```

> No encryption at rest for now. If your investigations are sensitive, put `data/` on an encrypted
> volume (VeraCrypt, BitLocker, LUKS).

## Responsible use

This tool is for **organising** information you collected elsewhere. It excuses nothing: whether
what you do is lawful depends on what you collect, about whom, and why.

In Europe, aggregating public data about a natural person is still processing of personal data
under the GDPR — you need a legal basis, a purpose, and a retention period. Journalism, academic
research, defensive security, due diligence, an authorised penetration test: fine. Harassment,
doxxing, surveilling a private individual: no, and that is not what this repository exists for.

The screenshots on this page show a fictional investigation.

## Under the hood

| | |
|---|---|
| Interface | React 18 + TypeScript, [React Flow](https://reactflow.dev) for the canvas, Zustand |
| Server | Express, ~200 lines, a REST API |
| Database | `node:sqlite` (built into Node 24) — **no native dependency** |
| Build | Vite |

```
server/      REST API + SQLite schema
src/i18n/    the six dictionaries
src/lib/     entity types, tool catalogue, detection, export, layout
src/         interface components and state store
```

The server also serves `dist/` if it exists (`npm run build`), to run on a single port. The
architecture is ready to be packaged as a desktop app (Electron) without a rewrite.

## Known limits

- Entities cannot be resized by hand.
- Two tabs open on the same investigation do not sync live.
- Tested on Windows with Chrome; should run anywhere Node 24 runs.

## Contributing

Issues and PRs are welcome — especially new tools in `src/lib/tools.ts`, new platforms in
`src/lib/platforms.ts`, and new languages.

**Adding a language**: copy `src/i18n/fr.ts`, translate it, and declare it in `src/i18n/langs.ts`
and `src/i18n/current.ts`. The French dictionary is the reference type, so `npx tsc --noEmit`
rejects a translation with a missing key — you cannot forget one. That command must pass before
you open a PR.

## Licence

MIT — see [LICENSE](LICENSE).
