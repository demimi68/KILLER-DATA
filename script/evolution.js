/* ===================== VARIABLES GLOBALES ===================== */
let data = []; // Tableau qui contiendra toutes les données du fichier JSON
let typeActuel = null; // Type d’indicateur actuellement sélectionné 
let regionActuel = null; // Région actuellement sélectionnée 


/* ===================== DOM ===================== */
const typeSelection = document.getElementById("type-Selection");
const Menu = document.getElementById("Menu-types");
const fleche = document.querySelector(".fleche-filtre");

const cards = document.querySelectorAll(".stats .card");
const periodeValue = cards[0].querySelector(".info1");
const derniereValue = cards[1].querySelector(".info1");
const derniereSub = cards[1].querySelector(".soustitre2");
const variationValue = cards[2].querySelector(".info1");
const variationSub = cards[2].querySelector(".soustitre2");
const moyenneValue = cards[3].querySelector(".info1");

const svgNS = "http://www.w3.org/2000/svg";
const seringuesContenu = document.getElementById("seringues-Contenu");

/* ===================== CHARGEMENT JSON ===================== */
fetch("data/data.json")
    .then(res => res.json()) // Conversion de la réponse en objet JS
    .then(json => {
        data = json; // Stockage des données
        initTypes(); // Génération des types dans le menu
        initRegions(); // Génération des régions
        generateseringues(); // Génération des seringe
    });

/* ===================== FILTRE ===================== */
fleche.addEventListener("click", stopClick); // Clic sur la flèche pour ouvrir / fermer le menu
function stopClick(event) {
    event.stopPropagation(); // Empêche le clic de se propager au document
    Menu.classList.toggle("open");
}

document.addEventListener("click", closeMenu); // Clic ailleurs sur la page → ferme le menu
function closeMenu() {
    Menu.classList.remove("open");
}

