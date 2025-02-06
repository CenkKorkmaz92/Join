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

// Event-Funktionen direkt in die HTML-Elemente setzen
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
        color: getRandomColor()
    };

    contacts.push(newContact);
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));

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
                    selectedContactDiv.classList.remove("selected"); // Entferne die Markierung vom vorherigen Kontakt
                }
                contactDiv.classList.add("selected"); // Markiere den neuen Kontakt
                selectedContactDiv = contactDiv; // Speichere die Referenz auf den neuen Kontakt
                showContactDetails(contact);
            };

            contactList.appendChild(contactDiv);
        });
    });
}
// Funktion zum Anzeigen der Kontaktdetails
function showContactDetails(contact) {
    let contactInfo = document.getElementById("detailedContactInfo"); // Direkt auf die ID zugreifen

    if (contactInfo) {
        contactInfo.classList.remove("hidden"); // Entfernt die "hidden"-Klasse
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


function deleteContact(contact) {
    let index = contacts.findIndex(c => c.email === contact.email);
    if (index !== -1) {
        contacts.splice(index, 1);
        renderContacts();
        resetContactDetail();
    }
}

function resetContactDetail() {
    document.getElementById("contactName").innerText = "Select a contact";
    document.getElementById("contactEmail").innerText = "";
    document.getElementById("contactPhone").innerText = "";
    document.getElementById("contactCircle").innerText = "";
    document.getElementById("contactCircle").style.backgroundColor = "transparent";
}

function editContact(contact) {
    nameInput.value = contact.fullName;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;

    popup.style.display = "flex";

    saveBtn.onclick = function () {
        contact.fullName = nameInput.value.trim();
        contact.email = emailInput.value.trim();
        contact.phone = phoneInput.value.trim();
        contact.initials = getInitials(contact.fullName);
        contact.firstLetter = contact.fullName.charAt(0).toUpperCase();

        renderContacts();
        showContactDetails(contact);
        clearInputs();
        popup.style.display = "none";
    };
}

function getInitials(name) {
    let nameParts = name.split(" ");
    let initials = nameParts.map(part => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
}

function getRandomColor() {
    const colors = ["#FF5733", "#33A1FF", "#33FF57", "#FFC133", "#A133FF", "#FF33A8", "#33FFD5"];
    return colors[Math.floor(Math.random() * colors.length)];
}