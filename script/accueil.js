/* ===================== VARIABLES GLOBALES ===================== */
let data = []; // Tableau qui contiendra toutes les données du fichier JSON
let typeActuel = null; // Type d’indicateur actuellement sélectionné (null = rien au départ)
let anneeActuel = 2016; // Année sélectionnée par défaut


/* ===================== DOM ===================== */
const typeSelection = document.getElementById("type-selection");
const Menu = document.getElementById("Menu-types");
const fleche = document.querySelector(".fleche-filtre");

const periode = document.querySelector(".stats .card:nth-child(1) .info1");
const regions = document.querySelector(".stats .card:nth-child(2) .info1");
const regionMax = document.querySelector(".stats .card:nth-child(3) .info1");
const tendance = document.querySelector(".stats .card:nth-child(4) .info1");


/* ===================== CHARGEMENT JSON ===================== */
fetch("data/data.json")
    .then(res => res.json()) // Conversion de la réponse en objet JS
    .then(json => {
        data = json; // Stockage des données
        initTypes(); // Génération des types dans le menu
        initAnnee(); // Activation des boutons d'années
    });


/* ===================== OUVERTURE / FERMETURE FILTRE ===================== */
fleche.addEventListener("click", toggleMenu); // Clic sur la flèche → ouvre ou ferme le menu
function toggleMenu(event) {
    event.stopPropagation(); // Empêche le clic de se propager au document
    document.querySelector(".Menu").classList.toggle("open");
}

document.addEventListener("click", closeMenu); // Clic ailleurs sur la page → ferme le menu
function closeMenu() {
    document.querySelector(".Menu").classList.remove("open");
}


/* ===================== GÉNÉRATION DES TYPES ===================== */
function initTypes() {

    // Tableau qui va contenir les indicateurs
    const types = [];

    // On parcourt toutes les données une par une
    for (let i = 0; i < data.length; i++) {
        // On vérifie si l'indicateur de la donnée actuelle n'est PAS déjà présent dans le tableau types (pour ne pas avoir 30 000 homicides par ex)
        if (!types.includes(data[i].indicateur)) {
            // Si l'indicateur n'existe pas encore, on l'ajoute au tableau types
            types.push(data[i].indicateur);
        }
    }

    // Structure HTML du menu
    Menu.innerHTML = `
        <div class="Menu-header">
            <span>${types.length} indicateurs disponibles</span>
            <span class="close">×</span>
        </div>
        <div class="Menu-content"></div>
    `;

    // Clic sur la croix → fermeture du menu
    Menu.querySelector(".close").addEventListener("click", closeMenu);

    // Création d’un item par type
    types.forEach(function (type) {
        // Création d'un nouvel élément div
        const item = document.createElement("div");
        // Ajout de la classe pour le style CSS
        item.className = "Menu-item";
        // Contenu HTML de l'item (le nom du type + un point quand un type est sélectionné)
        item.innerHTML = `
            <div class="item-label">${type}</div>
            <div class="status-contenu"></div>
        `;

        // Au clic sur l'item, on sélectionne le type correspondant
        item.addEventListener("click", function () {
            selectType(item, type);
        });

        // Ajout de l'item dans le contenu du menu
        Menu.querySelector(".Menu-content").appendChild(item);
    });
}

// Fonction de fermeture du menu
function closeMenu() {
    Menu.classList.remove("open");
}

// Gestion de la sélection d’un type
function selectType(item, type) {
    typeActuel = type; // Mise à jour du type actuellement sélectionné
    typeSelection.textContent = type; // Affichage du type sélectionné 
    Menu.classList.remove("open");  // Fermeture du menu

    // Suppression des indicateurs visuels précédents
    const contenu = document.querySelectorAll(".status-contenu");

    for (let i = 0; i < contenu.length; i++) {
        contenu[i].innerHTML = "";
    }

    // Ajout de l’indicateur visuel sur l’item sélectionné
    item.querySelector(".status-contenu").innerHTML = `<div class="item-status"></div>`;

    // Mise à jour des statistiques et animations
    updateStats();
    updatecoeurStats();
}


