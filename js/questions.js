/* BANQUE DE QUESTIONS — fichier modifiable par l'enseignant.
   th : thème  G = lecture graphique, D = dérivée, E = équation f(x) = 0
   d  : difficulté 1, 2 ou 3
   f  : famille (une question ratée fait revenir une question de la même famille)
   q  : énoncé            a : 3 réponses, LA PREMIÈRE EST TOUJOURS LA BONNE
   e  : explication       g : [a,b,c,d] pour tracer ax³+bx²+cx+d (facultatif)
   xr : intervalle des x  m : points mis en évidence dans la correction (facultatif)
   hl : valeur c de la droite y = c tracée dans la correction (facultatif)
   tv : tableau de variations { x:[abscisses], f:[valeurs] } (facultatif)
   IMPORTANT : ajoutez les nouvelles questions À LA FIN de la liste et ne supprimez
   jamais une question (remplacez-la) : les codes défi et la sauvegarde repèrent
   les questions par leur position.
   Pour vérifier la banque après une modification : ouvrez le jeu avec #test
   à la fin de l'adresse (exemple : .../moto-maths/#test). */
export const THEME_NAMES = { G: 'Lecture graphique', D: 'Dérivée et variations', E: 'Équation f(x) = 0' };

const C1 = [1, 0, -3, 0], X1 = [-2.3, 2.3];     // x³ − 3x
const C2 = [-1, 3, 0, 0], X2 = [-1.2, 3.6];     // −x³ + 3x²
const C3 = [1, 0, 0, 0], X3 = [-1.8, 1.8];      // x³
const C4 = [1, -3, 0, 2], X4 = [-1.3, 3.3];     // x³ − 3x² + 2
const C5 = [-1, 0, 3, 0], X5 = [-2.3, 2.3];     // −x³ + 3x
const C7 = [-1, 0, 0, 0], X7 = [-1.8, 1.8];     // −x³
const C8 = [1, 0, 1, 0], X8 = [-1.6, 1.6];      // x³ + x
const C9 = [2, -3, 0, 0], X9 = [-0.8, 1.8];     // 2x³ − 3x²
const C10 = [1, 0, -3, 2], X10 = [-2.5, 2.2];   // x³ − 3x + 2
const C11 = [1, 0, -3, 4], X11 = [-2.6, 2.2];   // x³ − 3x + 4
const TV1 = { x: ['−2', '−1', '1', '2'], f: ['−2', '2', '−2', '2'] };   // x³ − 3x sur [−2 ; 2]
const TV2 = { x: ['−1', '0', '1', '2'], f: ['−5', '0', '−1', '4'] };    // 2x³ − 3x² sur [−1 ; 2]
const TV3 = { x: ['−1', '0', '2', '3'], f: ['−2', '2', '−2', '2'] };    // x³ − 3x² + 2 sur [−1 ; 3]

