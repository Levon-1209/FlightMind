# FlightMind

Assistant de monitoring de vols en temps réel.

## Aperçu

FlightMind permet de suivre les avions présents dans une zone géographique
donnée — actuellement un rectangle au-dessus de la Provence — à partir des
données de position diffusées par les transpondeurs.

Projet personnel en cours de développement, construit pour apprendre le
développement full-stack. La couche conversationnelle est la prochaine étape.

## Architecture

```
[Front React]  →  [API FastAPI]  →  [API OpenSky]
```

Le front appelle uniquement mon API et ne connaît pas la source externe.
L'API interroge OpenSky, normalise les tableaux positionnels en objets nommés
et gère les champs absents.

## Stack

- **Front** : React + TypeScript (Vite)
- **Back** : FastAPI + httpx (Python)
- **Données** : API OpenSky Network
- **LLM** : Mistral (SDK `mistralai`), appel d'outils

## Lancer le projet
Créer un fichier `backend/.env` (ignoré par Git) :

```
MISTRAL_API_KEY=votre_clé
```

### Prérequis

- Python 3.14
- Node 24

### Back-end

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]" httpx mistralai python-dotenv
fastapi dev main.py
```

Disponible sur `http://localhost:8000` — documentation interactive sur `/docs`.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

Disponible sur `http://localhost:5173`.

Les deux services doivent tourner en parallèle.

## Choix techniques

### Assistant conversationnel

L'utilisateur pose sa question en langage naturel. Le modèle reçoit la
description des outils disponibles et répond soit par du texte, soit par
un appel de fonction avec ses arguments. Le serveur exécute l'outil,
ajoute le résultat à l'historique et relance le modèle, jusqu'à obtenir
une réponse rédigée.

Le modèle n'exécute rien lui-même et n'a aucune mémoire entre deux appels :
c'est le serveur qui conserve l'historique et le renvoie intégralement à
chaque tour.

# Pourquoi pas de framework d'orchestration ?

Je voulais comprendre le mécanisme avant de l'abstraire. Écrire la boucle
à la main rend visible ce qu'un framework masque : le modèle n'exécute rien,
l'historique est reconstruit et renvoyé à chaque tour, un appel d'outil n'est
qu'un JSON dans une réponse.

Le besoin actuel est simple — un seul outil, un flux linéaire — et tient en
une vingtaine de lignes. LangChain et LangGraph résolvent des cas que je n'ai
pas encore : branchements conditionnels, sous-agents, reprise sur erreur,
exécution parallèle.

Coût : quand les outils se multiplieront et que le flux se ramifiera, cette
boucle deviendra plus coûteuse à maintenir qu'un framework. Le choix vaut
pour l'état actuel du projet, pas définitivement.


La boucle est bornée à cinq tours pour éviter qu'un modèle qui rappelle
indéfiniment le même outil ne bloque la requête.

Coût : la conversion mètres/pieds existe à deux endroits, dans le front et
dans le prompt système. La déplacer dans `fetch_flights` supprimerait la
duplication mais ferait perdre l'unité brute de la source.

### Pourquoi un back-end ?

La première version appelait l'API d'OpenSky depuis le navigateur. Le navigateur
a bloqué la lecture de la réponse : OpenSky n'autorise pas les appels venant
d'une page web tierce. La requête aboutissait — statut 200 — mais le contenu
était rejeté avant d'arriver au JavaScript.

Cette restriction ne s'applique pas aux serveurs. Le back-end joue donc le rôle
d'intermédiaire entre l'API d'OpenSky et le front.

Ce choix prépare deux besoins à venir : héberger la clé d'API d'un LLM, et
mettre en cache les réponses d'OpenSky, dont le quota est limité. Son coût :
deux services à lancer et à déployer au lieu d'un.

### Représentation des données manquantes

L'API renvoie `null` quand l'altitude est absente et transmet cette valeur
telle quelle. La conversion en texte lisible se fait côté front.

`null` est une donnée, « No Data » est du texte d'affichage. En envoyant du
texte depuis l'API, on perd la possibilité de trier ou filtrer par altitude,
puisque les chaînes se mélangent aux nombres.

Coût : chaque consommateur de l'API doit traiter le cas de son côté.

### Unités d'altitude

L'API expose l'altitude en mètres, l'unité fournie par OpenSky. Le front
convertit en pieds à l'affichage, unité de référence en aviation.

Conséquence : ajouter un sélecteur d'unités ne toucherait que le front.

### Identifiant des vols

Le callsign servait initialement de clé React. Plusieurs appareils n'en
transmettent pas, et tous ces vols recevaient donc la même valeur — React
signalait des clés dupliquées.

L'icao24, adresse unique du transpondeur, sert désormais de clé. Le callsign
reste affiché, car c'est lui qui est lisible par un humain.

## Limites connues

- Pas de cache : dépendance directe au quota de l'API OpenSky
- Zone géographique codée en dur
- Aucun test automatisé

## Prochaines étapes

- Couche conversationnelle : agent LLM avec appel d'outils sur les données de vols
- Persistance en base (SQLite) et mise en cache des réponses OpenSky
- Conteneurisation Docker et déploiement
- Aucune persistance : l'historique de conversation est perdu à chaque requête
- Coût en tokens non maîtrisé : tous les vols de la zone sont envoyés au modèle
- Le respect du format de réponse repose sur le prompt, sans garantie stricte