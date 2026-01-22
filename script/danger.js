/* ===================== CONFIGURATION ET VARIABLES ===================== */
const gameZone = document.getElementById("game-zone");
const startBtn = document.getElementById("start-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const overlay = document.getElementById("overlay");
const finalScoreDisplay = document.getElementById("final-score");

// Variables de contrôle du jeu
let score = 0;           // Score du joueur
let gameActive = false;  // État du jeu
let moveInterval = null; // Intervalle pour le déplacement des cibles

// SVG cible - Il est injecté dynamiquement dans chaque cible créé 
const cibleSVG = `<svg width="100" height="100" viewBox="0 0 2016 2016" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="1008" cy="1008" r="933" fill="#D9D9D9"/>
<circle cx="1008" cy="1008" r="933" stroke="black" stroke-width="150"/>
<circle cx="1008" cy="1008" r="933" stroke="black" stroke-width="150"/>
<circle cx="1008" cy="1008" r="933" stroke="#B50606" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="604.5" fill="#D9D9D9"/>
<circle cx="1007.5" cy="1008.5" r="604.5" stroke="black" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="604.5" stroke="black" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="604.5" stroke="#B50606" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="264.5" fill="#D9D9D9"/>
<circle cx="1007.5" cy="1008.5" r="264.5" stroke="black" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="264.5" stroke="black" stroke-width="150"/>
<circle cx="1007.5" cy="1008.5" r="264.5" stroke="#B50606" stroke-width="150"/>
</svg>`;

// SVG tache - SVG utilisé comme effet visuel lors d’un clic réussi 
const splatSVGString = `
    <?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="100pt" height="100pt" viewBox="0 0 1280.000000 1202.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.15, written by Peter Selinger 2001-2017
</metadata>
<g transform="translate(0.000000,1202.000000) scale(0.100000,-0.100000)"
fill="#E02424" stroke="none">
<path d="M7355 12005 c-248 -54 -425 -237 -495 -510 -57 -219 -24 -641 79
-1044 27 -102 71 -274 99 -381 55 -214 76 -328 92 -495 45 -493 -60 -892 -293
-1112 -177 -167 -398 -234 -708 -212 -288 20 -495 108 -680 289 -192 189 -283
363 -476 919 -47 135 -106 293 -132 351 -147 330 -336 480 -603 480 -109 0
-165 -19 -231 -80 -101 -93 -143 -214 -133 -385 11 -189 70 -348 189 -505 83
-109 176 -198 410 -389 361 -296 456 -434 457 -666 0 -172 -39 -275 -147 -381
-101 -101 -265 -174 -486 -219 -159 -31 -334 -50 -647 -70 -590 -37 -774 -77
-865 -189 -28 -35 -30 -44 -30 -119 0 -101 22 -151 104 -239 72 -78 164 -148
401 -303 243 -159 336 -229 430 -324 88 -89 145 -171 179 -261 24 -60 26 -77
25 -215 -1 -132 -4 -161 -28 -238 -123 -410 -455 -609 -1181 -711 -60 -9 -220
-27 -355 -41 -135 -14 -299 -33 -365 -41 -459 -57 -680 -150 -772 -325 -26
-49 -28 -63 -28 -159 0 -90 3 -111 23 -147 48 -91 126 -144 269 -185 67 -19
102 -23 238 -22 223 0 305 23 744 210 307 132 475 194 621 233 210 55 287 65
505 65 174 0 212 -2 289 -22 254 -64 425 -191 522 -387 60 -124 77 -207 77
-385 -1 -243 -42 -430 -142 -635 -164 -337 -370 -539 -1025 -1006 -502 -357
-735 -590 -875 -874 -104 -211 -146 -407 -138 -645 3 -121 9 -158 31 -227 62
-190 206 -324 408 -379 77 -21 248 -29 350 -15 423 57 714 297 953 786 105
216 162 367 349 935 170 516 262 764 356 950 294 588 660 854 1205 877 233 10
460 -30 633 -112 325 -154 523 -433 642 -900 51 -200 82 -398 130 -835 58
-524 97 -723 172 -875 58 -118 129 -189 226 -226 51 -19 71 -21 187 -16 103 4
146 10 210 30 212 69 353 218 390 413 19 95 19 141 0 228 -22 103 -72 193
-214 385 -71 96 -152 213 -180 259 -142 238 -196 514 -173 879 20 316 64 508
162 708 94 194 211 315 385 400 135 66 227 86 435 92 409 13 924 -49 1264
-152 404 -123 633 -254 1126 -646 360 -286 586 -379 919 -379 87 0 145 5 182
16 179 53 303 186 356 384 25 90 24 309 -1 399 -68 248 -255 411 -596 519
-148 47 -302 78 -745 152 -599 100 -850 164 -1094 281 -269 128 -478 323 -594
554 -202 404 -207 1039 -11 1463 85 185 247 376 430 508 105 76 364 206 519
263 61 22 242 80 403 130 395 123 516 173 631 259 68 51 105 96 139 169 25 53
27 68 26 173 -1 137 -18 211 -77 325 -121 232 -372 356 -692 343 -130 -6 -217
-35 -336 -114 -106 -69 -290 -259 -475 -489 -198 -245 -290 -349 -380 -427
-218 -188 -337 -218 -749 -187 -759 56 -1149 310 -1335 868 -75 223 -110 491
-110 831 0 383 38 546 225 965 179 402 228 613 229 990 1 158 -2 190 -22 263
-46 170 -115 286 -236 399 -155 144 -366 203 -571 158z"/>
<path d="M545 8539 c-99 -13 -238 -54 -309 -92 -118 -62 -203 -173 -226 -296
-33 -173 11 -318 136 -451 103 -109 231 -181 419 -236 141 -41 259 -56 480
-61 312 -7 520 24 690 106 95 46 155 95 193 159 23 40 27 58 27 118 -1 62 -6
82 -37 145 -121 243 -472 483 -853 584 -86 23 -124 27 -275 30 -96 2 -206 -1
-245 -6z"/>
<path d="M10180 1384 c-210 -37 -353 -117 -469 -262 -103 -128 -145 -256 -145
-437 1 -102 5 -132 27 -200 36 -110 89 -196 172 -279 82 -83 168 -136 280
-173 70 -23 96 -27 210 -27 114 0 140 4 210 27 111 37 198 90 280 172 82 82
135 169 172 280 22 68 27 98 27 200 0 85 -5 139 -17 185 -67 244 -259 434
-499 494 -68 17 -204 28 -248 20z"/>
</g>
</svg>
`;


/* ===================== INITIALISATION DU JEU ===================== */
// Lancement du jeu au clic sur le bouton
startBtn.addEventListener("click", startGame);

function startGame() {
    // Cacher le bouton de démarrage
    startBtn.style.display = "none";

    // Initialiser le jeu
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = score;

    // Créer les 6 cibles au départ
    for (let i = 0; i < 6; i++) {
        spawnCible();
    }

    // Lancer immédiatement le mouvement des cibles
    moveAllCible();

    // Changement de direction toutes les 1.2 secondes
    moveInterval = setInterval(function () {
        if (gameActive) {
            moveAllCible();
        }
    }, 1200);

    // Compte à rebours de 15 secondes
    let timeLeft = 15;
    const timerInterval = setInterval(function () {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        // Fin du jeu lorsque le temps est écoulé
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(moveInterval);
            endGame();
        }
    }, 1000);
}


