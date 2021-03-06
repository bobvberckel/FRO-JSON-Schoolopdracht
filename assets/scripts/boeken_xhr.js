const output = document.getElementById(`boeken`); // HTML ID ophalen.
const xhr = new XMLHttpRequest(); // XMLHttpRequest aanmaken.
const taalKeuze = document.querySelectorAll(`.besturing__cb-taal`); // Checkboxen voor de taalfilter ophalen uit HTML.
const selectKeuze = document.querySelector(`.besturing__select`); // Input voor de dropdown ophalen uit HTML.
const aantalInWinkelwagen = document.querySelector(`.ww__aantal`);

// XMLHttpRequest instellen.
xhr.onreadystatechange = () => {
    // XMLHttpRequest gegevens afwachten.
    if (xhr.readyState == 4 && xhr.status == 200) {
        // Resultaat opslaan.
        let xhrResult = JSON.parse(xhr.responseText);

        boeken.filteren(xhrResult); // Boeken worden eerst gefilterd.
        boeken.uitvoeren(); // Boeken worden na het filteren pas uitgevoerd (Richting de HTML gestuurd).
    }
}

xhr.open(`GET`, `./assets/json/boeken.json`, true); // XMLHttpRequest open zetten en informatie meegeven.
xhr.send(); // XMLHttpRequest versturen.

// Object: Winkelwagen (ww)
const ww = {
    bestelling: [],

    // Boek toevoegen.
    boekToevoegen(obj) {
        let gevonden = this.bestelling.filter(b => b.ean == obj.ean);
        if(gevonden.length == 0) {
            obj.besteldAantal ++;
            ww.bestelling.push(obj);
        } else {
            gevonden[0].besteldAantal ++;
        }
        localStorage.wwBestelling = JSON.stringify(this.bestelling);
        this.uitvoeren();
    },

    // Data uit localStorage halen.
    dataOphalen() {
        if (localStorage.wwBestelling) {
            this.bestelling = JSON.parse(localStorage.wwBestelling);
        }
        aantalInWinkelwagen.innerHTML = ww.bestelling.length;
        this.uitvoeren();
    },

    uitvoeren() {
        let html = "<table>";
        let totaal = 0;
        let totaalBesteld = 0;
        this.bestelling.forEach(boek => {
            let completeTitel = "";
            if (boek.voortitel) { // Als een boek een voortitel heeft, wordt deze vóór de originele titel geplaatst.
                completeTitel += boek.voortitel + " ";
            }
            completeTitel += boek.titel;

            html += "<tr>";
            html += `<td><img src="${boek.cover}" alt="${completeTitel}" class="bestelFormulier__cover"></td>`;
            html += `<td>${completeTitel}</td>`;
            html += `<td class="bestelFormulier__aantal">
            <i class="fas fa-arrow-down bestelFormulier__verlaag" data-role="${boek.ean}"></i>
            ${boek.besteldAantal}
            <i class="fas fa-arrow-up bestelFormulier__verhoog" data-role="${boek.ean}"></i></td>`;
            html += `<td>${boek.prijs.toLocaleString(`nl-NL`, {currency: 'EUR', style: 'currency'})}</td>`;
            html += `<td class="bestelFormulier__trash"><i class="fas fa-times bestelFormulier__trash" data-role="${boek.ean}"></i></td>`;
            html += "</tr>";

            totaal += boek.prijs * boek.besteldAantal;
            totaalBesteld += boek.besteldAantal;
        });

        html += `<tr><td>Totaal</td><td>${totaal.toLocaleString(`nl-NL`, {currency: 'EUR', style: 'currency'})}</td></tr>`;
        html += "</table>";

        document.getElementById(`uitvoer`).innerHTML = html;
        aantalInWinkelwagen.innerHTML = totaalBesteld;
        this.trashActiveren();
        this.hogerLagerActiveren();
    },

    trashActiveren() {
        document.querySelectorAll(".bestelFormulier__trash").forEach(trash => {
            trash.addEventListener("click", e => {
                let teVerwijderenBoekID = e.target.getAttribute('data-role');
                this.bestelling = this.bestelling.filter(bk => bk.ean != teVerwijderenBoekID);
                // Bijwerken van de localstorage.
                localStorage.wwBestelling = JSON.stringify(this.bestelling);
                this.uitvoeren(); 
            });
        });
    },

    hogerLagerActiveren() {
        let hogerKnoppen = document.querySelectorAll(".bestelFormulier__verhoog");
        hogerKnoppen.forEach(knop => {
            knop.addEventListener("click", e => {
                let ophoogID = e.target.getAttribute('data-role');
                let opTeHogenBoek = this.bestelling.filter(boek => boek.ean == ophoogID);
                opTeHogenBoek[0].besteldAantal ++;
                localStorage.wwBestelling = JSON.stringify(this.bestelling);
                this.uitvoeren();
            });
        });

        let lagerKnoppen = document.querySelectorAll(".bestelFormulier__verlaag");
        lagerKnoppen.forEach(knop => {
            knop.addEventListener("click", e => {
                let verlaagID = e.target.getAttribute('data-role');
                let teVerlagenBoek = this.bestelling.filter(boek => boek.ean == verlaagID);
                if(teVerlagenBoek[0].besteldAantal > 1) {
                    teVerlagenBoek[0].besteldAantal --;
                } else {
                    this.bestelling = this.bestelling.filter(bk => bk.ean != verlaagID);
                }
                localStorage.wwBestelling = JSON.stringify(this.bestelling);
                this.uitvoeren();
            });
        });
    }
}
ww.dataOphalen();

