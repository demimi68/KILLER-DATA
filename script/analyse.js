/* ===================== VARIABLES GLOBALES ===================== */
// Année actuelle sélectionnée
let anneeActuel = 2016;

// Tableau qui contiendra les données JSON chargées
let jsonData = [];


/* ===================== REGIONS ===================== */
// Objet associant les codes de région à leur nom
const regions = {
    1: "Guadeloupe",
    2: "Martinique",
    3: "Guyane",
    4: "La Réunion",
    6: "Mayotte",
    11: "Île-de-France",
    24: "Centre-Val de Loire",
    27: "Bourgogne-Franche-Comté",
    28: "Normandie",
    32: "Hauts-de-France",
    44: "Grand Est",
    52: "Pays de la Loire",
    53: "Bretagne",
    75: "Nouvelle-Aquitaine",
    76: "Occitanie",
    84: "Auvergne-Rhône-Alpes",
    93: "Provence-Alpes-Côte d'Azur",
    94: "Corse"
};


/* ===================== OUTILS ===================== */
function parseTaux(taux) {

    // Si le taux est un texte (ex: "12,5")
    if (typeof taux === "string") {

        // On remplace la virgule par un point
        taux = taux.replace(",", ".");

        // On transforme le texte en nombre
        return taux * 1;
    }

    // Si c'est déjà un nombre, on le retourne tel quel
    return taux;
}


/* ===================== Bulle info ===================== */
// Création d'un élément div pour la bulle
const bulleInfo = document.createElement("div");

// Ajout de la classe pour le style CSS
bulleInfo.classList.add("bulleInfo");

// Ajout du bulleInfo dans le body de la page
document.body.appendChild(bulleInfo);


/* ===================== CHARGEMENT JSON ===================== */
fetch("data/data.json")
    .then(res => res.json()) // Conversion de la réponse en objet JS
    .then(data => {
        jsonData = data; // Stockage des données
        initAnnee(); // Initialisation de l'année
        updatebulles();  // Mise à jour des bulles
        updateMap(anneeActuel); // Mise à jour de la carte selon l'année actuelle
    })


/* ===================== TOP 5 TOTAL ===================== */
function afficherTop5Total(data) {
    // Objet qui va stocker le total des taux par région
    const totals = {};

    // On parcourt toutes les données une par une
    for (let i = 0; i < data.length; i++) {

        // Récupération du code de la région
        const code = data[i].Code_region;

        // Récupération du taux et conversion en nombre
        const taux = parseTaux(data[i].taux_pour_mille);

        // Si la région n'existe pas encore dans l'objet totals
        if (!totals[code]) {

            // On initialise son total à 0
            totals[code] = 0;
        }

        // On ajoute le taux au total de la région
        totals[code] = totals[code] + taux;
    }

    // Tableau qui contiendra chaque région avec son total
    const regionsTotals = [];

    // On parcourt l'objet totals
    for (let code in totals) {

        // Pour chaque région, on crée un objet avec : son code, son total
        regionsTotals.push({
            code: code,
            total: totals[code]
        });
    }

    // On trie le tableau en comparant les totaux
    regionsTotals.sort(function (a, b) {

        // Si le total de b est plus grand que celui de a,
        // alors b sera placé avant a
        return b.total - a.total;
    });


    // Tableau qui contiendra uniquement les 5 premières régions
    const topRegions = [];

    // On prend les 5 premiers éléments du tableau trié
    for (let i = 0; i < 5; i++) {

        // Vérification pour éviter les erreurs
        if (regionsTotals[i]) {
            topRegions.push(regionsTotals[i]);
        }
    }


    // Récupération des éléments HTML où afficher les noms
    const infoDivs = document.querySelectorAll(".part2 .info1");

    // On affiche les noms des régions du top 5
    for (let i = 0; i < topRegions.length; i++) {

        // Code de la région actuelle
        const code = topRegions[i].code;

        // Si le nom de la région existe dans l'objet regions
        if (regions[code]) {

            // On affiche le nom de la région
            infoDivs[i].textContent = regions[code];
        } else {

            // Sinon, on affiche le code de la région
            infoDivs[i].textContent = "Région " + code;
        }
    }


    // Tableau qui contiendra uniquement les codes des régions
    const resultat = [];

    for (let i = 0; i < topRegions.length; i++) {
        resultat.push(topRegions[i].code);
    }

    // La fonction retourne les codes des régions du top 5
    return resultat;
}


