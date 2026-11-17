# Super Moto Maths — version 3

## Nouveautés

### 1. Trois modes de vitesse
Avant de lancer un circuit, l'élève choisit son rythme :

| Mode | Plage de vitesse | Croisière de départ |
|---|---|---|
| Débutant | 60 à 89 km/h (moins de 90) | 72 km/h |
| Intermédiaire | 90 à 140 km/h | 108 km/h |
| Confirmé | 141 à 220 km/h (plus de 140) | 168 km/h |

- La vitesse ne peut jamais sortir de la plage du mode : c'est une garantie, pas une indication.
- Le mode fixe aussi le **niveau de départ** des questions (1 pour Débutant, 2 pour Intermédiaire,
  3 pour Confirmé). La difficulté adaptative du jeu continue ensuite de monter ou de descendre librement.
- Chaque circuit conserve un palmarès **par mode** : 4 circuits × 3 modes = 12 progressions
  indépendantes au lieu de 4 (étoiles et record séparés).
- Le duel et les défis par code se jouent en **Intermédiaire**, avec la vitesse verrouillée
  (les deux joueurs doivent avoir exactement les mêmes conditions).

### 2. Réglage de la vitesse au clavier
- **↑ / ↓** : augmentent ou diminuent la vitesse de croisière de 5 km/h, dans la limite du mode.
- **← / →** : changement de voie (inchangé).
- **Espace / Entrée** : valider la voie choisie (l'ancienne touche ↑).
- **1 / 2 / 3** : choisir directement le portail A, B ou C.
- **P / Échap** : pause.
- En duel, les flèches restent réservées au joueur 2 ; Q / D / Z pour le joueur 1.
- Le menu pause rappelle le mode et la vitesse de croisière en cours.

Le principe pédagogique est conservé : la vitesse de croisière est choisie par l'élève, mais une
bonne réponse donne une **accélération** de 15 km/h pendant 1,5 s et une erreur un **freinage** de
35 km/h. Bien répondre reste donc le meilleur moyen de rouler vite.

## Détails techniques

- `js/game.js` : nouvelle constante exportée `MODES`, régulateur de vitesse
  (`cruise` / `speed` / `push`), action `throttle()`, bornes `vmin` / `vcap` par joueur.
  Règle de vitesse : `speed` suit `croisière + effet de la dernière réponse`, borné par la plage du mode.
- `js/store.js` : palmarès `circ[i] = { D:{s,b}, I:{s,b}, C:{s,b} }`, migration automatique de
  l'ancien format `{s,b}` (la progression existante est conservée dans le mode Intermédiaire),
  nouvelle fonction `bestOf()`, `S.mode` mémorise le dernier mode choisi, bilan signé mentionnant le mode.
- `js/main.js` : écran de choix du mode, HUD, enregistrement des records par mode, nouvelles touches.
- `js/scene.js` : l'ouverture du champ de vision suit la place du pilote dans **sa** plage de vitesse.
- `css/style.css` : styles `.modebtn`, `.dot`, `.band`.
- `sw.js` : cache passé en `v3` (indispensable : sinon les appareils déjà installés gardent l'ancienne version).

## Compatibilité

- Les sauvegardes existantes sont migrées automatiquement, sans perte.
- **Les codes défi déjà distribués aux élèves restent valides** (format inchangé).
- Les codes de transfert `SMM-…` du nouveau format sont relus par la version 3.

## Vérifications effectuées

- Course complète de 10 questions dans les 3 modes : vitesse toujours dans la plage (60,1–89,0 /
  90,4–139,8 / 144,2–207,4 km/h), 10 questions jouées, 3 étoiles, plafond de vitesse respecté.
- Réglage manuel : plafond et plancher respectés dans chaque mode, ↑ et ↓ n'engagent pas de voie.
- Duel : vitesse verrouillée, mode Intermédiaire imposé.
- Migration : ancienne sauvegarde `{s,b}` → palmarès `{D,I,C}`, XP et statistiques de thèmes intacts.
- Bilan : signature vérifiée, texte retouché détecté, aller-retour export/import, code falsifié rejeté.
- Démarrage réel de l'application vérifié dans un navigateur (aucune erreur, service worker actif).

Non vérifié automatiquement : le rendu 3D en course et le ressenti de conduite (à tester sur un
appareil réel, notamment la tablette de classe).

## Mise en ligne

1. Remplacer les fichiers du dépôt par ceux de cette archive.
2. `git add -A && git commit -m "Modes de vitesse + réglage clavier" && git push`
3. GitHub Pages sert la nouvelle version sous une minute. Le `sw.js` en `v3` fait basculer les
   appareils déjà installés au prochain lancement avec connexion.
