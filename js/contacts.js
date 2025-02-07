// Generiert eine eindeutige ID für jeden Kontakt
function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

let contacts = [];
let selectedContactDiv = null;

// HTML-Elemente abrufen
const popup = document.getElementById("popup");
const addContactBtn = document.getElementById("addContactBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const contactList = document.getElementById("contactList");

// Kontakte aus localStorage laden
loadContactsFromLocalStorage();

addContactBtn.onclick = function () {
    popup.style.display = "flex";
};

clearBtn.onclick = function () {
    clearInputs();
    popup.style.display = "none";
};

saveBtn.onclick = function () {
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
        profileImage: "" // Standard: leer, falls kein Bild hochgeladen wird
    };

    contacts.push(newContact);
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));

    saveContactsToLocalStorage();
    renderContacts();
    clearInputs();
    popup.style.display = "none";
};

// Eingaben leeren
function clearInputs() {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
}

// Kontakte rendern
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

// Kontaktdetails anzeigen
function showContactDetails(contact) {
    const contactInfoDiv = document.getElementById("detailedContactInfo");
    if (contactInfoDiv) {
        contactInfoDiv.classList.remove("hidden");
    } else {
        console.error("Fehler: detailedContactInfo nicht gefunden!");
    }

    document.getElementById("contactName").innerText = contact.fullName;
    document.getElementById("contactEmail").innerText = contact.email;
    document.getElementById("contactPhone").innerText = contact.phone;

    // Initialen und Hintergrundfarbe für den Kreis setzen
    let contactCircle = document.getElementById("contactCircle");
    contactCircle.innerText = contact.initials;
    contactCircle.style.backgroundColor = contact.color;

    // selectedContactProfile div anpassen (Initialen und Farbe einfügen)
    let profileDiv = document.getElementById("selectedContactProfile");
    if (profileDiv) {
        // Initialen setzen und Hintergrundfarbe festlegen
        profileDiv.innerText = contact.initials;
        profileDiv.style.backgroundColor = contact.color;
    } else {
        console.error("Fehler: selectedContactProfile nicht gefunden!");
    }

    // Buttons für Bearbeiten und Löschen
    document.getElementById("editContactBtn").onclick = function () {
        editContact(contact);
    };

    document.getElementById("deleteContactBtn").onclick = function () {
        deleteContact(contact);
    };
}

function closeWindow() {
    // Popup für Kontakterstellung schließen
    const addContactPopup = document.getElementById("popup");
    if (addContactPopup) {
        addContactPopup.style.display = "none";
    }

    // Popup für die Kontaktbearbeitung schließen
    const editContactPopup = document.getElementById("editPopup");
    if (editContactPopup) {
        editContactPopup.style.display = "none";
    }
}




// Kontakt löschen
function deleteContact(contact) {
    contacts = contacts.filter(c => c.id !== contact.id);
    saveContactsToLocalStorage();
    renderContacts();
    resetContactDetail();
}

function resetContactDetail() {
    document.getElementById("contactName").innerText = "";
    document.getElementById("contactEmail").innerText = "";
    document.getElementById("contactPhone").innerText = "";
    document.getElementById("contactCircle").innerText = "";
    document.getElementById("contactCircle").style.backgroundColor = "";
    document.getElementById("selectedContactProfile").src = "";
    const contactInfoDiv = document.getElementById("detailedContactInfo");
    if (contactInfoDiv) {
        contactInfoDiv.classList.add("hidden"); // ❗ Zeigt die Details an
    } else {
        console.error("Fehler: detailedContactInfo nicht gefunden!");
    }
}

// Kontakt bearbeiten
// Kontakt bearbeiten
function editContact(contact) {
    const editPopup = document.getElementById("editPopup");
    editPopup.style.display = "flex";

    document.getElementById("editNameInput").value = contact.fullName;
    document.getElementById("editEmailInput").value = contact.email;
    document.getElementById("editPhoneInput").value = contact.phone;

    const profileImage = document.getElementById("selectedContactProfile");
    profileImage.src = contact.profileImage || "/assets/img/icons/contact/contact_profile_blanco.svg"; // Standardbild

    // Bild ändern
    document.getElementById("selectedContactProfile").onclick = function () {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = function (event) {
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
                // Das Profilbild im Kontaktobjekt speichern
                contact.profileImage = e.target.result; // Speichern der Bild-URL
                console.log("Uploaded profile image set for contact:", contact.fullName);
                // Das Kontaktobjekt aktualisieren und in localStorage speichern
                saveContactsToLocalStorage();
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    };

    // Änderungen speichern
    document.getElementById("saveEditBtn").onclick = function () {
        let updatedFullName = document.getElementById("editNameInput").value.trim();
        let updatedEmail = document.getElementById("editEmailInput").value.trim();
        let updatedPhone = document.getElementById("editPhoneInput").value.trim();

        if (updatedFullName === "" || updatedEmail === "" || updatedPhone === "") {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        // Kontakt aktualisieren
        contacts = contacts.map(c => {
            if (c.id === contact.id) {
                return {
                    ...c,
                    fullName: updatedFullName,
                    email: updatedEmail,
                    phone: updatedPhone,
                    initials: getInitials(updatedFullName),
                    firstLetter: updatedFullName.charAt(0).toUpperCase(),
                    profileImage: profileImage.src // Profilbild speichern
                };
            }
            return c;
        });

        saveContactsToLocalStorage();
        renderContacts();
        showContactDetails(contacts.find(c => c.id === contact.id));
        editPopup.style.display = "none";
    };

    document.getElementById("deleteBtn").onclick = function () {
        clearEditInputs(); // Felder leeren
    };
}



// Kontakte in localStorage speichern
function saveContactsToLocalStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Kontakte aus localStorage laden
function loadContactsFromLocalStorage() {
    let storedContacts = localStorage.getItem("contacts");
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
        renderContacts();
    }
}

// Initialen berechnen
function getInitials(name) {
    let nameParts = name.trim().split(/\s+/);
    return nameParts.map(part => part.charAt(0).toUpperCase()).join("").slice(0, 2);
}

// Zufällige Farbe generieren
function getRandomColor() {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}


function clearEditInputs() {
    document.getElementById("editNameInput").value = "";
    document.getElementById("editEmailInput").value = "";
    document.getElementById("editPhoneInput").value = "";

    let profileImage = document.getElementById("selectedContactProfile");
    if (profileImage) {
        profileImage.src = "/assets/img/icons/contact/contact_profile_blanco.svg"; // Standardbild setzen
    }
}