/* ===================== STATS PARTIE 1 & 2 ===================== */
function updateStats() {

    // Si aucun type n'est sélectionné, on arrête la fonction
    if (!typeActuel) {
        return;
    }

    // Filtrage des données selon le type
    const filtrer = [];

    // On parcourt toutes les données
    for (let i = 0; i < data.length; i++) {

        // Si l'indicateur correspond au type sélectionné
        if (data[i].indicateur === typeActuel) {
            filtrer.push(data[i]);
        }
    }


    /* ===================== Calcul du total global ===================== */
    let total = 0; // Variable pour stocker le total

    // Addition de toutes les valeurs "nombre"
    for (let i = 0; i < filtrer.length; i++) {
        total += filtrer[i].nombre;
    }

    // Mise à jour du total affiché
    document.getElementById("total-label").textContent = "TOTAL " + typeActuel.toUpperCase(); // Permet d'écrire en MAJUSCULE
    document.getElementById("total-value").textContent = total;


    /* ===================== Calcul de la période ===================== */
    // Initialisation avec la première année trouvée
    let minAnnee = filtrer[0].annee;
    let maxAnnee = filtrer[0].annee;

    // Parcours des données filtrées pour trouver min et max
    for (let i = 0; i < filtrer.length; i++) {
        // Mise à jour de l'année minimale
        if (filtrer[i].annee < minAnnee) {
            minAnnee = filtrer[i].annee;
        }

        // Mise à jour de l'année maximale
        if (filtrer[i].annee > maxAnnee) {
            maxAnnee = filtrer[i].annee;
        }
    }

    // Affichage de la période
    periode.textContent = minAnnee + " - " + maxAnnee;


    /* ===================== Nombre de régions analysées ===================== */
    // Tableau pour stocker les régions
    const regionsList = [];

    // Parcours des données filtrées
    for (let i = 0; i < filtrer.length; i++) {
        // Si la région n'est pas encore dans le tableau
        if (!regionsList.includes(filtrer[i].Code_region)) {
            // On l'ajoute
            regionsList.push(filtrer[i].Code_region);
        }
    }

    // Affichage du nombre de régions
    regions.textContent = regionsList.length;


    /* ===================== Calcul de la région la plus touchée ===================== */
    // Objet pour stocker le total par région
    const regionTotals = {};

    // Parcours des données filtrées
    for (let i = 0; i < filtrer.length; i++) {
        const region = filtrer[i].Code_region;

        // Si la région n'existe pas encore dans l'objet
        if (!regionTotals[region]) {
            regionTotals[region] = 0;
        }

        // Ajout du nombre de cas à la région correspondante
        regionTotals[region] += filtrer[i].nombre;
    }

    // Variables pour stocker la région la plus touchée
    let regionMaxCode = null;
    let regionMaxValue = 0;

    // Parcours de toutes les régions
    for (let region in regionTotals) {
        // Si le total de la région est supérieur au maximum actuel
        if (regionTotals[region] > regionMaxValue) {
            regionMaxValue = regionTotals[region];
            regionMaxCode = region;
        }
    }

    // Affichage de la région la plus touchée
    regionMax.textContent = "Région " + regionMaxCode;
    document.querySelector(".stats .card:nth-child(3) .soustitre2").textContent = regionMaxValue + " cas";


    /* ===================== Calcul de la tendance globale ===================== */
    // Objet pour stocker le total par année
    const totalAnnee = {};

    // Parcours des données filtrées
    for (let i = 0; i < filtrer.length; i++) {
        const annee = filtrer[i].annee;

        // Si l'année n'existe pas encore dans l'objet
        if (!totalAnnee[annee]) {
            totalAnnee[annee] = 0;
        }

        // Ajout du nombre de cas pour cette année
        totalAnnee[annee] += filtrer[i].nombre;
    }

    // Récupération et tri des années
    const annees = Object.keys(totalAnnee).sort();

    // Première et dernière année
    const premAnnee = annees[0];
    const dernAnnee = annees[annees.length - 1];

    // Comparaison pour déterminer la tendance
    if (totalAnnee[dernAnnee] > totalAnnee[premAnnee]) {
        tendance.textContent = "↗ Hausse";
    } else {
        tendance.textContent = "↘ Baisse";
    }
}


