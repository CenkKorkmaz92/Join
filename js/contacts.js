// Generiert eine eindeutige ID für jeden Kontakt
function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const FIREBASE_BASE_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json"; // Direkt auf die contacts.json zugreifen


let contacts = [];
let selectedContactDiv = null;

// HTML element references
const popup = document.getElementById("popup");
const addContactBtn = document.getElementById("addContactBtn");
const clearBtn = document.getElementById("clearBtn");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const contactList = document.getElementById("contactList");
const contactForm = document.getElementById("contactForm");

// Open popup when "Add new contact" is clicked
addContactBtn.onclick = function () {
    popup.style.display = "flex";
};

// Cancel/close button: clear inputs and close the popup
clearBtn.onclick = function () {
    clearInputs();
    popup.style.display = "none";
};

async function saveContactToAPI(contact) {
    try {
        await saveDataToFirebase(contact.id, contact);
        console.log("Kontakt erfolgreich in die API gespeichert:", contact);
    } catch (error) {
        console.error("Fehler beim Speichern des Kontakts:", error);
    }
} 

async function pushContactToAPI(contact) {
    try {
        console.log("Sende Kontakt an die API:", contact);

        // Hier wird die Anfrage an den Firebase-Endpoint gesendet
        const response = await fetch(FIREBASE_BASE_URL, {
            method: "POST", // POST-Methode verwenden, um Daten hinzuzufügen
            headers: {
                "Content-Type": "application/json" // JSON-Format
            },
            body: JSON.stringify(contact) // Der Kontakt wird als JSON geschickt
        });

        if (!response.ok) {
            // Fehlerbehandlung, wenn die Anfrage nicht erfolgreich war
            const errorText = await response.text();
            throw new Error(`API-Fehler: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json(); // Die Antwort von Firebase wird als JSON verarbeitet
        console.log("Kontakt erfolgreich gespeichert:", responseData);
        return responseData; // Antwort zurückgeben (kann eine generierte ID sein)
    } catch (error) {
        console.error("Fehler beim Senden des Kontakts an die API:", error.message);
        if (error.message.includes("Failed to fetch")) {
            console.error("Überprüfe, ob die API-URL korrekt ist und die API erreichbar ist.");
        }
    }
}

async function fetchContactsFromAPI() {
    try {
        const response = await fetch(FIREBASE_BASE_URL);  // GET-Anfrage an Firebase
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Kontakte: " + response.statusText);
        }

        const data = await response.json(); // Die Antwort von Firebase wird als JSON verarbeitet

        // Überprüfe, ob Daten existieren
        if (data) {
            // Da Firebase die Daten als Objekt mit generierten IDs speichert, müssen wir sie in ein Array umwandeln
            contacts = Object.keys(data).map(id => {
                const contact = data[id];
                contact.id = id; // Firebase gibt uns die ID automatisch
                return contact;
            });

            // Kontakte sortieren und rendern
            contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
            renderContacts();
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Kontakte von der API:", error.message);
    }
}

// Rufe die Kontakte beim Laden der Seite ab
window.onload = function() {
    fetchContactsFromAPI();
};

// Funktion zum Speichern des Kontakts
async function saveContact(contact) {
    try {
        contacts.push(contact);
        contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
        renderContacts();
        await pushContactToAPI(contact);  // Schicke den Kontakt zu Firebase
        console.log("Kontakt lokal gespeichert und an API gesendet:", contact);
    } catch (error) {
        console.error("Fehler beim Speichern des Kontakts:", error);
    }
}

// Attach a submit event listener to the form
contactForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Verhindert das Neuladen der Seite

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    let fullName = nameInput.value.trim();
    let email = emailInput.value.trim();
    let phone = phoneInput.value.trim();

    if (fullName === "" || email === "" || phone === "") {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    let newContact = {
        id: generateUUID(),
        fullName,
        email,
        phone,
        initials: getInitials(fullName),
        firstLetter: fullName.charAt(0).toUpperCase(),
        color: getRandomColor(),
        profileImage: ""
    };

    await saveContact(newContact);

    clearInputs();
    popup.style.display = "none";

    const popupSuccess = document.getElementById("popupSuccess");
    popupSuccess.style.display = "flex";
    setTimeout(() => {
        popupSuccess.style.display = "none";
    }, 800);
});

function clearInputs() {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
}

function renderContacts() {
    contactList.innerHTML = "";
    let groupedContacts = {};

    contacts.forEach(contact => {
        let firstLetter = contact.firstLetter;
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });

    Object.keys(groupedContacts).sort().forEach(letter => {
        const letterHeader = document.createElement("div");
        letterHeader.classList.add("letter-header");
        letterHeader.innerText = letter;
        contactList.appendChild(letterHeader);

        const divider = document.createElement("hr");
        divider.classList.add("letter-divider");
        contactList.appendChild(divider);

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

            contactDiv.onclick = function () {
                if (selectedContactDiv) {
                    selectedContactDiv.classList.remove("selected");
                }
                contactDiv.classList.add("selected");
                selectedContactDiv = contactDiv;
                showContactDetails(contact);
            };

            contactList.appendChild(contactDiv);
        });
    });
}

function showContactDetails(contact) {
    const contactInfoDiv = document.getElementById("detailedContactInfo");
    if (contactInfoDiv) {
        contactInfoDiv.classList.remove("hidden");
    }

    document.getElementById("contactName").innerText = contact.fullName;
    document.getElementById("contactEmail").innerText = contact.email;
    document.getElementById("contactPhone").innerText = contact.phone;

    let contactCircle = document.getElementById("contactCircle");
    contactCircle.innerText = contact.initials;
    contactCircle.style.backgroundColor = contact.color;

    // Setze die Kontakt-ID im Delete-Button als data-Attribut
    const deleteButton = document.getElementById("deleteContactBtn");
    deleteButton.setAttribute("data-contact-id", contact.id); // Setze die Kontakt-ID im Button
}

document.getElementById("deleteContactBtn").addEventListener("click", function () {
    const contactId = this.getAttribute("data-contact-id");
    console.log("Kontakt-ID zum Löschen:", contactId);  // Debugging-Zeile
    if (contactId) {
        deleteContactFromAPI(contactId);
    } else {
        alert("Fehler: Keine gültige Kontakt-ID gefunden.");
    }
});

async function deleteContactFromAPI(contactId) {
    try {
        const response = await fetch(`${FIREBASE_BASE_URL}/${contactId}.json`, {
            method: 'DELETE', // DELETE-Methode verwenden
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Löschen des Kontakts: ${response.statusText}`);
        }

        console.log("Kontakt erfolgreich aus der API gelöscht.");
        
        // Optional: Kontakte lokal aktualisieren und rendern
        contacts = contacts.filter(contact => contact.id !== contactId); // Kontakt lokal entfernen
        renderContacts(); // Kontakte neu rendern
        resetContactDetail(); // Kontaktdetails zurücksetzen

        alert("Kontakt erfolgreich gelöscht!"); // Erfolgsmeldung anzeigen
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts aus der API:", error);
        alert("Fehler beim Löschen des Kontakts. Versuche es erneut.");
    }
}

