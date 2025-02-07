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

// Event-Funktionen für Buttons
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
        fullName,
        email,
        phone,
        initials: getInitials(fullName),
        firstLetter: fullName.charAt(0).toUpperCase(),
        color: getRandomColor(),
        profileImage: "/assets/img/icons/contact/contact_profile_blanco.svg" // Standardbild
    };

    contacts.push(newContact);
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));

    saveContactsToLocalStorage();
    renderContacts();
    clearInputs();
    popup.style.display = "none";
};

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

            // Klick-Event für den Kontakt
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

// Funktion zum Anzeigen der Kontaktdetails
function showContactDetails(contact) {
    let contactInfo = document.getElementById("detailedContactInfo");

    if (contactInfo) {
        contactInfo.classList.remove("hidden");
    }

    document.getElementById("contactName").innerText = contact.fullName;
    document.getElementById("contactEmail").innerText = contact.email;
    document.getElementById("contactPhone").innerText = contact.phone;

    let contactCircle = document.getElementById("contactCircle");
    contactCircle.innerText = contact.initials;
    contactCircle.style.backgroundColor = contact.color;

    document.getElementById("editContactBtn").onclick = function () {
        editContact(contact);
    };

    document.getElementById("deleteContactBtn").onclick = function () {
        deleteContact(contact);
    };
}

// Kontakt löschen
function deleteContact(contact) {
    contacts = contacts.filter(c => c.email !== contact.email);
    saveContactsToLocalStorage();
    renderContacts();
    resetContactDetail();
}

// Kontaktdetail-Felder zurücksetzen
function resetContactDetail() {
    document.getElementById("contactName").innerText = "Select a contact";
    document.getElementById("contactEmail").innerText = "";
    document.getElementById("contactPhone").innerText = "";
    document.getElementById("contactCircle").innerText = "";
    document.getElementById("contactCircle").style.backgroundColor = "transparent";
}

// Kontakt bearbeiten
function editContact(contact) {
    const editPopup = document.getElementById("editPopup");
    editPopup.style.display = "flex";

    document.getElementById("editNameInput").value = contact.fullName;
    document.getElementById("editEmailInput").value = contact.email;
    document.getElementById("editPhoneInput").value = contact.phone;

    const profileImage = document.getElementById("editProfileImage");
    profileImage.src = contact.profileImage || "/assets/img/icons/contact/contact_profile_blanco.svg";

    // Profilbild ändern
    profileImage.onclick = function () {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = function (event) {
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    };

    document.getElementById("saveEditBtn").onclick = function () {
        let updatedFullName = document.getElementById("editNameInput").value.trim();
        let updatedEmail = document.getElementById("editEmailInput").value.trim();
        let updatedPhone = document.getElementById("editPhoneInput").value.trim();

        if (updatedFullName === "" || updatedEmail === "" || updatedPhone === "") {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        contacts = contacts.filter(c => c.email !== contact.email);

        let updatedContact = {
            fullName: updatedFullName,
            email: updatedEmail,
            phone: updatedPhone,
            initials: getInitials(updatedFullName),
            firstLetter: updatedFullName.charAt(0).toUpperCase(),
            color: contact.color,
            profileImage: profileImage.src
        };

        contacts.push(updatedContact);
        contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));

        saveContactsToLocalStorage();
        renderContacts();
        showContactDetails(updatedContact);
        editPopup.style.display = "none";
    };

    document.getElementById("deleteBtn").onclick = function () {
        deleteContact(contact);
        editPopup.style.display = "none";
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
    return name.split(" ").map(part => part.charAt(0).toUpperCase()).join("").slice(0, 2);
}

// Zufällige Farbe generieren
function getRandomColor() {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}