/* ===================== ANNÉES CLIQUABLES ===================== */
function initAnnee() {
    // Sélection de tous les boutons d'années
    const buttons = document.querySelectorAll(".annees div");

    // Parcours de tous les boutons
    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        // Ajout d'un clic sur chaque bouton
        btn.addEventListener("click", function () {

            // Retirer l'ancienne année active
            const activeBtn = document.querySelector(".annees .active");
            if (activeBtn) {
                activeBtn.classList.remove("active");
            }

            // Activer l'année cliquée
            btn.classList.add("active");

            // Mettre à jour l'année courante
            anneeActuel = parseInt(btn.textContent);

            // Mettre à jour les stats et animations
            updatecoeurStats();
        });
    }
}


/* ===================== CALCUL TOTAL PAR ANNÉE ===================== */
function totalparAnnee(type, annee) {
    // Tableau pour stocker les données filtrées
    const filtrer = [];

    // Parcours de toutes les données
    for (let i = 0; i < data.length; i++) {

        // Si la donnée correspond au type et à l'année recherchée
        if (data[i].indicateur === type && data[i].annee === annee) {

            // On l'ajoute au tableau filtré
            filtrer.push(data[i]);
        }
    }

    // Calcul du total pour le type et l'année
    let total = 0;
    for (let i = 0; i < filtrer.length; i++) {
        total += filtrer[i].nombre;
    }

    // On renvoie le total
    return total;
}


/* ===================== CŒUR – RYTHME SELON DONNÉES ===================== */
function updatecoeur(total) {

    // Sélection de l'élément cœur dans le HTML
    const coeur = document.querySelector(".coeur");

    // Valeur minimale et maximale possibles
    const MIN = 500;
    const MAX = 40000;

    // Vitesses d'animation
    // Plus la valeur est élevée, plus le cœur bat vite
    const minvitesse = 0.6; // Battement rapide
    const maxvitesse = 1.8; // Battement lent


    // On empêche la valeur d'être plus petite que MIN ou plus grande que MAX
    let value = total;

    if (value < MIN) {
        value = MIN;
    }

    if (value > MAX) {
        value = MAX;
    }

    // Calcul de la vitesse d’animation
    // Plus la valeur est grande, plus la durée est courte
    const vitesse = maxvitesse - ((value - MIN) / (MAX - MIN)) * (maxvitesse - minvitesse);

    // Application de la vitesse à l'animation CSS
    coeur.style.animationDuration = vitesse + "s";
}


/* ===================== ECG – VITESSE DE DESSIN ===================== */
function updateECG(total) {

    // Récupération de la barre ECG dans le HTML
    const ecg = document.getElementById("Barre-Rythme");

    // Valeurs minimale et maximale possibles
    const MIN = 500;
    const MAX = 40000;

    // Durée minimale et maximale de l’animation
    // Petite durée = animation rapide
    const minDuration = 0.8;
    const maxDuration = 3.5;


    // On empêche le total d’être trop petit ou trop grand
    let value = total;

    if (value < MIN) {
        value = MIN;
    }

    if (value > MAX) {
        value = MAX;
    }


    // Calcul de la durée d’animation
    // Plus la valeur est grande, plus l’animation est rapide
    const duration = maxDuration - ((value - MIN) / (MAX - MIN)) * (maxDuration - minDuration);

    // Application de la durée à l’animation CSS
    ecg.style.animationDuration = duration + "s";
}


