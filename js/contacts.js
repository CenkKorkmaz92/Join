const FIREBASE_BASE_URL = "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts";

// Hilfsfunktionen
function generateUUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getInitials(name) {
  let nameParts = name.trim().split(/\s+/);
  return nameParts.map(part => part.charAt(0).toUpperCase()).join("");
}

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)})`;
}

function clearInputs() {
  document.getElementById("nameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("phoneInput").value = "";
  clearErrorMessages();
}

function clearErrorMessages() {
  // Fehlermeldungen im Add-Formular zurücksetzen
  document.getElementById("nameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("phoneError").textContent = "";
  // Fehlermeldungen im Edit-Formular zurücksetzen (falls vorhanden)
  const editNameErr = document.getElementById("editNameError");
  const editEmailErr = document.getElementById("editEmailError");
  const editPhoneErr = document.getElementById("editPhoneError");
  if (editNameErr) editNameErr.textContent = "";
  if (editEmailErr) editEmailErr.textContent = "";
  if (editPhoneErr) editPhoneErr.textContent = "";
}

function closeWindow() {
  clearInputs();
  document.getElementById("popup").style.display = "none";
  document.getElementById("editPopup").style.display = "none";
  const popupSuccess = document.getElementById("popupSuccess");
  if (popupSuccess) {
    popupSuccess.style.display = "none";
  }
}

// Globale Variablen
let contacts = [];
let selectedContactDiv = null;
let currentContact = null;

// API-Funktionen
async function pushContactToAPI(contact) {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API-Fehler: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const responseData = await response.json();
    console.log("Kontakt erfolgreich gespeichert:", responseData);
    // Firebase liefert den neuen Key in responseData.name
    contact.id = responseData.name;
    return responseData;
  } catch (error) {
    console.error("Fehler beim Senden des Kontakts an die API:", error.message);
  }
}

async function fetchContactsFromAPI() {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}.json`);
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der Kontakte: " + response.statusText);
    }
    const data = await response.json();
    if (data) {
      contacts = Object.keys(data).map(id => {
        const contact = data[id];
        contact.id = id;
        return contact;
      });
      contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
      renderContacts();
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Kontakte von der API:", error.message);
  }
}

async function deleteContactFromAPI(contactId) {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/${contactId}.json`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Kontakts: ${response.statusText}`);
    }
    console.log("Kontakt erfolgreich aus der API gelöscht.");
    contacts = contacts.filter(contact => contact.id !== contactId);
    renderContacts();
    resetContactDetail();
    const popupDelete = document.getElementById("popupDelete");
    if (popupDelete) {
      popupDelete.style.display = "flex";
      setTimeout(() => {
        popupDelete.style.display = "none";
        location.reload();
      }, 800);
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts aus der API:", error);
  }
}