/* ===================== TYPES ===================== */
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

    // Structure HTML du menu déroulant
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
            <div class="status-Contenu"></div>
        `;

        // Au clic sur l'item, on sélectionne le type correspondant
        item.addEventListener("click", function () {
            selectType(item, type);
        });

        // Ajout de l'item dans le menu
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
    Menu.classList.remove("open"); // Fermeture du menu

    // Suppression des indicateurs visuels précédents
    const contenu = document.querySelectorAll(".status-Contenu");

    for (let i = 0; i < contenu.length; i++) {
        contenu[i].innerHTML = "";
    }

    // Ajout de l’indicateur visuel sur l’item sélectionné
    item.querySelector(".status-Contenu").innerHTML =
        `<div class="item-status"></div>`;

    // Mise à jour des statistiques et des animations
    generateseringues();
    updateStats();
    updateAllseringues();
}


/* ===================== STATS ===================== */
function updateStats() {
    // Si aucun type n’est sélectionné, on arrête la fonction
    if (!typeActuel) {
        return;
    }

    // Tableau qui va contenir les données du type sélectionné
    const typeData = [];

    // On parcourt toutes les données
    for (let i = 0; i < data.length; i++) {
        // Si l'indicateur correspond au type sélectionné
        if (data[i].indicateur === typeActuel) {
            typeData.push(data[i]);
        }
    }

    // Tableau des années 
    const listeAnnee = [];

    for (let i = 0; i < typeData.length; i++) {
        // Si l’année de la donnée actuelle n’est pas encore dans le tableau listeAnnee
        if (!listeAnnee.includes(typeData[i].annee)) {
            // On ajoute cette année au tableau (pour n’avoir qu’une seule fois chaque année)
            listeAnnee.push(typeData[i].annee);
        }
    }

    // Tri des années par ordre croissant
    listeAnnee.sort();

    // Objet qui contiendra le total pour chaque année
    const anneeTotal = {};

    // Initialisation des totaux à 0
    for (let i = 0; i < listeAnnee.length; i++) {
        anneeTotal[listeAnnee[i]] = 0;
    }

    // Calcul des totaux
    for (let i = 0; i < typeData.length; i++) {
        const annee = typeData[i].annee;
        anneeTotal[annee] += typeData[i].nombre;
    }

    // Première et dernière année
    const premiereAnnee = listeAnnee[0];
    const derniereAnnee = listeAnnee[listeAnnee.length - 1];

    const premierTotal = anneeTotal[premiereAnnee];
    const dernierTotal = anneeTotal[derniereAnnee];

    // Affichage
    // Nombre d'années analysées
    periodeValue.textContent = listeAnnee.length + " ans";

    // Dernière valeur
    derniereValue.textContent = dernierTotal;
    derniereSub.textContent = "cas en " + derniereAnnee;


    // Calcul de la variation brute
    const variation = dernierTotal - premierTotal;

    // Calcul du pourcentage d’évolution
    const pourcentage = Math.round((variation / premierTotal) * 1000) / 10; // Math.round c'est pour avoir une valeur arrondi

    // Affichage avec + ou -
    if (variation > 0) {
        variationValue.textContent = "+" + variation;
    } else {
        variationValue.textContent = variation;
    }

    variationSub.textContent = pourcentage + "% depuis " + premiereAnnee;

    // Moyenne
    let sommeTotale = 0;

    for (let i = 0; i < listeAnnee.length; i++) {
        sommeTotale += anneeTotal[listeAnnee[i]];
    }

    const moyenne = Math.round(sommeTotale / listeAnnee.length);

    moyenneValue.textContent = moyenne;
}


/* ===================== RÉGIONS ===================== */
function initRegions() {
    // Récupération de toutes les régions de la carte
    const regions = document.querySelectorAll(".carte svg path");

    // Parcours de chaque région
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];

        // Changement du curseur pour montrer que c'est cliquable
        region.style.cursor = "pointer";

        // Ajout de l'événement au clic sur une région
        region.addEventListener("click", clickRegion);

        function clickRegion() {
            // Stockage de l'identifiant de la région cliquée
            regionActuel = region.id;

            // Suppression de la classe active sur toutes les régions
            for (let j = 0; j < regions.length; j++) {
                regions[j].classList.remove("active");
            }

            // Ajout de la classe active sur la région sélectionnée
            region.classList.add("active");

            // Mise à jour des seringues selon la région choisie
            updateAllseringues();

            // Scroll vers la section 3
            const sectionPart3 = document.querySelector(".part3");
            if (sectionPart3) {
                sectionPart3.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    }
}


/* ===================== GÉNÉRATION DES SERINGUES ===================== */
function generateseringues() {

    // On vide le conteneur des seringues avant de les recréer
    seringuesContenu.innerHTML = "";

    // RÉCUPÉRATION DES ANNÉES
    // Tableau qui va contenir les années uniques
    const annees = [];

    // On parcourt toutes les données
    for (let i = 0; i < data.length; i++) {

        // Si la donnée correspond au type sélectionné
        if (!annees.includes(data[i].annee)) {
            annees.push(data[i].annee);
        }
    }

    // Tri des années dans l'ordre croissant
    annees.sort();

    // CRÉATION DES SERINGUES 
    // Pour chaque année, on crée une seringue
    for (let i = 0; i < annees.length; i++) {

        const annee = annees[i];

        // Création du conteneur de la seringue
        const conteneur = document.createElement("div");
        conteneur.classList.add("seringue-conteneur");

        // Création du SVG de la seringue pour l'année
        const seringue = creeSeringueSVG(annee);

        // Création du label de l'année
        const label = document.createElement("div");
        label.classList.add("annee");
        label.textContent = annee;

        // Ajout des éléments dans le conteneur
        conteneur.appendChild(seringue);
        conteneur.appendChild(label);

        // Ajout du conteneur dans la page
        seringuesContenu.appendChild(conteneur);
    }
}


/* ===================== CRÉATION D’UNE SERINGUE ===================== */
function creeSeringueSVG(annee) {

    // Création de l’élément SVG
    const svg = document.createElementNS(svgNS, "svg");

    // Dimensions du SVG
    svg.setAttribute("width", "139");
    svg.setAttribute("height", "438");
    svg.setAttribute("viewBox", "0 0 139 438");
    svg.setAttribute("fill", "none");

    // Stockage de l’année dans un attribut personnalisé
    svg.dataset.annee = annee;

    // Classe pour le style CSS
    svg.classList.add("seringue");


    /* ===================== FORME DE LA SERINGUE ===================== */

    // Ajout du dessin de la seringue
    svg.innerHTML = `
        <path d="M67.4999 358.5V438" stroke="white"/>