export const BANK = [
/* ---------- LECTURE GRAPHIQUE ---------- */
{th:'G',d:1,f:'Gvar',g:C1,xr:X1,m:[[-1,2],[1,-2]],q:"f est croissante sur…",a:["]−∞ ; −1] et [1 ; +∞[","[−1 ; 1]","ℝ tout entier"],e:"La courbe monte avant x = −1, descend entre −1 et 1, puis remonte."},
{th:'G',d:1,f:'Gext',g:C1,xr:X1,m:[[-1,2]],q:"Le maximum local de f est atteint en…",a:["x = −1","x = 1","x = 2"],e:"Le sommet de la bosse est en x = −1. Attention : 2 est la valeur du maximum, pas l'endroit."},
{th:'G',d:1,f:'Gext',g:C2,xr:X2,m:[[0,0],[2,4]],q:"Combien f a-t-elle d'extremums locaux ?",a:["2","1","3"],e:"Un creux en x = 0 (minimum) et une bosse en x = 2 (maximum)."},
{th:'G',d:1,f:'Gvar',g:C3,xr:X3,q:"La fonction f est…",a:["Croissante sur ℝ","Décroissante sur ℝ","Croissante puis décroissante"],e:"La courbe monte toujours de gauche à droite."},
{th:'G',d:2,f:'Gext',g:C1,xr:X1,m:[[1,-2]],q:"Le minimum local de f vaut…",a:["−2","1","2"],e:"Le creux est au point (1 ; −2) : il est atteint en x = 1 et il vaut −2."},
{th:'G',d:2,f:'Gvar',g:C2,xr:X2,m:[[0,0],[2,4]],q:"f est décroissante sur…",a:["]−∞ ; 0] et [2 ; +∞[","[0 ; 2]","[2 ; +∞[ seulement"],e:"La courbe descend avant x = 0 et après x = 2."},
{th:'G',d:2,f:'Gtab',q:"f′ est négative sur [−1 ; 2] et positive ailleurs. f a un minimum local en…",a:["x = 2","x = −1","x = 0"],e:"f décroît sur [−1 ; 2] puis croît : le minimum est en x = 2, où f′ passe de − à +."},
{th:'G',d:3,f:'Gtab',g:C4,xr:X4,m:[[0,2],[2,-2]],q:"Les variations de f sont…",a:["↗ puis ↘ puis ↗","↘ puis ↗ puis ↘","↗ seulement"],e:"f croît jusqu'en x = 0, décroît jusqu'en x = 2, puis croît à nouveau."},
{th:'G',d:1,f:'Gval',g:C1,xr:X1,m:[[1,-2]],q:"Lis l'image de 1 : f(1) = …",a:["−2","2","1"],e:"On part de x = 1 et on rejoint la courbe : on lit y = −2."},
{th:'G',d:1,f:'Gval',g:C2,xr:X2,m:[[2,4]],q:"Lis sur la courbe : f(2) = …",a:["4","2","0"],e:"Le point de la courbe d'abscisse 2 a pour ordonnée 4."},
{th:'G',d:1,f:'Gvar',g:C7,xr:X7,q:"La fonction f est…",a:["Décroissante sur ℝ","Croissante sur ℝ","Décroissante puis croissante"],e:"La courbe descend toujours de gauche à droite."},
{th:'G',d:2,f:'Gext',g:C4,xr:X4,m:[[0,2]],q:"Le maximum local de f vaut…",a:["2","0","−2"],e:"La bosse est au point (0 ; 2) : le maximum local vaut 2 (et il est atteint en x = 0)."},
{th:'G',d:2,f:'Gext',g:C5,xr:X5,m:[[-1,-2]],q:"f atteint son minimum local en…",a:["x = −1","x = 1","x = −2"],e:"Le creux est au point (−1 ; −2) : il est atteint en x = −1."},
{th:'G',d:2,f:'Gval',g:C4,xr:X4,m:[[0,2]],q:"Lis l'ordonnée à l'origine : f(0) = …",a:["2","0","−2"],e:"La courbe coupe l'axe vertical en y = 2."},
{th:'G',d:2,f:'Gtab',g:C1,xr:X1,m:[[-1,2],[1,-2]],q:"Sur [−1 ; 1], le signe de f′(x) est…",a:["Négatif : f décroît","Positif : f croît","Nul partout"],e:"Entre −1 et 1 la courbe descend, donc la dérivée est négative."},
{th:'G',d:3,f:'Gtab',g:C2,xr:X2,m:[[0,0],[2,4]],q:"Sur quel intervalle a-t-on f′(x) ≥ 0 ?",a:["[0 ; 2]","]−∞ ; 0]","[2 ; +∞["],e:"f′ est positive là où la courbe monte : entre x = 0 et x = 2."},
{th:'G',d:3,f:'Gext',g:C9,xr:X9,m:[[1,-1]],q:"Le minimum local de f est le point…",a:["(1 ; −1)","(−1 ; 1)","(0 ; 0)"],e:"Le creux est en x = 1 et vaut −1. On écrit toujours (abscisse ; ordonnée)."},
{th:'G',d:3,f:'Gvar',g:C5,xr:X5,m:[[-1,-2],[1,2]],q:"f est croissante sur…",a:["[−1 ; 1]","]−∞ ; −1] et [1 ; +∞[","[−2 ; 2]"],e:"La courbe monte seulement entre le creux (x = −1) et la bosse (x = 1)."},
{th:'G',d:3,f:'Gval',g:C1,xr:X1,m:[[-1,2],[2,2]],q:"Sur [−2 ; 2], la plus grande valeur de f est…",a:["2","−1","1"],e:"Le point le plus haut sur [−2 ; 2] a pour ordonnée 2 (atteinte en x = −1 et en x = 2)."},
{th:'G',d:2,f:'Gvar',g:C8,xr:X8,q:"f change-t-elle de sens de variation ?",a:["Non : toujours croissante","Oui : une fois","Oui : deux fois"],e:"La courbe monte sans jamais redescendre : pas de bosse ni de creux."},
{th:'G',d:3,f:'Gext',g:C2,xr:[0,3.2],m:[[2,4]],q:"Bénéfice B(x) en k€ pour x centaines d'objets. Il est maximal pour x = …",a:["2","4","3"],e:"Le sommet est au point (2 ; 4) : bénéfice maximal de 4 k€ pour x = 2."},
{th:'G',d:1,f:'Gext',g:C5,xr:X5,m:[[1,2]],q:"Le maximum local de f vaut…",a:["2","1","−2"],e:"La bosse est au point (1 ; 2) : le maximum local vaut 2."},
/* ---------- DÉRIVÉE ET VARIATIONS ---------- */
{th:'D',d:1,f:'Dcalc',q:"f(x) = x³. Alors f′(x) = …",a:["3x²","x²","3x"],e:"La dérivée de x³ est 3x² : l'exposant descend devant et baisse de 1."},
{th:'D',d:1,f:'Dcalc',q:"f(x) = 2x³ + 5x. Alors f′(x) = …",a:["6x² + 5","6x² + 5x","2x² + 5"],e:"(2x³)′ = 2 × 3x² = 6x² et (5x)′ = 5."},
{th:'D',d:2,f:'Dcalc',q:"f(x) = x³ − 3x². Alors f′(x) = …",a:["3x² − 6x","3x² − 3x","x² − 6x"],e:"(x³)′ = 3x² et (−3x²)′ = −3 × 2x = −6x."},
{th:'D',d:2,f:'Dcalc',q:"f(x) = x³ + 2x² − 4x + 1. Alors f′(x) = …",a:["3x² + 4x − 4","3x² + 4x − 3","3x² + 2x − 4"],e:"On dérive terme à terme : 3x², puis 4x, puis −4. La constante 1 disparaît."},
{th:'D',d:1,f:'Dsign',q:"Si f′(x) > 0 sur [1 ; 3], alors f est…",a:["Croissante sur [1 ; 3]","Décroissante sur [1 ; 3]","Constante sur [1 ; 3]"],e:"Dérivée positive = fonction croissante."},
{th:'D',d:2,f:'Dsign',q:"f′(x) = 3x². Le signe de f′ sur ℝ est…",a:["Toujours positif ou nul","Positif seulement si x > 0","Toujours négatif"],e:"Un carré est toujours positif ou nul, même si x est négatif."},
{th:'D',d:2,f:'Dzero',q:"f′(x) = 3(x − 1)(x + 2). f′ s'annule en…",a:["x = 1 et x = −2","x = −1 et x = 2","x = 3 et x = 1"],e:"Un produit est nul si un facteur est nul : x − 1 = 0 ou x + 2 = 0."},
{th:'D',d:3,f:'Dsign',q:"f′(x) = 3(x − 1)(x + 2). f est décroissante sur…",a:["[−2 ; 1]","]−∞ ; −2]","[1 ; +∞["],e:"f′ est négative entre ses racines −2 et 1, donc f décroît sur [−2 ; 1]."},
{th:'D',d:2,f:'Dcalc',q:"f(x) = −x³ + 3x. Alors f′(x) = …",a:["−3x² + 3","3x² + 3","−3x² + 3x"],e:"(−x³)′ = −3x² (le signe moins reste) et (3x)′ = 3."},
{th:'D',d:3,f:'Dext',q:"En un maximum local, la dérivée f′…",a:["S'annule en passant de + à −","S'annule en passant de − à +","Reste strictement positive"],e:"f monte (f′ > 0) puis descend (f′ < 0) : f′ passe de + à −."},
{th:'D',d:1,f:'Dcalc',q:"f(x) = 7. Alors f′(x) = …",a:["0","7","1"],e:"Une constante ne varie pas : sa dérivée est 0."},
{th:'D',d:1,f:'Dcalc',q:"f(x) = 5x². Alors f′(x) = …",a:["10x","5x","10x²"],e:"(x²)′ = 2x, donc (5x²)′ = 5 × 2x = 10x."},
{th:'D',d:1,f:'Dcalc',q:"f(x) = 4x − 3. Alors f′(x) = …",a:["4","4x","−3"],e:"(4x)′ = 4 et la constante −3 a pour dérivée 0."},
{th:'D',d:1,f:'Dsign',q:"Si f′(x) < 0 sur [0 ; 2], alors f est…",a:["Décroissante sur [0 ; 2]","Croissante sur [0 ; 2]","Négative sur [0 ; 2]"],e:"Dérivée négative = fonction décroissante. Cela ne dit rien du signe de f."},
{th:'D',d:2,f:'Dcalc',q:"f(x) = 2x³ − 6x² + 1. Alors f′(x) = …",a:["6x² − 12x","6x² − 12x + 1","2x² − 12x"],e:"(2x³)′ = 6x², (−6x²)′ = −12x et la constante 1 disparaît."},
{th:'D',d:2,f:'Dzero',q:"f′(x) = 3x² − 12. f′ s'annule en…",a:["x = −2 et x = 2","x = 4 seulement","x = 2 seulement"],e:"3x² = 12 donne x² = 4, donc x = 2 ou x = −2."},
{th:'D',d:2,f:'Dcalc',q:"f(x) = x³. Le nombre dérivé f′(2) vaut…",a:["12","8","6"],e:"f′(x) = 3x², donc f′(2) = 3 × 2² = 12. (8, c'est f(2).)"},
{th:'D',d:3,f:'Dzero',q:"f(x) = x³ − 3x. f′(x) = 0 pour…",a:["x = −1 et x = 1","x = 0 et x = 3","x = 3 seulement"],e:"f′(x) = 3x² − 3. 3x² = 3 donne x² = 1, donc x = 1 ou x = −1."},
{th:'D',d:3,f:'Dext',q:"f′(x) = 3x(x − 2). f admet un minimum local en…",a:["x = 2","x = 0","x = 1"],e:"f′ est négative entre 0 et 2, positive après 2 : f descend puis remonte en x = 2."},
{th:'D',d:3,f:'Dsign',q:"f′(x) = −3x² − 1. Alors f est…",a:["Décroissante sur ℝ","Croissante sur ℝ","Décroissante puis croissante"],e:"−3x² − 1 est toujours négatif, donc f décroît partout."},
{th:'D',d:2,f:'Dext',q:"f′ s'annule en x = 3 en changeant de signe. En x = 3, f admet…",a:["Un extremum local","Une racine","Rien de particulier"],e:"Quand f′ s'annule en changeant de signe, f a un maximum ou un minimum local."},
{th:'D',d:3,f:'Dcalc',q:"Coût C(x) = x³ − 6x² + 15x (en k€). Alors C′(x) = …",a:["3x² − 12x + 15","3x² − 6x + 15","x² − 12x + 15"],e:"(x³)′ = 3x², (−6x²)′ = −12x et (15x)′ = 15."},
{th:'D',d:3,f:'Dcalc',q:"f(x) = x³ − 3x. Le nombre dérivé f′(1) vaut…",a:["0","−2","3"],e:"f′(x) = 3x² − 3, donc f′(1) = 0 : la tangente est horizontale. (−2, c'est f(1).)"},
{th:'D',d:1,f:'Dsign',q:"Le signe de f′ permet de connaître…",a:["Les variations de f","Le signe de f","Les racines de f"],e:"f′ positive : f croît. f′ négative : f décroît."},
/* ---------- ÉQUATION f(x) = 0 ---------- */
{th:'E',d:1,f:'Ever',q:"Une solution de x³ − 1 = 0 est…",a:["x = 1","x = −1","x = 0"],e:"1³ − 1 = 0, donc x = 1 est solution."},
{th:'E',d:2,f:'Efact',q:"f(x) = x(x − 2)(x + 2). Les solutions de f(x) = 0 sont…",a:["−2 ; 0 et 2","0 et 2 seulement","−2 et 2 seulement"],e:"Un produit est nul si un facteur est nul : x = 0, x = 2 ou x = −2."},
{th:'E',d:2,f:'Ever',q:"f(x) = x³ + 2x² + x. Que vaut f(−1) ?",a:["0","2","−4"],e:"f(−1) = −1 + 2 − 1 = 0 : −1 est donc une solution de f(x) = 0."},
{th:'E',d:3,f:'Enb',q:"f(x) = (x − 2)(x² + 1). Combien de solutions pour f(x) = 0 ?",a:["1","2","3"],e:"x² + 1 est toujours positif, il ne s'annule jamais. Seule solution : x = 2."},
{th:'E',d:1,f:'Ever',q:"La solution de x³ + 1 = 0 est…",a:["x = −1","x = 1","x = 0"],e:"(−1)³ + 1 = −1 + 1 = 0."},
{th:'E',d:2,f:'Egraph',g:C1,xr:X1,m:[[0,0]],q:"D'après la courbe, f(x) = 0 a…",a:["3 solutions","1 solution","2 solutions"],e:"La courbe coupe l'axe des abscisses en 3 points."},
{th:'E',d:1,f:'Enb',q:"Une équation de degré 3 a au maximum…",a:["3 solutions","2 solutions","Une infinité de solutions"],e:"Une équation de degré 3 a au plus 3 solutions."},
{th:'E',d:1,f:'Egraph',q:"Résoudre f(x) = 0 sur un graphique, c'est chercher…",a:["Où la courbe coupe l'axe des abscisses","Où la courbe coupe l'axe des ordonnées","Le sommet de la courbe"],e:"f(x) = 0 quand le point de la courbe est sur l'axe horizontal."},
{th:'E',d:1,f:'Ever',q:"L'équation x³ = 8 a pour solution…",a:["x = 2","x = 4","x = 8/3"],e:"2 × 2 × 2 = 8, donc x = 2. On ne divise pas par 3 !"},
{th:'E',d:2,f:'Efact',q:"(x − 3)(x + 1)(x − 5) = 0. Les solutions sont…",a:["−1 ; 3 et 5","−5 ; −3 et 1","3 et 5 seulement"],e:"Chaque facteur donne une solution : x = 3, x = −1 et x = 5."},
{th:'E',d:2,f:'Egraph',g:C2,xr:X2,m:[[0,0],[3,0]],q:"D'après la courbe, f(x) = 0 pour…",a:["x = 0 et x = 3","x = 0 et x = 2","x = 3 seulement"],e:"La courbe touche l'axe horizontal en x = 0 et le coupe en x = 3."},
{th:'E',d:2,f:'Egraph',g:C10,xr:X10,m:[[-2,0],[1,0]],q:"Combien de solutions pour f(x) = 0 ?",a:["2","3","1"],e:"La courbe coupe l'axe en x = −2 et le touche en x = 1 : 2 solutions."},
{th:'E',d:2,f:'Ever',q:"f(x) = x³ − 4x. Quel nombre vérifie f(x) = 0 ?",a:["2","1","4"],e:"f(2) = 8 − 8 = 0. (f(1) = −3 et f(4) = 48.)"},
{th:'E',d:3,f:'Egraph',g:C1,xr:X1,m:[[-1,2],[2,2]],hl:2,q:"Combien de solutions pour f(x) = 2 ?",a:["2","3","1"],e:"La droite horizontale y = 2 touche la courbe en x = −1 et la coupe en x = 2."},
{th:'E',d:3,f:'Egraph',g:C1,xr:X1,hl:4,q:"Combien de solutions pour f(x) = 4 ?",a:["1","3","0"],e:"La droite y = 4 passe au-dessus de la bosse : elle ne coupe la courbe qu'une fois, à droite."},
{th:'E',d:3,f:'Egraph',g:C11,xr:X11,m:[[1,2]],q:"D'après la courbe, f(x) = 0 a…",a:["1 solution","3 solutions","Aucune solution"],e:"Le creux reste au-dessus de l'axe (minimum 2) : la courbe ne coupe l'axe qu'une fois, à gauche."},
{th:'E',d:2,f:'Egraph',g:C4,xr:X4,m:[[1,0]],q:"Une solution de f(x) = 0 est…",a:["x = 1","x = 2","x = 0"],e:"La courbe coupe l'axe horizontal en x = 1."},
{th:'E',d:3,f:'Efact',q:"x(x − 4)² = 0. Les solutions sont…",a:["0 et 4","0 ; 4 et −4","4 seulement"],e:"x = 0 ou x − 4 = 0. Le carré ne crée pas de solution −4."},
{th:'E',d:3,f:'Egraph',g:C2,xr:X2,m:[[-1,4],[2,4]],hl:4,q:"Résous graphiquement f(x) = 4.",a:["x = −1 et x = 2","x = 2 seulement","x = 0 et x = 3"],e:"La droite y = 4 rencontre la courbe en x = −1 et en x = 2."},
{th:'E',d:3,f:'Efact',q:"Bénéfice B(x) = −x²(x − 3). Il est nul pour x = 0 et pour…",a:["x = 3","x = 2","x = −3"],e:"Un produit est nul si un facteur est nul : x − 3 = 0 donne x = 3."},
{th:'E',d:1,f:'Egraph',g:C3,xr:X3,m:[[0,0]],q:"D'après la courbe, f(x) = 0 pour…",a:["x = 0","x = 1","Aucune valeur"],e:"La courbe coupe l'axe horizontal à l'origine, en x = 0."},
{th:'E',d:2,f:'Ever',q:"Volume d'un cube : V = x³ (en cm³). Si V = 27, l'arête x mesure…",a:["3 cm","9 cm","13,5 cm"],e:"3 × 3 × 3 = 27, donc x = 3 cm."},
/* ---------- AJOUTS : fonction cube, tableau de variations, balayage, trajectoire ---------- */
{th:'D',d:3,f:'Dext',g:C3,xr:X3,m:[[0,0]],q:"f(x) = x³ et f′(0) = 0. f a-t-elle un extremum en x = 0 ?",a:["Non : f′ ne change pas de signe","Oui : un minimum","Oui : un maximum"],e:"f′(x) = 3x² est positive avant et après 0 : f reste croissante. f′ s'annule sans changer de signe, donc pas d'extremum."},
{th:'G',d:1,f:'Gval',q:"Fonction cube : f(x) = x³. f(−2) = …",a:["−8","8","−6"],e:"(−2)³ = (−2) × (−2) × (−2) = −8. Ce n'est pas −2 × 3."},
{th:'E',d:2,f:'Etab',tv:TV1,q:"D'après le tableau, combien de solutions pour f(x) = 0 sur [−2 ; 2] ?",a:["3","2","1"],e:"f passe de −2 à 2, puis de 2 à −2, puis de −2 à 2 : sur chaque partie, elle prend une fois la valeur 0."},
{th:'E',d:3,f:'Etab',tv:TV1,q:"D'après le tableau, combien de solutions pour f(x) = 3 sur [−2 ; 2] ?",a:["Aucune","1","3"],e:"Sur [−2 ; 2], la plus grande valeur de f est 2 : f ne peut jamais valoir 3."},
{th:'D',d:2,f:'Dtab',tv:TV2,q:"D'après le tableau, f admet un minimum local en…",a:["x = 1","x = −1","x = 0"],e:"La flèche descend jusqu'en x = 1 puis remonte : minimum local en x = 1, qui vaut f(1) = −1. Ne confonds pas l'abscisse 1 et la valeur −1."},
{th:'E',d:3,f:'Etab',tv:TV3,q:"D'après le tableau, combien de solutions pour f(x) = −2 sur [−1 ; 3] ?",a:["2","3","1"],e:"f vaut −2 en x = −1 et en x = 2 (valeurs du tableau). Partout ailleurs, f est au-dessus de −2."},
{th:'E',d:2,f:'Ebal',q:"f(x) = x³ + x − 1. Balayage : f(0,6) ≈ −0,18 et f(0,7) ≈ 0,04. La solution de f(x) = 0 est entre…",a:["0,6 et 0,7","0 et 0,6","0,7 et 1"],e:"f(0,6) est négatif et f(0,7) est positif : f passe par 0 entre 0,6 et 0,7."},
{th:'E',d:3,f:'Ebal',q:"f(x) = x³ − 3x + 1. Balayage : f(0,3) ≈ 0,13 et f(0,4) ≈ −0,14. Une solution de f(x) = 0 est entre…",a:["0,3 et 0,4","0,4 et 0,5","0 et 0,3"],e:"f change de signe entre 0,3 et 0,4 : elle s'annule entre ces deux valeurs."},
{th:'G',d:2,f:'Gext',g:C2,xr:[0,3.2],m:[[2,4]],q:"Un drone vole à la hauteur h(t) = −t³ + 3t² (h en m, t en s). Il est au plus haut à t = …",a:["2 s","4 s","3 s"],e:"Le sommet de la courbe est au point (2 ; 4) : hauteur maximale de 4 m, atteinte à t = 2 s."}
];
