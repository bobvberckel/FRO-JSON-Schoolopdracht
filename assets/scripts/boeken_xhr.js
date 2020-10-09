// HTML ID ophalen.
const output = document.getElementById(`boeken`);

// XMLHttpRequest aanmaken.
const xhr = new XMLHttpRequest();

// Checkboxen voor de taalfilter.
const taalKeuze = document.querySelectorAll(`.besturing__cb-taal`);

// XMLHttpRequest instellen.
xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
        let xhrResult = JSON.parse(xhr.responseText);

        boeken.filteren(xhrResult);
        boeken.uitvoeren();
    }
}

// XMLHttpRequest open zetten en informatie meegeven.
xhr.open(`GET`, `./assets/json/boeken.json`, true);

// XMLHttpRequest versturen.
xhr.send();

const boeken = {
    // Taal filter bepalen.
    taalFilter: ["Engels", "Duits", "Nederlands"],

    // Filter uitvoeren op talen.
    filteren(gegevens) {
        this.data = gegevens.filter((bk) => {
            let bool = false;
            this.taalFilter.forEach((taal) => {
                if (bk.taal == taal) {
                    bool = true;
                }
            });

            return bool;
        });
    },

    uitvoeren() {
        let html = "";
        this.data.forEach(boek => {
            let completeTitel = "";
            if (boek.voortitel) {
                completeTitel += boek.voortitel + " ";
            }
            completeTitel += boek.titel;

            // Auteur lijstje aanmaken.
            let auteurs = "";
            boek.auteurs.forEach((schrijver, index) => {
                let tussenvoegsel = schrijver.tussenvoegsel ? schrijver.tussenvoegsel + " " : "";
                let separator = ", ";

                if (index >= boek.auteurs.length - 2) {
                    separator = " en ";
                }

                if (index >= boek.auteurs.length - 1) {
                    separator = "";
                }

                auteurs += schrijver.voornaam + " " + tussenvoegsel + schrijver.achternaam + separator;
            });

            // HTML samenstellen.
            html += `<section class="boek">`;
            html += `<img class="boek__cover" src="${boek.cover}" alt="${completeTitel}">`
            html += `<h3 class="boek__kopje">${completeTitel}</h3>`;
            html += `<p class="boek__auteurs">${auteurs}</p>`
            html += `<span class="boek__uitgave">Uitgave: ${this.datumOmzetten(boek.uitgave)}</span>`;
            html += `<span class="boek__ean">EAN: ${boek.ean}</span>`;
            html += `<span class="boek__paginas">Aantal bladzijdes: ${boek.paginas}</span>`;
            html += `<span class="boek__taal">Taal: ${boek.taal}</span>`;
            html += `<div class="boek__prijs">Prijs: ${boek.prijs.toLocaleString(`nl-NL`, {currency: 'EUR', style: 'currency'})}</div>`;
            html += `</section>`;
        });
        output.innerHTML = html;
    },

    datumOmzetten(datumString) {
        let datum = new Date(datumString);
        let jaar = datum.getFullYear();
        let maand = this.geefMaandnaam(datum.getMonth());

        return `${maand} ${jaar}`;
    },

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
        return maand;
    }
}

const pasFilterAan = () => {
    let gecheckteTaalKeuze = [];
    taalKeuze.forEach(cb => {
        if (cb.checked) gecheckteTaalKeuze.push(cb.value);
    });

    boeken.taalFilter = gecheckteTaalKeuze;
    boeken.filteren(JSON.parse(xhr.responseText));
    boeken.uitvoeren();
}

taalKeuze.forEach(cb => cb.addEventListener(`change`, pasFilterAan));