/* ===================== AXES ===================== */
function Axes(svg, maxX, maxY) {

    // Ligne principale de l’axe X
    const xLigne = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xLigne.setAttribute("x1", 50);
    xLigne.setAttribute("y1", 550);
    xLigne.setAttribute("x2", 750);
    xLigne.setAttribute("y2", 550);
    xLigne.setAttribute("stroke", "#333");
    xLigne.setAttribute("stroke-width", 2);
    svg.appendChild(xLigne);


    // Ligne principale de l’axe Y
    const yLigne = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yLigne.setAttribute("x1", 50);
    yLigne.setAttribute("y1", 550);
    yLigne.setAttribute("x2", 50);
    yLigne.setAttribute("y2", 50);
    yLigne.setAttribute("stroke", "#333");
    yLigne.setAttribute("stroke-width", 2);
    svg.appendChild(yLigne);


    // On crée 6 graduations sur X (0 → 5)
    for (let i = 0; i <= 5; i++) {

        // Calcul de la position X de la graduation
        const x = 50 + (i / 5) * 700;
        const y = 550;

        // Petit trait de graduation
        const trait = document.createElementNS("http://www.w3.org/2000/svg", "line");
        trait.setAttribute("x1", x);
        trait.setAttribute("y1", y);
        trait.setAttribute("x2", x);
        trait.setAttribute("y2", y + 5);
        trait.setAttribute("stroke", "#333");
        svg.appendChild(trait);

        // Texte sous la graduation
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#fff");

        // Valeur affichée selon maxX
        text.textContent = Math.round((i / 5) * maxX);
        svg.appendChild(text);
    }

    // On crée 6 graduations sur Y (0 → 5)
    for (let i = 0; i <= 5; i++) {

        // Calcul de la position Y (de bas en haut)
        const y = 550 - (i / 5) * 500;

        // Petit trait de graduation
        const trait = document.createElementNS("http://www.w3.org/2000/svg", "line");
        trait.setAttribute("x1", 50);
        trait.setAttribute("y1", y);
        trait.setAttribute("x2", 45);
        trait.setAttribute("y2", y);
        trait.setAttribute("stroke", "#333");
        svg.appendChild(trait);

        // Texte à gauche de la graduation
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", 40);
        text.setAttribute("y", y + 5);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("fill", "#fff");

        // Valeur affichée avec 2 décimales
        text.textContent = ((i / 5) * maxY).toFixed(2);
        svg.appendChild(text);
    }

        /* ===== LIBELLÉ AXE X ===== */
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", 400); // centre de l’axe X
    xLabel.setAttribute("y", 600); // sous l’axe
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("fill", "#fff");
    xLabel.setAttribute("font-size", "14");
    xLabel.textContent = "Population moyenne (INSEE)";
    svg.appendChild(xLabel);

    /* ===== LIBELLÉ AXE Y ===== */
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", 50); // position après rotation
    yLabel.setAttribute("y", 10);
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.setAttribute("fill", "#fff");
    yLabel.setAttribute("font-size", "14");
    yLabel.textContent = "Taux pour mille";
    svg.appendChild(yLabel);

}