aantalInWinkelwagen.innerHTML = ww.bestelling.length;

// Object: Boeken
const boeken = {
    taalFilter: ["Engels", "Duits", "Nederlands"], // Taalfilter bepalen.
    eigenschapSorteren: 'titel', // Eigenschapfilter bepalen.
    oplopend: 1, // Oplopende functie activeren of deactiveren.

    // Filter uitvoeren op talen.
    filteren(gegevens) {
        this.data = gegevens.filter((bk) => {
            // Filter proces.
            let bool = false; // Standaard value instellen.
            this.taalFilter.forEach((taal) => { // Door elke boektaal loopen.
                if (bk.taal == taal) {
                    bool = true;
                }
            });

            return bool; // Return result.
        });
    },

    // Sorteer functie.
    sorteren() {
        if (this.eigenschapSorteren == `titel`) { // Sorteren op titel.
            this.data.sort((a, b) => (a.titel.toUpperCase() > b.titel.toUpperCase()) ? this.oplopend : -1 * this.oplopend);
        } else if (this.eigenschapSorteren == `paginas`) { // Sorteren op pagina's.
            this.data.sort((a, b) => (a.paginas > b.paginas) ? this.oplopend : -1 * this.oplopend);
        } else if (this.eigenschapSorteren == `uitgave`) { // Sorteren op uitgave.
            this.data.sort((a, b) => (a.uitgave > b.uitgave) ? this.oplopend : -1 * this.oplopend);
        } else if (this.eigenschapSorteren == `prijs`) { // Sorteren op prijs.
            this.data.sort((a, b) => (a.prijs > b.prijs) ? this.oplopend : -1 * this.oplopend);
        } else if (this.eigenschapSorteren == `auteur`) {
            this.data.sort((a, b) => (a.auteurs[0].achternaam.toUpperCase() > b.auteurs[0].achternaam.toUpperCase()) ? this.oplopend : -1 * this.oplopend); // Sorteren op auteur.
        }
    },

    // Startup functie.
    uitvoeren() {
        this.sorteren(); // Beginnen met sorteren.

        let html = "";
        this.data.forEach(boek => {

            boek.besteldAantal = 0;

            let completeTitel = "";
            if (boek.voortitel) { // Als een boek een voortitel heeft, wordt deze vóór de originele titel geplaatst.
                completeTitel += boek.voortitel + " ";
            }
            completeTitel += boek.titel;

            // Auteur lijstje aanmaken.
            let auteurs = "";
            boek.auteurs.forEach((schrijver, index) => {
                let tussenvoegsel = schrijver.tussenvoegsel ? schrijver.tussenvoegsel + " " : ""; // Kijken of er een tussenvoegsel is, zo ja wordt deze toegevoegd.
                let separator = ", "; // Mochten er meerdere schrijvers zijn, worden die schrijvers geseperateerd met een komma.

                if (index >= boek.auteurs.length - 2) {
                    separator = " en "; // Als het de laatste schrijver is, worden die schrijvers geseperateerd met een "en".
                }

                if (index >= boek.auteurs.length - 1) {
                    separator = ""; // Default separator.
                }

                auteurs += schrijver.voornaam + " " + tussenvoegsel + schrijver.achternaam + separator; // Auteurs mét voortitel, tussenvoegsel, achternaam en separator toevoegen.
            });

            // HTML samenstellen.
            html += `<section class="boek">`;
            html += `<img class="boek__cover" src="${boek.cover}" alt="${completeTitel}">`
            html += `<div class="boek__info">`;
            html += `<h3 class="boek__kopje">${completeTitel}</h3>`;
            html += `<p class="boek__auteurs">${auteurs}</p>`
            html += `<span class="boek__uitgave">Uitgave: ${this.datumOmzetten(boek.uitgave)}</span>`;
            html += `<span class="boek__ean">EAN: ${boek.ean}</span>`;
            html += `<span class="boek__paginas">Aantal bladzijdes: ${boek.paginas}</span>`;
            html += `<span class="boek__taal">Taal: ${boek.taal}</span>`;
            html += `<div class="boek__prijs">Prijs: ${boek.prijs.toLocaleString(`nl-NL`, {currency: 'EUR', style: 'currency'})}
                    <a href="#" class="boek__bestel-knop" data-role="${boek.ean}">Bestellen</a></div>`;
            html += `</div></section>`;
        });
        output.innerHTML = html; // Output tonen op de website.
        document.querySelectorAll(`.boek__bestel-knop`).forEach(knop => {
            knop.addEventListener(`click`, e => {
                e.preventDefault();

                let boekID = e.target.getAttribute(`data-role`);
                let gekliktBoek = this.data.filter(b => b.ean == boekID);
                ww.boekToevoegen(gekliktBoek[0]);
            });
        });
    },

    // Datum in de juiste formaat zetten.
    datumOmzetten(datumString) {
        let datum = new Date(datumString); // Datum variabele aanmaken.
        let jaar = datum.getFullYear(); // Jaar ophalen uit datum variabele.
        let maand = this.geefMaandnaam(datum.getMonth()); // Maand ophalen  uit datum variabele door middel van de JSON data.

        return `${maand} ${jaar}`; // Data terug sturen.
    },

    // Maand nummer omzetten naar een maand naam.
    geefMaandnaam(m) {
        let maand = "";
        switch (m) {
            case 0:
                maand = `januari`;
                break;
            case 1:
                maand = `februari`;
                break;
            case 2:
                maand = `maart`;
                break;
            case 3:
                maand = `april`;
                break;
            case 4:
                maand = `mei`;
                break;
            case 5:
                maand = `juni`;
                break;
            case 6:
                maand = `juli`;
                break;
            case 7:
                maand = `augustus`;
                break;
            case 8:
                maand = `september`;
                break;
            case 9:
                maand = `oktober`;
                break;
            case 10:
                maand = `november`;
                break;
            case 11:
                maand = `december`;
                break;
            default:
                maand = m;
        }
        return maand; // Data terug sturen.
    }
}

