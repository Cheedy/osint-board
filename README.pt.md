<h1 align="center">osint-canvas</h1>

<p align="center">
  <b>O plano de trabalho das tuas investigações OSINT, em local.</b><br>
  Coloca o que encontras, liga cada descoberta à anterior,<br>
  e guarda o rasto de <i>como</i> lá chegaste.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.es.md">Español</a> ·
  <b>Português</b> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%2024-5FA04E?logo=nodedotjs&logoColor=white" alt="Node >= 24">
  <img src="https://img.shields.io/badge/dados-100%25%20locais-2ea44f" alt="Dados 100% locais">
  <img src="https://img.shields.io/badge/zero-pedidos%20de%20rede-blue" alt="Zero pedidos de rede">
  <img src="https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey" alt="Licença MIT">
  <img src="https://img.shields.io/badge/idiomas-6-9b59b6" alt="6 idiomas">
</p>

<p align="center">
  <img src="docs/hero.png" alt="Uma investigação aberta no osint-canvas: um nome ao centro e as descobertas ligadas à volta" width="100%">
</p>

> As capturas desta página mostram a interface em inglês; a aplicação também fala português.

---

## O problema

Uma investigação OSINT é uma série de pequenos saltos: um nome dá-te um nome de utilizador, esse
dá-te um repositório no GitHub, o repositório dá-te um email nos commits. Três dias depois tens
vinte separadores abertos, um ficheiro de texto desarrumado, e já não te lembras **de onde saiu**
esse email — por isso já não sabes se vale alguma coisa.

O osint-canvas guarda o mapa: cada descoberta é um elemento e cada seta diz o que a liga à
anterior e com que ferramenta a obtiveste.

## O que não é

- **Não é um recolector.** Sem scraping, sem API, sem pedidos para fora. A aplicação abre os sites
  OSINT no teu navegador com o valor já preenchido; quem procura és tu.
- **Não é um serviço.** Sem conta, sem nuvem, sem telemetria.
- **Não é uma base de informações.** É um plano de trabalho: pões lá o que decidires pôr.

## Começar

```bash
git clone https://github.com/Cheedy/osint-board.git
cd osint-board
npm install
npm start
```

A aplicação abre em <http://localhost:5180>. Nenhuma dependência nativa para compilar: a base é
gerida pelo módulo `node:sqlite` integrado no Node 24.

---

## Como se usa

### 1. Colocar um elemento

**Duplo clique** em qualquer sítio do plano, e escreve ou cola o valor. O tipo é adivinhado: email,
telefone, data de nascimento, carteira, matrícula, domínio… e as ligações de perfil são
reconhecidas por plataforma.

<p align="center"><img src="docs/creation.png" alt="Criação rápida: uma ligação do GitHub colada e detetada como conta social" width="620"></p>

### 2. Ligar

**Puxa um fio** a partir da borda de um elemento:

- para outro elemento → ficam ligados. Larga em qualquer ponto do cartão de destino, não é preciso
  acertar num ponto de 9 píxeis;
- **no vazio** → a aplicação propõe criar o elemento seguinte, **já ligado**. É assim que se segue
  uma pista sem largar o rato.

### 3. Dizer como a encontraste

É o coração da ferramenta. Uma seta leva **o que afirma**, **por que meio** a estabeleceste e uma
**fonte**. Três meses depois, voltas a ler o teu próprio raciocínio.

<p align="center"><img src="docs/lien.png" alt="O painel de uma ligação: o que diz, como foi encontrada, a sua fiabilidade" width="760"></p>

### 4. O atalho que vais usar sempre

Seleciona o elemento de onde vem a informação e carrega em **`Ctrl+V`**.

Encontraste o LinkedIn do teu alvo? Clique no nó dele, copia o URL do perfil, `Ctrl+V` → um
elemento **LinkedIn · john-doe-92** aparece ao lado, **já ligado**, com o URL guardado como fonte
clicável. São reconhecidas cerca de trinta plataformas (LinkedIn, X, Instagram, Facebook, TikTok,
Telegram, Reddit, GitHub, Twitch, Steam, Mastodon, Bluesky, Malt, Leboncoin…).

