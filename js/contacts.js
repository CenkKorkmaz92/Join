const FIREBASE_BASE_URL = "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts";

/**
 * Generates a unique identifier (UUID) using the current timestamp and a random number.
 * @returns {string} - A UUID string.
 */
function generateUUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Extracts the initials from a given name.
 * @param {string} name - The name from which to extract initials.
 * @returns {string} - A string of initials.
 */
function getInitials(name) {
  let nameParts = name.trim().split(/\s+/);
  return nameParts.map(part => part.charAt(0).toUpperCase()).join("");
}

/**
 * Generates a random RGB color.
 * @returns {string} - A string representing an RGB color.
 */
function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)})`;
}

/**
 * Clears the input fields for name, email, and phone, and resets error messages.
 */
function clearInputs() {
  document.getElementById("nameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("phoneInput").value = "";
  clearErrorMessages();
}

/**
 * Closes the current popup window, clears inputs, and hides success popups.
 */
function closeWindow() {
  clearInputs();
  const popup = document.getElementById("popup");
  const editPopup = document.getElementById("editPopup");
  const activePopup = popup.style.display === "flex" ? popup : editPopup.style.display === "flex" ? editPopup : null;
  if (activePopup) {
    resetPopup(activePopup);
  }
  hideSuccessPopup();
}

let contacts = [];
let selectedContactDiv = null;
let currentContact = null;

/**
 * Sends a new contact to the Firebase API and updates the contact's ID with the response.
 * @param {Object} contact - The contact object to be added.
 * @returns {Promise<Object>} - The response data from the API.
 */
async function pushContactToAPI(contact) {
  try {
    const response = await sendPostRequest(`${FIREBASE_BASE_URL}.json`, contact);
    await handleResponseErrors(response);
    const responseData = await response.json();
    contact.id = responseData.name;
    return responseData;
  } catch (error) {
    console.error("Fehler beim Senden des Kontakts an die API:", error.message);
  }
}

/**
 * Fetches all contacts from the Firebase API and processes the data.
 */
async function fetchContactsFromAPI() {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}.json`);
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der Kontakte: " + response.statusText);
    }
    const data = await response.json();
    contacts = processApiResponse(data);
    renderContacts();
  } catch (error) {
    handleFetchError(error);
  }
}

/**
 * Deletes a contact from the Firebase API and updates the local contact list.
 * @param {string} contactId - The ID of the contact to delete.
 */
async function deleteContactFromAPI(contactId) {
  try {
    const response = await sendDeleteRequest(contactId);
    await handleDeleteErrors(response);
    removeContactFromList(contactId);
    showDeleteSuccessPopup();
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts aus der API:", error.message);
  }
}

/**
 * Renders the list of contacts in the DOM, grouping them by the first letter of their names.
 */
function renderContacts() {
  const contactList = document.getElementById("contactList");
  contactList.innerHTML = "";
  const groupedContacts = groupContactsByLetter(contacts);
  Object.keys(groupedContacts)
    .sort()
    .forEach(letter => {
      contactList.appendChild(createLetterSection(letter));
      groupedContacts[letter].forEach(contact => {
        contactList.appendChild(createContactElement(contact));
      });
    });
}





function showContactDetails(contact) {
  currentContact = contact;
  // Gesamten Container anzeigen
  document.getElementById("contactDetail").style.display = "flex";
  // Detaillierten Info-Bereich anzeigen
  document.getElementById("detailedContactInfo").classList.remove("hidden");
  
  updateTextContent("contactName", contact.fullName);
  
  const contactEmailElement = document.getElementById("contactEmail");
  contactEmailElement.innerHTML = "";
  contactEmailElement.appendChild(createLinkElement(`mailto:${contact.email}`, contact.email, "email-link"));
  
  const contactPhoneElement = document.getElementById("contactPhone");
  contactPhoneElement.innerHTML = "";
  contactPhoneElement.appendChild(createLinkElement(`tel:${contact.phone}`, contact.phone, "phone-link"));
  
  updateContactCircle(contact.initials, contact.color);
  document.getElementById("deleteContactBtn")?.setAttribute("data-contact-id", contact.id);

  if (window.matchMedia("(max-width: 1275px)").matches) {
    document.getElementById("containerContact").classList.add("hidden");
    // Zusätzlich den Header ausblenden:
    document.querySelector(".contact-header").classList.add("hidden");
  }
}







