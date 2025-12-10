[![npm version](https://img.shields.io/npm/v/@itrocks/action?logo=npm)](https://www.npmjs.org/package/@itrocks/action)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/action)](https://www.npmjs.org/package/@itrocks/action)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/action?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/action)
[![issues](https://img.shields.io/github/issues/itrocks-ts/action)](https://github.com/itrocks-ts/action/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# action

An abstract class for applying actions in your framework, with @Actions and @Need decorators for assignment.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/action
```

## Usage

`@itrocks/action` fournit la brique de base de l'écosystème it.rocks : une
classe `Action` que vous étendez pour implémenter vos propres traitements
backend, ainsi que des décorateurs et helpers pour déclarer quelles actions
sont disponibles sur un objet et de quoi elles ont besoin.

Dans un projet typique, vous combinez :

- des classes de domaine (par exemple `User`),
- des classes d'action qui étendent `Action<User>`,
- le paquet
  [@itrocks/action-request](https://github.com/itrocks-ts/action-request) qui
  construit les `Request<T>` à partir des requêtes HTTP,
- et des modules comme `@itrocks/list`, `@itrocks/edit`, `@itrocks/new`,
  `@itrocks/output`, etc. qui fournissent des actions prêtes à l'emploi.

### Exemple minimal

```ts
import { Action } from '@itrocks/action'
import type { Request } from '@itrocks/action-request'

class User {
  name = ''
}

// Vous créez votre propre action en étendant la classe de base
class Hello extends Action<User> {
  async run (request: Request<User>) {
    const user = await this.getObject(request)
    return this.htmlResponse(`<h1>Hello ${user.name}</h1>`)
  }
}

const hello = new Hello()

// Dans votre routeur / contrôleur HTTP
async function helloRoute (request: Request<User>) {
  return hello.run(request)
}
```

Le `Request<User>` est généralement construit par
[@itrocks/action-request](https://github.com/itrocks-ts/action-request) à
partir d'une requête HTTP (Fastify, Express, …).

### Exemple complet avec décorateurs et actions reliées

L'intérêt principal de `@itrocks/action` est de relier entre elles des
actions cohérentes (liste, éditer, supprimer, …) autour d'un même type
de domaine et de leur fournir l'habillage HTML/CSS correspondant.

```ts
import { Action, Actions, Need, NOTHING, type ActionEntry, getActions, setAction, setActionCss, setActionTemplates } from '@itrocks/action'
import type { Request } from '@itrocks/action-request'

class User {
  id   = 0
  name = ''
}

// Déclare les actions disponibles pour User
@Actions(['list', 'edit', 'delete'])
class UserActions {}

// Exemple d'action concrète : afficher un résumé HTML de l'utilisateur
@Need('object')
class UserSummary extends Action<User> {
  async html (request: Request<User>) {
    const user = await this.getObject(request)
    // Utilitaire fourni par Action pour bâtir une réponse HTML
    return this.htmlResponse(`<p>${user.name}</p>`)
  }
}

// Configuration de l'habillage des actions (souvent fait au démarrage de l'app)
setActionCss(
  { file: '/@itrocks/action/css/(action).css' } // modèle appliqué à toutes les actions
)

setActionTemplates(
  { file: '/@itrocks/action/selectionAction.html' },
  { file: '/@itrocks/action/action.html' }
)

// Relie une action "list" générique à un composant front-end spécifique
setAction('list', 'summary', { target: '#user-summary' })

async function userPage (request: Request<User>) {
  const actions: ActionEntry[] = getActions(User, 'list')
  // `actions` contient maintenant la configuration des actions disponibles
  // pour afficher la page utilisateur (lien, libellé, css, template…)
}
```

## API

### `abstract class Action<T extends object = object>`

Classe de base à étendre pour implémenter vos propres actions métier.
Elle fournit des helpers pour récupérer les objets à partir de la
requête et pour construire des réponses HTML ou JSON.

#### Paramètre de type

- `T` – Type de l'objet métier manipulé par l'action (par exemple `User`).

#### Propriétés

- `actions: ActionEntry[]` – Liste des actions « reliées » récupérées
  via `getActions`. Les modules de plus haut niveau (`@itrocks/list`,
  `@itrocks/edit`, …) l'utilisent pour afficher les boutons / liens
  d'action autour d'une vue.

#### Méthodes

##### `getObject(request: Request<T>): Promise<T>`

Récupère un objet unique associé à la requête.

- Si `request.getObject()` retourne un objet, il est renvoyé.
- Sinon, une nouvelle instance de `request.type` est créée et renvoyée.

Utile dans les actions qui ont besoin d'un objet courant (écran détail,
édition, résumé…).

##### `getObjects(request: Request<T>): Promise<Entity<T>[]>`

Récupère la liste d'objets liée à la requête via `request.getObjects()`.
Principalement utilisé par les actions de type liste.

##### `htmlResponse(body: string, statusCode = 200, headers: Headers = {}): HtmlResponse`

Construit une réponse HTML simple à partir d'une chaîne de caractères.
Vous pouvez l'utiliser si vous rendez vous‑même le HTML dans votre
action :

```ts
return this.htmlResponse('<h1>Done</h1>')
```

##### `htmlTemplateResponse(data: any, request: Request<T>, templateFile: string, statusCode = 200, headers: Headers = {}): Promise<HtmlResponse>`

Construit une réponse HTML basée sur un template. Dans cette
implémentation de base, le `data` est simplement converti en texte, mais
les actions plus haut niveau ou vos sous‑classes peuvent surcharger cette
méthode pour brancher un moteur de templates.

##### `jsonResponse(data: any, statusCode = 200, headers: Headers = {}): JsonResponse`

Construit une réponse JSON standardisée à partir de `data`.

---

### Décorateur `Actions(value?: string[])`

Décorateur de classe permettant de déclarer les actions disponibles pour
un type donné.

- `value` – tableau de chaînes identifiant les actions (ex. `['list', 'edit']`).

Usage typique :

```ts
@Actions(['list', 'edit', 'delete'])
class UserActions {}
```

Les valeurs sont ensuite utilisées par les modules de plus haut niveau
pour construire la barre d'actions d'un objet.

#### `actionsOf(target: ObjectOrType): string[]`

Retourne le tableau des actions déclarées pour une classe ou
une instance décorée avec `@Actions`.

#### `setDefaultActions(actions?: string[]): void`

Définit les actions par défaut appliquées lorsqu'aucune action n'est
explicitement déclarée sur un type.

---

### Décorateur `Need(need: Needs, alternative?: string)`

Décorateur de classe qui indique de quoi une action a besoin pour
fonctionner.

- `need` – valeur de type `Needs` :
  - `NOTHING` – l'action ne nécessite aucun objet ou store ;
  - `'object'` – l'action a besoin d'un objet courant (par exemple un `User` existant) ;
  - `'Store'` – l'action s'appuie sur un store (persistance) pour charger / sauver les données.
- `alternative` – nom d'une action alternative à utiliser si le besoin
  n'est pas satisfait.

Ce décorateur est principalement consommé par les couches supérieures du
framework pour déterminer si une action peut être exécutée dans un
contexte donné.

#### Constante `NOTHING` et type `Needs`

- `NOTHING: ''` – valeur utilitaire à utiliser avec `@Need`.
- `type Needs = '' | 'object' | 'Store'` – union des valeurs possibles
  pour le paramètre `need`.

#### `needOf(target: ObjectOrType): { need: Needs; alternative?: string }`

Retourne la configuration `Need` associée à une classe ou une instance
ayant été décorée avec `@Need`.

---

### Gestionnaire d'actions et ressources

Ces éléments servent à décrire comment une action doit apparaître et
être reliée dans l'interface (texte, cible, css, templates…).

#### Interface `ActionEntry`

```ts
interface ActionEntry {
  [dataKey: string]: any
  action:   string
  caption:  string
  css?:     string
  target:   string
  template: string
}
```

Chaque entrée décrit une action disponible à partir d'une autre action
ou d'un contexte donné.

Propriétés standard :

- `action` – nom technique de l'action cible (ex. `'edit'`, `'delete'`).
- `caption` – libellé affiché à l'utilisateur.
- `css` – chemin vers le fichier CSS associé.
- `target` – sélecteur ou identifiant de cible dans le DOM (`'#'` par défaut).
- `template` – chemin vers le fichier template HTML à utiliser.

#### `actionRepository: Record<string, Record<string, Record<symbol, ActionEntry>>>`

Stockage interne des `ActionEntry` par `sourceAction`, `targetAction` et
type. Vous ne devriez généralement pas le manipuler directement, mais
via les fonctions ci‑dessous.

#### Interface `ActionAsset`

```ts
interface ActionAsset {
  [filter: string]: any
  file: string
}
```

Décrit un fichier CSS ou un template HTML applicable à un ensemble
d'actions.

#### `actionCss: ActionAsset[]`

Tableau des fichiers CSS déclarés pour les actions. Alimenté via
`setActionCss`.

#### `actionTemplates: ActionAsset[]`

Tableau des fichiers template déclarés pour les actions. Alimenté via
`setActionTemplates`.

#### `getActions(source: ObjectOrType, sourceAction: string): ActionEntry[]`

Retourne la liste des `ActionEntry` configurées pour un type ou une
instance (`source`) à partir d'une action donnée (`sourceAction`).

Cette fonction est largement utilisée par les modules `@itrocks/list`,
`@itrocks/edit`, `@itrocks/output`, `@itrocks/user`, etc. pour récupérer
les actions disponibles dans un contexte précis.

#### `setAction(sourceAction: string, targetAction: string, definition?: Partial<ActionEntry>, source?: Type): void`

Déclare une action `targetAction` accessible depuis `sourceAction`.

Paramètres principaux :

- `sourceAction` – action de départ (par ex. `'list'`).
- `targetAction` – action cible (par ex. `'edit'`).
- `definition` – objet partiel pour surcharger `caption`, `css`,
  `target`, `template` ou ajouter des métadonnées personnalisées.
- `source` – type concerné ; si omis, la définition s'applique comme
  valeur par défaut pour tous les types.

#### `setActionCss(...css: ActionAsset[]): void`

Enregistre un ou plusieurs fichiers CSS applicables à des actions.

Si le chemin commence par `/@`, il est automatiquement réécrit pour
pointer vers `node_modules`.

#### `setActionTemplates(...templates: ActionAsset[]): void`

Enregistre un ou plusieurs templates HTML applicables à des actions.

## Typical use cases

- Fournir une classe de base commune pour toutes vos actions backend
  (liste, édition, suppression, export, impression, …).
- Déclarer de manière déclarative quelles actions sont disponibles pour
  un type de domaine donné via `@Actions` et `@Need`.
- Partager entre plusieurs paquets ou projets un même référentiel
  d'actions (CSS, templates, liens) en configurant `setAction*` dans un
  module d'initialisation.
- Intégrer facilement des actions génériques comme
  `@itrocks/list`, `@itrocks/edit`, `@itrocks/new`, `@itrocks/output`,
  `@itrocks/print`, `@itrocks/save`, etc. autour de vos propres types
  métier.
