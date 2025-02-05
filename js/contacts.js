let contacts = [];

// HTML-Elemente abrufen
const popup = document.getElementById("popup");
const addContactBtn = document.getElementById("addContactBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const contactList = document.getElementById("contactList");

// Öffne das Popup nur, wenn auf "Add new contact" geklickt wird
addContactBtn.addEventListener("click", function () {
    popup.style.display = "flex";
});

// Popup schließen und Eingaben leeren, wenn "Abbrechen" gedrückt wird
clearBtn.addEventListener("click", function () {
    clearInputs();
    popup.style.display = "none";
});

// Speichert den Kontakt und schließt das Popup
saveBtn.addEventListener("click", function () {
    let fullName = nameInput.value.trim();
    let email = emailInput.value.trim();
    let phone = phoneInput.value.trim();

    if (fullName === "" || email === "" || phone === "") {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    let newContact = {
        fullName,
        email,
        phone,
        initials: getInitials(fullName),
        firstLetter: fullName.charAt(0).toUpperCase(), // Erster Buchstabe für Sortierung
        color: getRandomColor()
    };

    contacts.push(newContact);

    // Kontakte immer sortiert halten
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));

    renderContacts();

    clearInputs();
    popup.style.display = "none"; // Popup nach dem Speichern schließen
});

// Funktion zum Eingaben leeren
function clearInputs() {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
}

// Zeigt alle Kontakte an
function renderContacts() {
    contactList.innerHTML = "";

    let groupedContacts = {};

    // Kontakte nach Anfangsbuchstaben gruppieren
    contacts.forEach(contact => {
        let firstLetter = contact.firstLetter;
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });

    // Alphabetisch durchgehen und Kontakte rendern
    Object.keys(groupedContacts).sort().forEach(letter => {
        // Buchstabenüberschrift hinzufügen
        const letterHeader = document.createElement("div");
        letterHeader.classList.add("letter-header");
        letterHeader.innerText = letter;
        contactList.appendChild(letterHeader);

        // Kontakte unter dem jeweiligen Buchstaben anzeigen
        groupedContacts[letter].forEach(contact => {
            const contactDiv = document.createElement("div");
            contactDiv.classList.add("contact");

            contactDiv.innerHTML = `
                <div class="contact-circle" style="background: ${contact.color};">
                    ${contact.initials}
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.fullName}</div>
                    <div class="contact-email">${contact.email}</div>
                </div>
            `;

            contactList.appendChild(contactDiv);
        });
    });
}

// Erstellt Initialen aus dem Namen (z.B. "Max Mustermann" → "MM")
function getInitials(name) {
    let nameParts = name.split(" ");
    let initials = nameParts.map(part => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2); // Maximal 2 Buchstaben
}

// Generiert eine zufällige Farbe für den Kreis
function getRandomColor() {
    const colors = ["#FF5733", "#33A1FF", "#33FF57", "#FFC133", "#A133FF", "#FF33A8", "#33FFD5"];
    return colors[Math.floor(Math.random() * colors.length)];
}
