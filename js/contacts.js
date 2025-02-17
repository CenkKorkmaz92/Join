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
  return `rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})`;
}

function clearInputs() {
  document.getElementById("nameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("phoneInput").value = "";
}

function closeWindow() {
    clearInputs();
    // Beide Popups schließen:
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
    // Hier wird ".json" an die URL gehängt
    const response = await fetch(`${FIREBASE_BASE_URL}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API-Fehler: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const responseData = await response.json();
    console.log("Kontakt erfolgreich gespeichert:", responseData);
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
    const response = await fetch(`${FIREBASE_BASE_URL}/${contactId}.json`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Kontakts: ${response.statusText}`);
    }
    console.log("Kontakt erfolgreich aus der API gelöscht.");
    contacts = contacts.filter(contact => contact.id !== contactId);
    renderContacts();
    resetContactDetail();
    alert("Kontakt erfolgreich gelöscht!");
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts aus der API:", error);
    alert("Fehler beim Löschen des Kontakts. Versuche es erneut.");
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
    // Speichere den Kontakt für später
    currentContact = contact;
    
    document.getElementById("detailedContactInfo")?.classList.remove("hidden");
    document.getElementById("contactName").innerText = contact.fullName;
    document.getElementById("contactEmail").innerText = contact.email;
    document.getElementById("contactPhone").innerText = contact.phone;
    
    const contactCircle = document.getElementById("contactCircle");
    contactCircle.innerText = contact.initials;
    contactCircle.style.backgroundColor = contact.color;
    
    // Setze die Kontakt-ID im Delete-Button als data-Attribut
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

// Event-Listener
document.getElementById("addContactBtn").onclick = function () {
  document.getElementById("popup").style.display = "flex";
};

document.getElementById("clearBtn").onclick = function () {
  closeWindow();
};

document.getElementById("contactForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!this.checkValidity()) {
    this.reportValidity();
    return;
  }
  let fullName = document.getElementById("nameInput").value.trim();
  let email = document.getElementById("emailInput").value.trim();
  let phone = document.getElementById("phoneInput").value.trim();
  if (!fullName || !email || !phone) {
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

document.getElementById("deleteContactBtn")?.addEventListener("click", async function () {
    const contactId = this.getAttribute("data-contact-id");
    if (contactId) {
      await deleteContactFromAPI(contactId);
      // Seite neu laden, um die Änderungen zu reflektieren
      location.reload();
    } else {
      alert("Fehler: Keine gültige Kontakt-ID gefunden.");
    }
});
  

document.getElementById("editContactBtn").addEventListener("click", function () {
    if (currentContact) {
      // Edit-Popup sichtbar machen
      document.getElementById("editPopup").style.display = "flex";
      
      // Felder mit den Daten des ausgewählten Kontakts befüllen
      document.getElementById("editNameInput").value = currentContact.fullName;
      document.getElementById("editEmailInput").value = currentContact.email;
      document.getElementById("editPhoneInput").value = currentContact.phone;
      
      // Optional: Profil-Kreis im Edit-Popup aktualisieren
      let profileCircle = document.getElementById("selectedContactProfile");
      profileCircle.innerText = currentContact.initials;
      profileCircle.style.backgroundColor = currentContact.color;
    } else {
      alert("Kein Kontakt ausgewählt!");
    }
});

// Event-Listener für den Save-Button im Edit-Popup
document.getElementById("saveEditBtn").addEventListener("click", async function (event) {
    event.preventDefault();
    if (currentContact) {
      // Werte aus den Edit-Feldern auslesen
      let updatedName  = document.getElementById("editNameInput").value.trim();
      let updatedEmail = document.getElementById("editEmailInput").value.trim();
      let updatedPhone = document.getElementById("editPhoneInput").value.trim();
      
      if (!updatedName || !updatedEmail || !updatedPhone) {
        alert("Bitte alle Felder ausfüllen!");
        return;
      }
      
      // Lokalen Kontakt aktualisieren – gleiche ID bleibt erhalten
      currentContact.fullName = updatedName;
      currentContact.email    = updatedEmail;
      currentContact.phone    = updatedPhone;
      currentContact.initials = getInitials(updatedName);
      currentContact.firstLetter = updatedName.charAt(0).toUpperCase();
      // (Optional: currentContact.color kann beibehalten oder neu generiert werden)
      
      try {
        // Update via PUT – verwendet die bestehende ID
        const response = await fetch(`${FIREBASE_BASE_URL}/${currentContact.id}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentContact)
        });
        
        if (!response.ok) {
          throw new Error("Fehler beim Aktualisieren: " + response.statusText);
        }
        
        // Lokale Liste updaten und neu rendern
        contacts = contacts.map(contact =>
          contact.id === currentContact.id ? currentContact : contact
        );
        renderContacts();
        
        // Edit-Popup schließen
        document.getElementById("editPopup").style.display = "none";
        alert("Kontakt erfolgreich aktualisiert!");
        
        // Optional: Seite neu laden, um alle Änderungen anzuzeigen
        location.reload();
        
      } catch (error) {
        console.error("Update-Fehler:", error);
        alert("Fehler beim Aktualisieren des Kontakts!");
      }
    } else {
      alert("Kein Kontakt ausgewählt!");
    }
});

// Event-Listener für den Delete-Button im Edit-Popup (zum Leeren der Felder)
document.getElementById("deleteBtn").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("editNameInput").value  = "";
    document.getElementById("editEmailInput").value = "";
    document.getElementById("editPhoneInput").value = "";
});

// Kontakte beim Laden der Seite abrufen
window.onload = function () {
  fetchContactsFromAPI();
};