/* ===================== FONCTIONS DES CIBLES ===================== */
function spawnCible() {
    // Créer l’élément cible
    const h = document.createElement("div");
    h.className = "cible";
    h.innerHTML = cibleSVG;

    // Position aléatoire immédiate (sans animation)
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 200);
    h.style.left = x + "px";
    h.style.top = y + "px";

    // Détection du clic
    h.addEventListener("mousedown", function (e) {
        if (!gameActive) return;

        // Créer l’effet tache à la position de la souris
        createSplat(e.clientX, e.clientY);

        // Incrémenter le score
        score++;
        scoreDisplay.textContent = score;

        // Animation de disparition
        h.classList.add("fade-out");

        // Supprimer et recréer une nouvelle cible après 700ms
        setTimeout(function () {
            h.remove();
            if (gameActive) spawnCible();
        }, 700);
    });

    // Ajouter la cible à la zone de jeu
    gameZone.appendChild(h);
}


/* ===================== DÉPLACEMENT ALÉATOIRE DE TOUTES LES CIBLES ===================== */
function moveAllCible() {
    // Récupérer toutes les cibles
    const allCibles = document.querySelectorAll('.cible');

    // Boucle sur chaque cible
    for (let i = 0; i < allCibles.length; i++) {
        const h = allCibles[i];

        // Ne pas déplacer si la cible est en train de disparaître
        if (!h.classList.contains('fade-out')) {
            // Position aléatoire
            const x = Math.random() * (window.innerWidth - 100);
            const y = Math.random() * (window.innerHeight - 250);

            h.style.left = x + "px";
            h.style.top = y + "px";
        }
    }
}


/* ===================== FONCTION DE LA TACHE ===================== */
function createSplat(x, y) {
    // Créer un conteneur pour le SVG de la tache
    const container = document.createElement("div");
    container.className = "splat-svg"; // La classe CSS gère le centrage avec transform: translate(-50%, -50%)
    container.innerHTML = splatSVGString;

    // Positionner le conteneur sur la souris
    container.style.left = x + "px";
    container.style.top = y + "px";

    // Ajouter le conteneur dans le DOM
    document.body.appendChild(container);

    // Supprimer le conteneur après la fin de l'animation (400ms)
    setTimeout(function () {
        container.remove();
    }, 400);
}


/* ===================== FIN DU JEU ===================== */
function endGame() {
    gameActive = false; // Désactiver le jeu
    gameZone.innerHTML = ""; // Enlève toutes les cibles à l'écran
    finalScoreDisplay.textContent = score; // Afficher le score final
    overlay.style.display = "flex"; // Afficher l'overlay de fin
}
