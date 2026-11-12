# Estimateur de résistance de filets et de vis

Application web statique pour estimer la résistance des filets et des vis selon différents paramètres de matériau, épaisseur, taille de filetage et facteur de sécurité.

## Fonctionnement

- Aucun package ni build requis
- Les fichiers sont chargés avec des chemins relatifs
- Peut être ouverte directement dans un navigateur ou servie localement

## Utilisation locale

### Option 1 : Ouvrir directement

Double-cliquez sur `index.html`.

### Option 2 : Servir localement

Dans le dossier du projet :

```bash
python -m http.server 8000
```

Puis ouvrez :

```text
http://localhost:8000
```

## Prêt pour GitHub

Ce projet est compatible avec GitHub et GitHub Pages car il s’agit d’un site statique sans dépendances.

### Étapes pour publier sur GitHub

1. Initialiser le dépôt Git si ce n’est pas déjà fait
2. Ajouter tous les fichiers
3. Faire un commit
4. Créer un dépôt GitHub
5. Pousser le projet sur GitHub

Exemple :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/VOTRE-REPO.git
git push -u origin main
```

## Déploiement GitHub Pages

Dans GitHub :

1. Ouvrez le dépôt
2. Allez dans Settings > Pages
3. Choisissez la branche `main`
4. Sélectionnez le dossier racine (`/root`)
5. Enregistrez

L’application sera alors accessible via une URL GitHub Pages.

## Fichiers principaux

- `index.html`
- `style.css`
- `script.js`

## Remarque

Le projet utilise des chemins relatifs comme `style.css` et `script.js`, ce qui le rend facilement portable et utilisable sur différents environnements, y compris GitHub Pages.