/* ===================== BULLES ===================== */
// Fonction pour dessiner les bulles représentant les régions pour une année donnée
function dessinbullesRegion(data, annee) {

    // Récupération du conteneur de la visualisation
    var contenu = document.querySelector(".graph");
    if (!contenu) return; // Si le conteneur n'existe pas, on quitte

    // On vide le conteneur avant de dessiner
    contenu.innerHTML = "";

    // Création de l'élément SVG pour les axes
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 800);
    svg.setAttribute("height", 600);
    svg.style.position = "absolute";
    contenu.appendChild(svg);

    // Regroupement des données par code région
    var groupe = {};

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.annee !== annee) continue; // On ne prend que l'année sélectionnée

        var code = item.Code_region;
        if (!groupe[code]) {
            // Initialisation des totaux pour chaque région
            groupe[code] = { totalVictimes: 0, totalTaux: 0, totalPop: 0, count: 0 };
        }

        // Accumulation des valeurs
        groupe[code].totalVictimes += item.nombre;
        groupe[code].totalTaux += parseTaux(item.taux_pour_mille);
        groupe[code].totalPop += item.insee_pop;
        groupe[code].count++;
    }

    // Transformation des données groupées en tableau
    var regionsData = [];
    for (var code in groupe) {
        var d = groupe[code];
        regionsData.push({
            code: code,
            nombre: d.totalVictimes,
            insee_pop: d.totalPop / d.count, // Moyenne de la population
            taux_pour_mille: d.totalTaux / d.count // Moyenne du taux
        });
    }

    // Recherche des valeurs maximales pour l'échelle des axes et des bulles
    var maxPop = 0;
    var maxTaux = 0;
    var maxVictimes = 0;
    for (var i = 0; i < regionsData.length; i++) {
        if (regionsData[i].insee_pop > maxPop) maxPop = regionsData[i].insee_pop;
        if (regionsData[i].taux_pour_mille > maxTaux) maxTaux = regionsData[i].taux_pour_mille;
        if (regionsData[i].nombre > maxVictimes) maxVictimes = regionsData[i].nombre;
    }

    // Dessin des axes dans le SVG
    Axes(svg, maxPop, maxTaux);

    // Boucle pour créer chaque bulle représentant une région
    for (var i = 0; i < regionsData.length; i++) {
        var d = regionsData[i];
        // Calcul de la position et du rayon de la bulle
        var cx = (d.insee_pop / maxPop) * 700 + 50; // X proportionnel à la population
        var cy = 550 - (d.taux_pour_mille / maxTaux) * 500; // Y proportionnel au taux
        var r = (d.nombre / maxVictimes) * 86.5 + 5; // Rayon proportionnel au nombre de victimes

        // Création de la bulle comme div
        var bulle = document.createElement("div");
        bulle.style.position = "absolute";
        bulle.style.left = (cx - r) + "px";
        bulle.style.top = (cy - r) + "px";
        bulle.style.width = (r * 2) + "px";
        bulle.style.height = (r * 2) + "px";
        bulle.style.borderRadius = "50%";
        bulle.style.background = "radial-gradient(circle, #FA3737, #530505)";
        bulle.style.cursor = "pointer";

        // Gestion de l'affichage de la bulle au survol
        bulle.addEventListener("mouseenter", function (event) {
            bulleInfo.style.display = "block";
            var code = this.getAttribute("data-code");
            var region = findRegionByCode(code, regionsData);
            bulleInfo.innerHTML = "<strong>" + regions[region.code] + "</strong><br>" +
                "Victimes : " + region.nombre + "<br>" +
                "Population : " + Math.round(region.insee_pop) + "<br>" +
                "Taux : " + region.taux_pour_mille.toFixed(3);
        });

        // Déplacement de la bulle avec la souris
        bulle.addEventListener("mousemove", function (event) {
            bulleInfo.style.left = event.pageX + 15 + "px";
            bulleInfo.style.top = event.pageY + 15 + "px";
        });

        // Masquage de la bulle quand la souris quitte la bulle
        bulle.addEventListener("mouseleave", function (event) {
            bulleInfo.style.display = "none";
        });

        // Association du code région à la bulle
        bulle.setAttribute("data-code", d.code);
        contenu.appendChild(bulle);
    }
}

// Fonction pour retrouver les données d'une région à partir de son code
function findRegionByCode(code, regionsData) {
    for (var i = 0; i < regionsData.length; i++) {
        if (regionsData[i].code === code) return regionsData[i];
    }
    return null;
}


/* ===================== UPDATE ===================== */
// Fonction pour mettre à jour les bulles et le top 5
function updatebulles() {
    if (!jsonData.length) return; // Si pas de données, on quitte
    afficherTop5Total(jsonData); // Met à jour le top 5 des victimes
    dessinbullesRegion(jsonData, anneeActuel); // Dessine les bulles pour l'année actuelle
}