// Rendering der Kontaktliste
function renderContacts() {
  const contactList = document.getElementById("contactList");
  contactList.innerHTML = "";
  let groupedContacts = {};
  contacts.forEach(contact => {
    let firstLetter = contact.fullName ? contact.fullName.charAt(0).toUpperCase() : "#";
    if (!groupedContacts[firstLetter]) {
      groupedContacts[firstLetter] = [];
    }
    groupedContacts[firstLetter].push(contact);
  });
  Object.keys(groupedContacts)
    .sort()
    .forEach(letter => {
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
  currentContact = contact;
  document.getElementById("detailedContactInfo")?.classList.remove("hidden");
  document.getElementById("contactName").innerText = contact.fullName;
  document.getElementById("contactEmail").innerText = contact.email;
  document.getElementById("contactPhone").innerText = contact.phone;
  const contactCircle = document.getElementById("contactCircle");
  contactCircle.innerText = contact.initials;
  contactCircle.style.backgroundColor = contact.color;
  const deleteButton = document.getElementById("deleteContactBtn");
  deleteButton.setAttribute("data-contact-id", contact.id);
}

function resetContactDetail() {
  document.getElementById("contactName").innerText = "";
  document.getElementById("contactEmail").innerText = "";
  document.getElementById("contactPhone").innerText = "";
  document.getElementById("contactCircle").innerText = "";
  document.getElementById("contactCircle").style.backgroundColor = "";
}

// Inline-Validierung für das Add-Formular
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");

nameInput.addEventListener("input", function () {
  const nameError = document.getElementById("nameError");
  if (nameInput.validity.valid) {
    nameError.textContent = "";
  } else {
    if (nameInput.validity.valueMissing) {
      nameError.textContent = "Bitte geben Sie einen Namen ein.";
    } else if (nameInput.validity.patternMismatch) {
      nameError.textContent =
        "Der Name darf maximal drei Wörter enthalten und nur Buchstaben sowie Leerzeichen beinhalten.";
    }
  }
});

emailInput.addEventListener("input", function () {
  const emailError = document.getElementById("emailError");
  if (emailInput.validity.valid) {
    emailError.textContent = "";
  } else {
    if (emailInput.validity.valueMissing) {
      emailError.textContent = "Bitte geben Sie eine E-Mail-Adresse ein.";
    } else if (emailInput.validity.typeMismatch || emailInput.validity.patternMismatch) {
      emailError.textContent =
        "Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@domain.de).";
    }
  }
});

phoneInput.addEventListener("input", function () {
  const phoneError = document.getElementById("phoneError");
  if (phoneInput.validity.valid) {
    phoneError.textContent = "";
  } else {
    if (phoneInput.validity.valueMissing) {
      phoneError.textContent = "Bitte geben Sie eine Telefonnummer ein.";
    } else if (phoneInput.validity.patternMismatch) {
      phoneError.textContent =
        "Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Zeichen, nur Zahlen, Leerzeichen und + erlaubt).";
    }
  }
});

// Inline-Validierung für das Edit-Formular
const editNameInput = document.getElementById("editNameInput");
const editEmailInput = document.getElementById("editEmailInput");
const editPhoneInput = document.getElementById("editPhoneInput");

if (editNameInput) {
  editNameInput.addEventListener("input", function () {
    const editNameError = document.getElementById("editNameError");
    if (editNameInput.validity.valid) {
      editNameError.textContent = "";
    } else {
      if (editNameInput.validity.valueMissing) {
        editNameError.textContent = "Bitte geben Sie einen Namen ein.";
      } else if (editNameInput.validity.patternMismatch) {
        editNameError.textContent =
          "Der Name darf maximal drei Wörter enthalten und nur Buchstaben sowie Leerzeichen beinhalten.";
      }
    }
  });
}

if (editEmailInput) {
  editEmailInput.addEventListener("input", function () {
    const editEmailError = document.getElementById("editEmailError");
    if (editEmailInput.validity.valid) {
      editEmailError.textContent = "";
    } else {
      if (editEmailInput.validity.valueMissing) {
        editEmailError.textContent = "Bitte geben Sie eine E-Mail-Adresse ein.";
      } else if (editEmailInput.validity.typeMismatch || editEmailInput.validity.patternMismatch) {
        editEmailError.textContent =
          "Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@domain.de).";
      }
    }
  });
}

if (editPhoneInput) {
  editPhoneInput.addEventListener("input", function () {
    const editPhoneError = document.getElementById("editPhoneError");
    if (editPhoneInput.validity.valid) {
      editPhoneError.textContent = "";
    } else {
      if (editPhoneInput.validity.valueMissing) {
        editPhoneError.textContent = "Bitte geben Sie eine Telefonnummer ein.";
      } else if (editPhoneInput.validity.patternMismatch) {
        editPhoneError.textContent =
          "Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Zeichen, nur Zahlen, Leerzeichen und + erlaubt).";
      }
    }
  });
}

// Event-Listener für die Anzeige der Popups
document.getElementById("addContactBtn").onclick = function () {
  document.getElementById("popup").style.display = "flex";
};

document.getElementById("clearBtn").onclick = function () {
  closeWindow();
};

// Formular-Submit für "Add New Contact"
document.getElementById("contactForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  // Falls ein Feld ungültig ist, wird der jeweilige Input-Listener die Fehlermeldung anzeigen.
  if (!nameInput.validity.valid || !emailInput.validity.valid || !phoneInput.validity.valid) {
    return;
  }
  let fullName = nameInput.value.trim();
  let email = emailInput.value.trim();
  let phone = phoneInput.value.trim();
  if (!fullName || !email || !phone) {
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
  contacts.push(newContact);
  contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
  renderContacts();
  await pushContactToAPI(newContact);
  clearInputs();
  document.getElementById("popup").style.display = "none";
  const popupSuccess = document.getElementById("popupSuccess");
  if (popupSuccess) {
    popupSuccess.style.display = "flex";
    setTimeout(() => { popupSuccess.style.display = "none"; }, 800);
  }
});

// Event-Listener für das Löschen eines Kontakts
document.getElementById("deleteContactBtn")?.addEventListener("click", async function () {
  const contactId = this.getAttribute("data-contact-id");
  if (contactId) {
    await deleteContactFromAPI(contactId);
  }
});

// Event-Listener für das Öffnen des Edit-Popups
document.getElementById("editContactBtn").addEventListener("click", function () {
  if (currentContact) {
    document.getElementById("editPopup").style.display = "flex";
    editNameInput.value = currentContact.fullName;
    editEmailInput.value = currentContact.email;
    editPhoneInput.value = currentContact.phone;
    let profileCircle = document.getElementById("selectedContactProfile");
    profileCircle.innerText = currentContact.initials;
    profileCircle.style.backgroundColor = currentContact.color;
  } else {
    alert("Kein Kontakt ausgewählt!");
  }
});

// Event-Listener für den "Save"-Button im Edit-Popup
document.getElementById("saveEditBtn").addEventListener("click", async function (event) {
  event.preventDefault();
  // Validierung für das Edit-Formular
  if (!editNameInput.validity.valid || !editEmailInput.validity.valid || !editPhoneInput.validity.valid) {
    return;
  }
  if (currentContact) {
    let updatedName = editNameInput.value.trim();
    let updatedEmail = editEmailInput.value.trim();
    let updatedPhone = editPhoneInput.value.trim();
    if (!updatedName || !updatedEmail || !updatedPhone) {
      return;
    }
    currentContact.fullName = updatedName;
    currentContact.email = updatedEmail;
    currentContact.phone = updatedPhone;
    currentContact.initials = getInitials(updatedName);
    currentContact.firstLetter = updatedName.charAt(0).toUpperCase();
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/${currentContact.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentContact)
      });
      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren: " + response.statusText);
      }
      contacts = contacts.map(contact =>
        contact.id === currentContact.id ? currentContact : contact
      );
      renderContacts();
      document.getElementById("editPopup").style.display = "none";
      location.reload();
    } catch (error) {
      console.error("Update-Fehler:", error);
    }
  } else {
    alert("Kein Kontakt ausgewählt!");
  }
});

// Event-Listener für den "Delete"-Button im Edit-Popup (zum Leeren der Felder)
document.getElementById("deleteBtn").addEventListener("click", function (event) {
  event.preventDefault();
  editNameInput.value = "";
  editEmailInput.value = "";
  editPhoneInput.value = "";
});

// Kontakte beim Laden der Seite abrufen
window.onload = function () {
  fetchContactsFromAPI();
};