Funciona igual com um email, um número, **várias linhas de uma vez** (um elemento por linha, todos
ligados) ou uma **captura de ecrã** colada da área de transferência.

---

## O que tem lá dentro

### 17 tipos de elementos

Pessoa · Data de nascimento · Nome de utilizador · Email · Telefone · Conta social ·
Domínio / site · IP / equipamento · Foto / captura · Local / morada · Organização · Documento ·
Veículo · Carteira cripto · Conta bancária · Pesquisa efetuada · Nota

Cada tipo tem os seus campos, e podes sempre acrescentar um à mão. Uma data de nascimento mostra a
idade de hoje, calculada na hora.

### ~75 ferramentas OSINT, filtradas por contexto

Seleciona um elemento: a coluna da direita só mostra as ferramentas que se aplicam ao seu tipo, e
preenche o valor por ti. Motores e dorks, nomes de utilizador (WhatsMyName, Sherlock, Maigret),
email (Epieos, Holehe, HIBP, Hunter), telefone, redes sociais, pesquisa inversa de imagem,
domínios e infraestrutura (crt.sh, urlscan, Shodan, Censys), fugas, geo, e uma secção França
(registo comercial, Pappers, BODACC, matchID, Geneanet…).

As ferramentas de linha de comandos copiam o comando pronto a colar. `+ Ferramenta` acrescenta as
tuas: um URL com `{{value}}` no lugar do valor. A caixa **rastrear** deixa ainda um elemento
«Pesquisa» ligado sempre que abres uma ferramenta — o teu caminho fica no plano.

<p align="center"><img src="docs/outils.png" alt="O painel de um elemento e as ferramentas filtradas para o seu tipo" width="760"></p>

### Fiabilidade

Cada elemento e cada ligação é **confirmado**, **provável** ou **por verificar**, com um código de
cor. As ligações por verificar ficam a tracejado: vês num relance o que se aguenta e o que é só
uma hipótese.

### Duplicados e cruzamentos

Se um valor já existe, a aplicação avisa e propõe fundir os dois elementos — e diz-te quando esse
valor aparece **noutra investigação**. `Ctrl+F` procura no plano atual e em todos os outros.

### Gravação automática e histórico

Tudo é guardado um segundo depois da tua última ação. O plano reabre exatamente como o deixaste:
posições, zoom, seleção.

Além disso, cada investigação guarda uma **linha de versões**. Um clique em `20:23` restaura o
plano tal como estava nesse momento — e o estado atual é fotografado antes de mudar, por isso uma
restauração nunca perde nada.

<p align="center"><img src="docs/historique.png" alt="A lista de investigações e a linha de versões" width="300"></p>

### Exportar

<img src="docs/rapport.png" alt="O relatório imprimível gerado a partir do plano" width="380" align="right">

- **PNG** do plano, em alta resolução;
- **relatório imprimível** (PDF com `Ctrl+P`): elementos agrupados por tipo, ligações com o seu
  método e a cronologia da pesquisa;
- **relatório Markdown**;
- **cópia de segurança JSON**, reimportável, para arquivar ou passar a investigação a alguém.

<br clear="right">

### Seis idiomas

A interface fala **português, inglês, francês, espanhol, italiano e alemão** — incluindo os 17
tipos de elementos, os seus campos, as categorias de ferramentas e os relatórios exportados. O
seletor está em baixo na coluna da esquerda; no primeiro arranque usa-se o idioma do navegador, e
depois a tua escolha fica guardada.

Os teus dados nunca são traduzidos: o que escreves fica tal e qual.

<p align="center"><img src="docs/langues.png" alt="A paleta de elementos em inglês" width="290"></p>

### Tema claro

<p align="center"><img src="docs/theme-clair.png" alt="O mesmo plano com o tema claro" width="100%"></p>

