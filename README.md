<h1 align="center">osint-canvas</h1>

<p align="center">
  <b>Le plan de travail de vos enquêtes OSINT, en local.</b><br>
  Posez ce que vous trouvez, reliez chaque trouvaille à la précédente,<br>
  et gardez la trace de <i>comment</i> vous y êtes arrivé.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%2024-5FA04E?logo=nodedotjs&logoColor=white" alt="Node ≥ 24">
  <img src="https://img.shields.io/badge/donn%C3%A9es-100%25%20locales-2ea44f" alt="Données 100% locales">
  <img src="https://img.shields.io/badge/z%C3%A9ro-appel%20r%C3%A9seau-blue" alt="Zéro appel réseau">
  <img src="https://img.shields.io/badge/licence-MIT-lightgrey" alt="Licence MIT">
</p>

<p align="center">
  <img src="docs/hero.png" alt="Une enquête ouverte dans osint-canvas : un nom au centre, et les trouvailles reliées autour" width="100%">
</p>

> **In English —** osint-canvas is a local-first canvas for OSINT investigations: drop entities,
> link them, and record *how* you moved from one finding to the next. It collects nothing by
> itself and makes no network calls — you do the searching, it keeps the map. Everything lives in
> a SQLite file on your machine. **The interface is currently in French only.**

---

## Le problème

Une enquête OSINT, c'est une suite de petits sauts : un nom donne un pseudo, le pseudo donne un
dépôt GitHub, le dépôt donne une adresse mail dans les commits. Trois jours plus tard, vous avez
vingt onglets ouverts, un fichier texte en vrac, et vous ne savez plus **d'où sortait** cette
adresse mail — donc vous ne savez plus si elle vaut quelque chose.

osint-canvas garde la carte : chaque trouvaille est un élément, chaque flèche dit ce qui la relie
à la précédente et par quel outil vous l'avez obtenue.

## Ce que ce n'est pas

- **Pas un collecteur.** Aucun scraping, aucune API, aucune requête sortante. L'outil ouvre les
  sites OSINT dans votre navigateur avec la bonne valeur pré-remplie ; c'est vous qui cherchez.
- **Pas un service.** Pas de compte, pas de cloud, pas de télémétrie.
- **Pas une base de renseignement.** C'est un plan de travail : vous y mettez ce que vous
  décidez d'y mettre.

## Démarrer

```bash
git clone https://github.com/<votre-compte>/osint-canvas.git
cd osint-canvas
npm install
npm start
```

L'application s'ouvre sur <http://localhost:5180>. Aucune dépendance native à compiler : la base
est gérée par le module `node:sqlite` intégré à Node 24.

---

## Comment on s'en sert

### 1. Poser un élément

**Double-clic** n'importe où sur le plan, et tapez ou collez la valeur. Le type est deviné :
email, téléphone, date de naissance, wallet, plaque, domaine… et les liens de profil sont
reconnus par plateforme.

<p align="center"><img src="docs/creation.png" alt="Création rapide : un lien GitHub collé, détecté comme compte social" width="620"></p>

### 2. Relier

**Tirez un fil** depuis le bord d'un élément :

- vers un autre élément → ils sont reliés. Lâchez n'importe où sur la carte cible, pas besoin de
  viser un point de 9 pixels ;
- **dans le vide** → l'outil propose de créer l'élément suivant, déjà relié. C'est comme ça qu'on
  déroule une piste sans jamais lâcher la souris.

### 3. Dire comment vous l'avez trouvé

C'est le cœur de l'outil. Une flèche porte **ce qu'elle affirme**, **par quel moyen** vous l'avez
établi, et une **source**. Trois mois plus tard, vous relisez votre propre raisonnement.

<p align="center"><img src="docs/lien.png" alt="Le panneau d'un lien : ce qu'il dit, comment il a été trouvé, sa fiabilité" width="760"></p>

### 4. Le raccourci qui sert tout le temps

Sélectionnez l'élément d'où vient l'info, puis **`Ctrl+V`**.

Vous trouvez le LinkedIn de votre cible ? Clic sur son nœud, copie de l'URL, `Ctrl+V` → un élément
**LinkedIn · jean-dupont-92** apparaît à côté, **déjà relié**, avec l'URL gardée en source
cliquable. Une trentaine de plateformes sont reconnues (LinkedIn, X, Instagram, Facebook, TikTok,
Telegram, Reddit, GitHub, Twitch, Steam, Mastodon, Bluesky, Malt, Leboncoin…).

Ça marche pareil avec un email, un numéro, **plusieurs lignes d'un coup** (un élément par ligne,
tous reliés), ou une **capture d'écran** collée depuis le presse-papier.

---

## Ce qu'il y a dedans

### 17 types d'éléments

Personne · Date de naissance · Pseudo · Email · Téléphone · Compte social · Domaine / site ·
IP / appareil · Photo / capture · Lieu / adresse · Organisation · Document · Véhicule ·
Wallet crypto · Compte bancaire · Recherche effectuée · Note

Chaque type a ses propres champs, et vous pouvez toujours en ajouter un à la volée. Une date de
naissance affiche l'âge du jour, calculé au vol.

### ~75 outils OSINT, filtrés par contexte

Sélectionnez un élément : la colonne de droite ne montre que les outils qui s'appliquent à son
type, et remplit la valeur pour vous. Moteurs et dorks, pseudos (WhatsMyName, Sherlock, Maigret),
emails (Epieos, Holehe, HIBP, Hunter), téléphone, réseaux sociaux, recherche d'image inversée,
domaines et infra (crt.sh, urlscan, Shodan, Censys), fuites, géo, et une section France
(annuaire des entreprises, Pappers, BODACC, matchID, Geneanet…).

