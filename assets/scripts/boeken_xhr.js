// HTML ID ophalen.
const output = document.getElementById(`boeken`);

// XMLHttpRequest aanmaken.
const xhr = new XMLHttpRequest();

// XMLHttpRequest instellen.
xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
        let xhrResult = JSON.parse(xhr.responseText);

        boeken.data = xhrResult;
        boeken.uitvoeren();
    }
}

// XMLHttpRequest open zetten en informatie meegeven.
xhr.open(`GET`, `./assets/json/boeken.json`, true);

// XMLHttpRequest versturen.
xhr.send();

const boeken = {
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
            boek.auteurs.forEach(schrijver => {
                let tussenvoegsel = schrijver.tussenvoegsel ? schrijver.tussenvoegsel + " " : "";
                let separator = " ";
                auteurs += schrijver.voornaam + " " + tussenvoegsel + schrijver.achternaam + separator;
            });

            // HTML samenstellen.
            html += `<section class="boek">`;
            html += `<img class="boek__cover" src="${boek.cover}" alt="${completeTitel}">`
            html += `<h3 class="boek__kopje">${completeTitel}</h3>`;
            html += `<p class="boek__auteurs">${auteurs}</p>`
            html += `<span class="boek__uitgave">Uitgave: ${boek.uitgave}</span>`;
            html += `<span class="boek__ean">EAN: ${boek.ean}</span>`;
            html += `<span class="boek__paginas">Aantal bladzijdes: ${boek.paginas}</span>`;
            html += `<span class="boek__taal">Taal: ${boek.taal}</span>`;
            html += `<div class="boek__prijs">Prijs: &euro;${boek.prijs}</div>`;
            html += `</section>`;
        });
        output.innerHTML = html;
    }
}