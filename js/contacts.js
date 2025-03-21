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
    const firebaseKey = responseData.name;
    contact.id = firebaseKey;
    await fetch(`${FIREBASE_BASE_URL}/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });

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
    await removeContactFromAllTasks(contactId);
    showDeleteSuccessPopup();
  } catch (error) {
    console.error("Error deleting contact:", error.message);
  }
}

/**
 * Removes a given contact from all tasks' assignedTo arrays.
 */
async function removeContactFromAllTasks(contactId) {
  const tasksUrl = "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";
  const resp = await fetch(tasksUrl);
  const tasksData = await resp.json();
  if (!tasksData) return;
  const updates = {};
  for (const [taskKey, taskObj] of Object.entries(tasksData)) {
    if (Array.isArray(taskObj.assignedTo)) {
      const newAssigned = taskObj.assignedTo.filter(c => c.id !== contactId);
      if (newAssigned.length !== taskObj.assignedTo.length) {
        updates[taskKey] = { ...taskObj, assignedTo: newAssigned };
      }
    }
  }
  if (Object.keys(updates).length > 0) {
    await fetch(tasksUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
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

/**
 * Displays the contact details in the UI.
 * It updates the current contact, shows the contact container,
 * updates the display with the contact's information, sets the delete button attribute,
 * and adjusts the layout for responsive design.
 *
 * @param {Object} contact - The contact object containing details such as fullName, email, phone, initials, and color.
 */
function showContactDetails(contact) {
  currentContact = contact;
  showContactContainer();
  updateContactDisplay(contact);
  setContactDeleteButton(contact.id);
  handleResponsiveLayout();
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

document.getElementById("addContactBtn").onclick = function () {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";
  popup.classList.remove("fly-in");
  void popup.offsetWidth;
  popup.classList.add("fly-in");
};

/**
 * Event handler for the "clearBtn" button click event.
 * This function is triggered when the user clicks the "clearBtn" button.
 * It calls the `closeWindow` function to close the current window or popup.
 *
 * @function
 */
document.getElementById("clearBtn").onclick = function () {
  closeWindow();
};

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


/**
 * Event listener for the "saveEditBtn" button click event.
 * This function handles the process of saving an edited contact. It performs the following actions:
 * - Prevents the default form submission behavior.
 * - Validates the edit form using `isEditFormValid()`.
 * - If a contact is selected (i.e., `currentContact` is not null), it updates the current contact information.
 * - Attempts to update the contact in the API, update the contact list, and refresh the display with the new contact data.
 * - If an error occurs during the API update, it logs the error to the console.
 *
 * @async
 * @function
 * @param {Event} event - The click event triggered by the user clicking the "saveEditBtn" button.
 */
document.getElementById("saveEditBtn").addEventListener("click", async function (event) {
  event.preventDefault();
  if (!isEditFormValid()) return;
  if (currentContact) {
    updateCurrentContact();
    try {
      await updateContactInAPI();
      updateContactList();
      closeEditPopup();
      updateContactDisplay(currentContact);
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

window.onload = function () {
  fetchContactsFromAPI();
};