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

## Lancer le projet

### Prérequis

- Python 3.14
- Node 24

### Back-end

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]" httpx
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