/* ===================== COLORATION CARTE DE FRANCE + LEGENDES ===================== */
function updateMap(annee) {
    if (!jsonData.length) return; // Vérifie la présence de données

    // Calcul du taux moyen par région
    var groupe = {};
    for (var i = 0; i < jsonData.length; i++) {
        var item = jsonData[i];
        if (item.annee !== annee) continue; // On ne prend que l'année sélectionnée
        var code = item.Code_region;
        var taux = parseTaux(item.taux_pour_mille); // Conversion du taux en nombre

        if (!groupe[code]) groupe[code] = { totalTaux: 0, count: 0 }; // Initialisation
        groupe[code].totalTaux += taux; // Somme des taux
        groupe[code].count += 1; // Compte le nombre d'éléments pour la moyenne
    }

    // Calcul du taux moyen par région
    var regionTaux = {};
    for (var code in groupe) {
        var val = groupe[code];
        regionTaux[code] = val.totalTaux / val.count; // Moyenne du taux
    }

    // Définir les tranches de couleur pour la carte
    var couleurs = [
        { min: 0, max: 1.2, color: "#F79494" },
        { min: 1.2, max: 2.2, color: "#F25A5A" },
        { min: 2.2, max: 3.2, color: "#E02424" },
        { min: 3.2, max: Infinity, color: "#7A1414" }
    ];

    // Fonction pour obtenir la couleur selon la valeur du taux
    function getColor(value) {
        if (!value) return "#eee"; // Couleur par défaut si pas de donnée
        for (var i = 0; i < couleurs.length; i++) {
            var tranche = couleurs[i];
            if (value >= tranche.min && value < tranche.max) return tranche.color;
        }
        return "#000"; // Sécurité si aucune tranche ne correspond
    }

    // Appliquer la couleur à chaque région sur la carte
    for (var code in regions) {
        var pathGroupe = document.getElementById(code); // Récupère l'élément SVG correspondant à la région
        if (!pathGroupe) continue; // Si la région n'existe pas, on passe

        var couleur = getColor(regionTaux[code]); // Détermine la couleur selon le taux

        if (pathGroupe.tagName === "G") { // Si c'est un groupe de chemins
            var path = pathGroupe.querySelector("path");
            if (path) path.style.fill = couleur; // Colorie le chemin principal
        } else {
            pathGroupe.style.fill = couleur; // Sinon colorie directement l'élément
        }
    }

    // Créer la légende dynamique
    var legende = document.querySelector(".legende");
    if (legende) {
        legende.innerHTML = ""; // Reset de la légende
        for (var i = 0; i < couleurs.length; i++) {
            var tranche = couleurs[i];

            var item = document.createElement("div");
            item.style.display = "flex"; // Affichage horizontal
            item.style.alignItems = "center"; // Alignement vertical centré
            item.style.marginBottom = "4px";

            var box = document.createElement("div"); // Carré de couleur
            box.style.width = "20px";
            box.style.height = "20px";
            box.style.backgroundColor = tranche.color;
            box.style.marginRight = "8px";

            var label = document.createElement("span"); // Texte de la tranche
            label.textContent = tranche.min + " - " + tranche.max;

            item.appendChild(box); // Ajout du carré
            item.appendChild(label); // Ajout du texte
            legende.appendChild(item); // Ajout de l'élément complet dans la légende
        }
    }
}


/* ===================== ANNÉES ===================== */
// Fonction pour initialiser les boutons permettant de changer l'année
function initAnnee() {
    // Récupère tous les div correspondant aux années
    var boutons = document.querySelectorAll(".annees div");

    // Boucle sur chaque bouton pour ajouter un événement au clic
    for (var i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function () {

            // Retirer la classe "active" du bouton précédemment sélectionné
            var active = document.querySelector(".annees .active");
            if (active) active.classList.remove("active");

            // Ajouter la classe "active" au bouton cliqué
            this.classList.add("active");

            // Mettre à jour l'année actuelle avec le texte du bouton (converti en nombre)
            anneeActuel = Number(this.textContent);

            // Mettre à jour les bulles et la carte pour refléter la nouvelle année
            updatebulles();
            updateMap(anneeActuel);

            // Scroll vers la section 4
            const sectionPart4 = document.querySelector(".part4");
            if (sectionPart4) {
                sectionPart4.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }
}