/* ===================== RESET ECG (re-dessin) ===================== */
function resetECG() {

    // Récupération de la barre ECG
    const ecg = document.getElementById("Barre-Rythme");

    // Arrêt de l'animation CSS
    ecg.style.animation = "none";

    // Forcer le navigateur à recalculer l'affichage
    // Cela permet de "réinitialiser" l'animation
    ecg.offsetHeight;

    // Relance de l'animation
    ecg.style.animation = "";
}


/* ===================== STATS PARTIE 3 ===================== */
function updateStatBoxes(total) {

    // 1. Niveau de gravité
    // Par défaut, le niveau est "Faible"
    let state = "Faible";

    // Si le total est supérieur à 30 000
    if (total > 30000) {
        state = "Élevé";
    }
    // Sinon, s’il est supérieur à 15 000
    else if (total > 15000) {
        state = "Moyen";
    }

    // Affichage du niveau de gravité
    document.querySelector(".box:nth-child(1) .info2").textContent = state;


    // 2. Nombre total de cas
    // Affichage du total avec sépatauxurs de milliers
    document.querySelector(".box:nth-child(2) .info2").textContent =
        total.toLocaleString();


    // 3. Taux pour 1000 habitants
    // Population de référence (France)
    const population = 68000000;

    // Calcul du taux pour 1000 habitants
    const taux = (total / population * 1000).toFixed(2); // Permet d'avoir 2 chiffres après la virgule

    // Affichage du taux
    document.querySelector(".box:nth-child(3) .info2").textContent = taux;


    // 4. Évolution par rapport à l’année précédente
    // Récupération du total de l’année précédente
    const precedent = totalparAnnee(typeActuel, anneeActuel - 1);

    // Valeur par défaut si pas de donnée
    let evolution = "—";

    // Si une valeur existe pour l’année précédente
    if (precedent) {

        // Calcul de la différence en pourcentage
        const diff = ((total - precedent) / precedent * 100).toFixed(1); // Permet d'avoir 1 chiffre après la virgule

        // Ajout du signe + si augmentation
        if (diff > 0) {
            evolution = "+ " + diff + " %";
        } else {
            evolution = diff + " %";
        }
    }

    // Affichage de l’évolution
    document.querySelector(".box:nth-child(4) .info2").textContent = evolution;
}


/* ===================== UPDATE GLOBAL (CŒUR + ECG + STATS) ===================== */
function updatecoeurStats() {

    // Si aucun type n’est sélectionné, on ne fait rien
    if (!typeActuel) {
        return;
    }

    // Récupération du total pour le type et l’année sélectionnés
    const total = totalparAnnee(typeActuel, anneeActuel);

    // Mise à jour de l’animation du cœur
    updatecoeur(total);

    // Réinitialisation de l’ECG
    resetECG();

    // Mise à jour de l’animation ECG
    updateECG(total);

    // Mise à jour des blocs de statistiques
    updateStatBoxes(total);
}


/* ===================== HOVER CŒUR – AFFICHAGE BPM ===================== */
// On récupère l'élément cœur
const coeur = document.querySelector(".coeur");

// On crée la bulle d'info
const bulle = document.createElement("div");
bulle.className = "bulle-coeur";
document.body.appendChild(bulle);

// Quand on passe la souris sur le cœur
coeur.addEventListener("mousemove", function (e) {
    if (!typeActuel) return; // si rien n'est sélectionné, on ne fait rien
    var total = totalparAnnee(typeActuel, anneeActuel); // récupère le nombre de victimes
    bulle.textContent = total + " victimes";
    bulle.style.left = (e.pageX + 15) + "px"; // positionne la bulle
    bulle.style.top = (e.pageY + 15) + "px";
    bulle.style.opacity = 1; // rend visible
});

// Quand on sort la souris du cœur
coeur.addEventListener("mouseleave", function () {
    bulle.style.opacity = 0; // cache la bulle
});