Les outils en ligne de commande copient la commande prête à coller. `+ Outil` ajoute les vôtres :
une URL avec `{{value}}` à l'endroit de la valeur. La case **tracer** dépose en plus un élément
« Recherche » relié à chaque fois que vous ouvrez un outil — votre chemin reste sur le plan.

<p align="center"><img src="docs/outils.png" alt="Le panneau d'un élément et les outils filtrés pour son type" width="760"></p>

### Fiabilité

Chaque élément et chaque lien est **confirmé**, **probable** ou **à vérifier**, avec un code
couleur. Les liens à vérifier sont en pointillés : on voit d'un coup d'œil ce qui tient et ce qui
n'est qu'une hypothèse.

### Doublons et recoupements

Si une valeur existe déjà, l'outil le signale et propose de fusionner les deux éléments — et vous
prévient quand elle apparaît dans une **autre enquête**. `Ctrl+F` cherche dans le plan courant et
dans tous les autres.

### Sauvegarde automatique et historique

Tout est enregistré une seconde après votre dernière action. Le plan se rouvre exactement comme
vous l'aviez laissé : positions, zoom, sélection.

En plus, chaque enquête garde une **frise de versions**. Un clic sur `16:19` restaure le plan tel
qu'il était à ce moment — et l'état courant est photographié avant de basculer, donc une
restauration ne perd jamais rien.

<p align="center"><img src="docs/historique.png" alt="La liste des enquêtes et la frise des versions" width="300"></p>

### Exporter

<img src="docs/rapport.png" alt="Le rapport imprimable généré depuis le plan" width="380" align="right">

- **PNG** du plan, en haute résolution ;
- **rapport imprimable** (PDF via `Ctrl+P`) : éléments groupés par type, liens avec leur méthode,
  et la chronologie de la recherche ;
- **rapport Markdown** ;
- **sauvegarde JSON** réimportable, pour archiver ou passer l'enquête à quelqu'un.

<br clear="right">

### Thème clair

<p align="center"><img src="docs/theme-clair.png" alt="Le même plan en thème clair" width="100%"></p>

---

## Raccourcis

| Geste | Effet |
|---|---|
| Double-clic sur le plan | Créer un élément (type deviné, option « relier à ») |
| Glisser un type depuis la droite | Créer un élément à cet endroit |
| Tirer un fil depuis un élément | Relier, ou créer l'élément suivant déjà relié |
| Double-clic sur le titre d'un élément | Renommer sur place |
| `Ctrl+V` | Coller une trouvaille : typée, et reliée à la sélection |
| `Ctrl+F` | Chercher ici **et** dans les autres enquêtes |
| `Ctrl+Z` / `Ctrl+Y` | Annuler / rétablir |
| `Ctrl+S` | Figer une version dans l'historique |
| `Suppr` | Supprimer la sélection |
| `Maj` + clic | Sélection multiple (2 éléments → Fusionner) |
| `Échap` | Fermer le panneau ou la recherche |

---

## Où sont mes données

```
data/osint.db            enquêtes, liens, historique des versions
data/attachments/<id>/   les captures collées, rangées par enquête
```

Un fichier SQLite, rien d'autre. Copiez-le, sauvegardez-le, mettez-le sur une clé. `data/` est
dans le `.gitignore` : vos enquêtes ne partiront jamais dans un commit par accident.

Pour travailler sur une base séparée (démo, tests, cloisonnement d'une affaire) :

```bash
OSINT_DATA_DIR=/chemin/vers/dossier npm run server
```

> Pas de chiffrement au repos pour l'instant. Si vos enquêtes sont sensibles, posez `data/` sur un
> volume chiffré (VeraCrypt, BitLocker, LUKS).

## Cadre d'usage

Cet outil sert à **organiser** de l'information que vous avez collectée par ailleurs. Il ne vous
dispense de rien : la légalité de ce que vous faites dépend de ce que vous collectez, sur qui, et
pourquoi.

En Europe, agréger des données publiques sur une personne physique reste un traitement de données
personnelles au sens du RGPD — il vous faut une base légale, une finalité, et une durée de
conservation. Journalisme, recherche académique, sécurité défensive, due diligence, test
d'intrusion mandaté : très bien. Harcèlement, doxxing, surveillance d'un particulier : non, et
ce n'est pas ce pour quoi ce dépôt existe.

Les captures de cette page montrent une enquête fictive.

## Sous le capot

| | |
|---|---|
| Interface | React 18 + TypeScript, [React Flow](https://reactflow.dev) pour le canvas, Zustand |
| Serveur | Express, ~200 lignes, une API REST |
| Base | `node:sqlite` (intégré à Node 24) — **aucune dépendance native** |
| Build | Vite |

```
server/      API REST + schéma SQLite
src/lib/     types d'éléments, catalogue d'outils, détection, export, mise en page
src/         composants de l'interface et magasin d'état
```

Le serveur sert aussi le `dist/` s'il existe (`npm run build`), pour tourner sur un seul port.
L'architecture est prête à être empaquetée en application de bureau (Electron) sans réécriture.

## Limites connues

- Interface en français uniquement.
- Les éléments ne se redimensionnent pas à la main.
- Deux onglets ouverts sur la même enquête ne se synchronisent pas en direct.
- Testé sur Windows avec Chrome ; devrait tourner partout où Node 24 tourne.

## Contribuer

Les issues et les PR sont les bienvenues — en particulier : de nouveaux outils dans
`src/lib/tools.ts`, de nouvelles plateformes dans `src/lib/platforms.ts`, et une traduction de
l'interface. Avant d'ouvrir une PR : `npx tsc --noEmit` doit passer.

## Licence

MIT — voir [LICENSE](LICENSE).