/**
 * Resets the detailed contact view by clearing all displayed information.
 */
function resetContactDetail() {
  document.getElementById("contactName").innerText = "";
  document.getElementById("contactEmail").innerText = "";
  document.getElementById("contactPhone").innerText = "";
  document.getElementById("contactCircle").innerText = "";
  document.getElementById("contactCircle").style.backgroundColor = "";
}

// Event listeners for buttons
document.getElementById("addContactBtn").onclick = function () {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";
  popup.classList.remove("fly-in");
  void popup.offsetWidth;
  popup.classList.add("fly-in");
};

document.getElementById("clearBtn").onclick = function () {
  closeWindow();
};

// Handling form submission to add a new contact
document.getElementById("contactForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!isFormValid()) return;
  const newContact = createContact();
  contacts.push(newContact);
  contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
  renderContacts();
  await pushContactToAPI(newContact);
  clearInputs();
  hidePopup("popup");
  showSuccessPopup("popupSuccess", 800);
});

// Handling edit button click to save changes to a contact
document.getElementById("saveEditBtn").addEventListener("click", async function (event) {
  event.preventDefault();
  if (!isEditFormValid()) return;
  if (currentContact) {
    updateCurrentContact();
    try {
      await updateContactInAPI();
      updateContactList();
      closeEditPopup();
      location.reload();
    } catch (error) {
      console.error("Update error:", error);
    }
  }
});

/**
 * Opens a popup element with a fade-in and fly-in animation.
 *
 * This function retrieves the popup element using the provided popupId and determines
 * the element to animate based on the provided animatedSelector. For the edit popup,
 * it automatically uses the ".edit-popup-content" class instead of the passed selector.
 * It then resets any existing animation classes, forces a reflow to restart the animations,
 * and finally applies the fade-in animation to the background and the fly-in animation to the animated element.
 *
 * @param {string} popupId - The ID of the popup element to be displayed.
 * @param {string} animatedSelector - The CSS selector of the element inside the popup to animate.
 */
function openPopupGeneric(popupId, animatedSelector) {
  const popup = document.getElementById(popupId);
  const background = popup.querySelector(".background-popup");
  const effectiveSelector = popupId === "editPopup" ? ".edit-popup-content" : animatedSelector;
  const animatedElem = popup.querySelector(effectiveSelector);
  popup.style.display = "flex";
  background.classList.remove("fade-out", "fade-in");
  animatedElem.classList.remove("fly-out", "fly-in");
  void background.offsetWidth;
  void animatedElem.offsetWidth;
  background.classList.add("fade-in");
  animatedElem.classList.add("fly-in");
}

/**
 * Closes a popup with a fade-out animation.
 *
 * @param {string} popupId - The ID of the popup element to close.
 * @param {string} animatedSelector - The selector for the element to animate within the popup.
 */
function closePopupGeneric(popupId, animatedSelector) {
  const popup = document.getElementById(popupId);
  const background = popup.querySelector('.background-popup');
  const effectiveSelector = popupId === 'editPopup' ? '.edit-popup-content' : animatedSelector;
  const animatedElem = popup.querySelector(effectiveSelector);
  removeClassesAndReflow(background, 'fade-in');
  background.classList.add('fade-out');
  removeClassesAndReflow(animatedElem, 'fly-in');
  animatedElem.classList.add('fly-out');
  setTimeout(() => {
    popup.style.display = 'none';
    animatedElem.classList.remove('fly-out');
    background.classList.remove('fade-out');
  }, 250);
}

// Fetching contacts from the API when the window loads
window.onload = function () {
  fetchContactsFromAPI();
};