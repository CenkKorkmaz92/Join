let contacts = [];

// Referenzen zu HTML-Elementen
const popup = document.getElementById("popup");
const addContactBtn = document.getElementById("addContactBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const contactList = document.getElementById("contactList");

// Öffnet das Popup
addContactBtn.addEventListener("click", function() {
    popup.style.display = "flex";
});

// Popup schließen und Eingaben leeren
clearBtn.addEventListener("click", function() {
    clearInputs();
    popup.style.display = "none";
});

// Speichert den Kontakt
saveBtn.addEventListener("click", function() {
    let name = nameInput.value.trim();
    let email = emailInput.value.trim();
    let phone = phoneInput.value.trim();

    if (name === "" || email === "" || phone === "") {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    // Kontakt ins Array speichern
    let newContact = { name, email, phone };
    contacts.push(newContact);

    // Neuen Kontakt anzeigen
    renderContacts();

    // Eingaben leeren & Popup schließen
    clearInputs();
    popup.style.display = "none";
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

    contacts.forEach((contact, index) => {
        const contactDiv = document.createElement("div");
        contactDiv.classList.add("contact");

        contactDiv.innerHTML = `
            <span>${contact.name} - ${contact.email} - ${contact.phone}</span>
            <button class="delete-btn" onclick="removeContact(${index})">X</button>
        `;

        contactList.appendChild(contactDiv);
    });
}

// Löscht einen Kontakt
function removeContact(index) {
    contacts.splice(index, 1);
    renderContacts();
}