<path d="M88.212 344.324L68.1137 360.475L49.0921 344.324H41.5553V313.818H23.6104C19.7821 311.186 14.4226 304.415 23.6104 298.385H26.1226V82.3288H3.51204C1.23901 78.022 -1.94322 67.6857 3.51204 60.7949H56.629V14.8559H33.3006C29.9509 12.1044 25.2613 5.38102 33.3006 0.5H98.6201C102.807 2.89265 108.669 9.11356 98.6201 14.8559H78.5218V60.7949H133.074C136.663 64.1446 141.688 73.141 133.074 82.3288H112.617V298.385H113.335C117.522 300.419 123.384 306.353 113.335 313.818H96.8256V344.324H88.212Z" fill="white"/>
<path d="M88.212 344.324L68.1137 360.475L49.0921 344.324M88.212 344.324H96.8256V313.818M88.212 344.324H49.0921M96.8256 313.818H41.5553M96.8256 313.818H113.335C123.384 306.353 117.522 300.419 113.335 298.385H112.617M41.5553 313.818V344.324H49.0921M41.5553 313.818H23.6104C19.7821 311.186 14.4226 304.415 23.6104 298.385H26.1226M38.3252 298.385H26.1226M38.3252 298.385H101.491M38.3252 298.385L38.6841 82.3288M38.6841 82.3288H26.1226M38.6841 82.3288H101.132M112.617 82.3288V298.385M112.617 82.3288H133.074C141.688 73.141 136.663 64.1446 133.074 60.7949H78.5218M112.617 82.3288H101.132M112.617 298.385H101.491M26.1226 298.385V82.3288M26.1226 82.3288H3.51204C1.23901 78.022 -1.94322 67.6857 3.51204 60.7949H56.629M56.629 60.7949V14.8559M56.629 60.7949H78.5218M56.629 14.8559H78.5218M56.629 14.8559H33.3006C29.9509 12.1044 25.2613 5.38102 33.3006 0.5H98.6201C102.807 2.89265 108.669 9.11356 98.6201 14.8559H78.5218M78.5218 14.8559V60.7949M101.132 82.3288L101.144 89.5M101.491 298.385L101.454 276M101.144 89.5H78.5218M101.144 89.5L101.174 107.5M101.174 107.5H78.5218M101.174 107.5L101.205 126M101.205 126H78.5218M101.205 126L101.236 145M101.236 145H78.5218M101.236 145L101.262 160.5M101.262 160.5H78.5218M101.262 160.5L101.29 177.5M101.29 177.5H78.5218M101.29 177.5L101.321 196M101.321 196H78.5218M101.321 196L101.355 216.5M101.355 216.5H78.5218M101.355 216.5L101.388 236M101.388 236H78.5218M101.388 236L101.421 256M101.454 276H78.5218M101.454 276L101.421 256M101.421 256H78.5218" stroke="black"/>
    `;

    /* ===================== DÉGRADÉ DU SANG ===================== */
    // Création du conteneur 
    const defs = document.createElementNS(svgNS, "defs");

    // Création du dégradé
    const degrade = document.createElementNS(svgNS, "linearGradient");

    // Identifiant unique du dégradé (lié à l’année)
    degrade.setAttribute("id", "sangDegrade-" + annee);
    degrade.setAttribute("x1", "0");
    degrade.setAttribute("y1", "0");
    degrade.setAttribute("x2", "0");
    degrade.setAttribute("y2", "1");

    // Couleurs du dégradé
    degrade.innerHTML = `
        <stop offset="0%" stop-color="#9A1919"/>
        <stop offset="100%" stop-color="#E02424"/>
    `;

    // Ajout du dégradé dans le SVG
    defs.appendChild(degrade);
    svg.appendChild(defs);

    /* ===================== SANG DANS LA SERINGUE ===================== */

    // Création du rectangle représentant le sang
    const sang = document.createElementNS(svgNS, "rect");

    sang.setAttribute("x", "39");
    sang.setAttribute("y", "298");
    sang.setAttribute("width", "62");
    sang.setAttribute("height", "0"); // hauteur à 0 au départ
    sang.setAttribute("fill", "url(#sangDegrade-" + annee + ")");

    // Classe pour l’animation
    sang.classList.add("seringue-sang");

    // Ajout du sang dans la seringue
    svg.appendChild(sang);

    // On retourne le SVG complet
    return svg;
}


/* ===================== MISE À JOUR DES SERINGUES ===================== */
function updateAllseringues() {

    // Si aucun type ou aucune région n'est sélectionné, on arrête
    if (!typeActuel || !regionActuel) {
        return;
    }

    /* ===================== DONNÉES FILTRÉES ===================== */
    // Tableau qui contiendra les données correspondant au type et à la région
    const values = [];

    // Parcours de toutes les données
    for (let i = 0; i < data.length; i++) {

        // Vérification du type et de la région
        if (
            data[i].indicateur === typeActuel &&
            data[i].Code_region == regionActuel
        ) {
            values.push(data[i]);
        }
    }

    // Si aucune donnée trouvée, on arrête
    if (values.length === 0) {
        return;
    }

    /* ===================== VALEUR MAX ===================== */
    // Recherche de la valeur maximale
    let max = values[0].nombre;

    for (let i = 0; i < values.length; i++) {
        if (values[i].nombre > max) {
            max = values[i].nombre;
        }
    }

    /* ===================== MISE À JOUR DES SERINGUES ===================== */
    // Récupération de toutes les seringues
    const seringues = document.querySelectorAll(".seringue");

    // Parcours de chaque seringue
    for (let i = 0; i < seringues.length; i++) {

        const svg = seringues[i];

        // Récupération de l'année stockée dans le SVG
        const annee = svg.dataset.annee;

        // Récupération du sang dans la seringue
        const sang = svg.querySelector(".seringue-sang");

        // Valeur pour cette année
        let valeurAnnee = 0;

        // Recherche de la donnée correspondant à l'année
        for (let j = 0; j < values.length; j++) {
            if (values[j].annee == annee) {
                valeurAnnee = values[j].nombre;
            }
        }

        // Calcul du ratio (entre 0 et 1)
        let ratio = 0;
        if (max > 0) {
            ratio = valeurAnnee / max;
        }

        // Animation du remplissage de la seringue
        animatesang(sang, ratio);
    }
}


/* ===================== ANIMATION DU SANG ===================== */
function animatesang(rect, ratio) {

    // Hauteur maximale possible du sang dans la seringue
    const maxHeight = 216;

    // Calcul de la hauteur du sang en fonction du ratio (entre 0 et 1)
    const height = maxHeight * ratio;

    // Ajout d'une transition pour une animation fluide
    rect.style.transition = "all 0.6s ease-out";

    // Modification de la hauteur du rectangle
    rect.setAttribute("height", height);

    // Ajustement de la position verticale pour que le sang monte
    rect.setAttribute("y", 298 - height);
}
