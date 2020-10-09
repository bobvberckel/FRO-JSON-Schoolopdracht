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
            let titel = "";
            if (boek.voortitel) {
                titel += boek.voortitel + " ";
            }
            titel += boek.titel;
            html += `<h3>${titel}</h3>`;
        });
        output.innerHTML = html;
    }
}