---

## Atalhos

| Gesto | Efeito |
|---|---|
| Duplo clique no plano | Criar um elemento (tipo adivinhado, opção «ligar a») |
| Arrastar um tipo da direita | Criar um elemento nesse ponto |
| Puxar um fio de um elemento | Ligar, ou criar o elemento seguinte já ligado |
| Duplo clique no título de um elemento | Mudar o nome no lugar |
| `Ctrl+V` | Colar uma descoberta: tipada e ligada à seleção |
| `Ctrl+F` | Procurar aqui **e** nas outras investigações |
| `Ctrl+Z` / `Ctrl+Y` | Anular / refazer |
| `Ctrl+S` | Fixar uma versão no histórico |
| `Delete` | Eliminar a seleção |
| `Shift` + clique | Seleção múltipla (2 elementos → Fundir) |
| `Esc` | Fechar o painel ou a pesquisa |

---

## Onde estão os meus dados

```
data/osint.db            investigações, ligações, histórico de versões
data/attachments/<id>/   as capturas coladas, arrumadas por investigação
```

Um ficheiro SQLite, nada mais. Copia-o, faz cópia de segurança, mete-o numa pen. `data/` está no
`.gitignore`: as tuas investigações nunca vão parar a um commit por acidente.

Para trabalhar numa base separada (demonstração, testes, compartimentar um caso):

```bash
OSINT_DATA_DIR=/caminho/para/pasta npm run server
```

> Por agora sem cifragem em repouso. Se as tuas investigações são sensíveis, põe `data/` num
> volume cifrado (VeraCrypt, BitLocker, LUKS).

## Uso responsável

Esta ferramenta serve para **organizar** informação que recolheste noutro sítio. Não te dispensa
de nada: a legalidade do que fazes depende do que recolhes, sobre quem e para quê.

Na Europa, agregar dados públicos sobre uma pessoa singular continua a ser um tratamento de dados
pessoais nos termos do RGPD — precisas de uma base legal, de uma finalidade e de um prazo de
conservação. Jornalismo, investigação académica, segurança defensiva, due diligence, um teste de
intrusão autorizado: tudo bem. Assédio, doxxing, vigiar um particular: não, e não é para isso que
este repositório existe.

As capturas desta página mostram uma investigação fictícia.

## Por dentro

| | |
|---|---|
| Interface | React 18 + TypeScript, [React Flow](https://reactflow.dev) para a tela, Zustand |
| Servidor | Express, ~200 linhas, uma API REST |
| Base | `node:sqlite` (integrado no Node 24) — **nenhuma dependência nativa** |
| Build | Vite |

```
server/      API REST + esquema SQLite
src/i18n/    os seis dicionários
src/lib/     tipos de elementos, catálogo de ferramentas, deteção, exportação, disposição
src/         componentes da interface e armazém de estado
```

O servidor também serve `dist/` se existir (`npm run build`), para funcionar numa só porta. A
arquitetura está pronta para ser empacotada como aplicação de secretária (Electron) sem reescrita.

## Limites conhecidos

- Os elementos não se redimensionam à mão.
- Dois separadores abertos na mesma investigação não se sincronizam em direto.
- Testado em Windows com o Chrome; deve funcionar onde o Node 24 funcionar.

## Contribuir

Issues e PR são bem-vindas — em especial novas ferramentas em `src/lib/tools.ts`, novas
plataformas em `src/lib/platforms.ts` e novos idiomas.

**Acrescentar um idioma**: copia `src/i18n/fr.ts`, traduz e declara-o em `src/i18n/langs.ts` e
`src/i18n/current.ts`. O dicionário francês serve de tipo de referência, por isso
`npx tsc --noEmit` recusa uma tradução a que falte uma chave — não te podes esquecer de nenhuma.
Esse comando tem de passar antes de abrires uma PR.

## Licença

MIT — ver [LICENSE](LICENSE).