// function deleteContact(contact) {
//     contacts = contacts.filter(c => c.id !== contact.id);
//     renderContacts();
//     resetContactDetail();
// }

function resetContactDetail() {
    document.getElementById("contactName").innerText = "";
    document.getElementById("contactEmail").innerText = "";
    document.getElementById("contactPhone").innerText = "";
    document.getElementById("contactCircle").innerText = "";
    document.getElementById("contactCircle").style.backgroundColor = "";
}

function getInitials(name) {
    let nameParts = name.trim().split(/\s+/); // Splitte den Namen in Wörter (nach Leerzeichen)
    return nameParts.map(part => part.charAt(0).toUpperCase()).join(""); // Nimm den ersten Buchstaben jedes Wortes und mache ihn groß
}

function getRandomColor() {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}


function clearEditInputs() {
    document.getElementById("editNameInput").value = "";
    document.getElementById("editEmailInput").value = "";
    document.getElementById("editPhoneInput").value = "";

    let profileImage = document.getElementById("selectedContactProfile");
    if (profileImage) {
        profileImage.src = "/assets/img/icons/contact/contact_profile_blanco.svg";
    }
}

function closeWindow() {
    clearInputs();  // Leert alle Eingabefelder
    popup.style.display = "none";  // Versteckt das Popup
    const popupSuccess = document.getElementById("popupSuccess");
    if (popupSuccess) {
        popupSuccess.style.display = "none"; // Versteckt auch das Success-Popup
    }
}

// Button-Event-Listener für das Schließen des Popups
clearBtn.onclick = function () {
    closeWindow();  // Popup schließen, wenn auf den Button geklickt wird
};