// Filter aanpassen naar gebruiker voorkeur.
const pasFilterAan = () => {
    let gecheckteTaalKeuze = []; // Array aanmaken voor de gekozen talen.
    taalKeuze.forEach(cb => { // Lopen door de gekozen taalkeuzes.
        if (cb.checked) gecheckteTaalKeuze.push(cb.value); // Gekozen taalkeuzes in de array zetten.
    });

    boeken.taalFilter = gecheckteTaalKeuze; // Array wegpushen naar uitvoer functie.
    boeken.filteren(JSON.parse(xhr.responseText)); // Array in JS taal omzetten.
    boeken.uitvoeren(); // Uitvoer functie opnieuw uitvoeren.
}

// Sorteren op eigenschappen gekozen door de gebruiker.
const pasSortEigenschapAan = () => {
    boeken.eigenschapSorteren = selectKeuze.value; // Gekozen eigenschappen doorsturen naar uitvoer functie.
    boeken.uitvoeren(); // Uitvoer functie opnieuw uitvoeren.
}

taalKeuze.forEach(cb => cb.addEventListener(`change`, pasFilterAan));

selectKeuze.addEventListener(`change`, pasSortEigenschapAan);

// Oplopend / Aflopend functie uitvoeren. 
document.querySelectorAll(`.besturing__rb`).forEach(rb => rb.addEventListener(`change`, () => {
    boeken.oplopend = rb.value; // Eigenschap doorsturen naar uitvoer functie.
    boeken.uitvoeren(); // Uitvoer functie opnieuw uitvoeren.
}));