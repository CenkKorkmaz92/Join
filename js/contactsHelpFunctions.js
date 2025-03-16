/**
 * Resets the popup element by removing the "fly-in" class, adding the "fly-out" class,
 * and hiding it after the animation ends.
 * @param {HTMLElement} popupElement - The popup element to reset.
 */
function resetPopup(popupElement) {
    popupElement.classList.remove("fly-in");
    popupElement.classList.add("fly-out");
    popupElement.addEventListener("animationend", function handleAnimationEnd() {
        popupElement.style.display = "none";
        popupElement.classList.remove("fly-out");
        popupElement.removeEventListener("animationend", handleAnimationEnd);
    });
}

/**
 * Hides the success popup if it is currently displayed.
 */
function hideSuccessPopup() {
    const popupSuccess = document.getElementById("popupSuccess");
    if (popupSuccess && popupSuccess.style.display === "flex") {
        popupSuccess.style.display = "none";
    }
}

/**
 * Clears all error messages from the input fields.
 */
function clearErrorMessages() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("phoneError").textContent = "";
    const editNameErr = document.getElementById("editNameError");
    const editEmailErr = document.getElementById("editEmailError");
    const editPhoneErr = document.getElementById("editPhoneError");
    if (editNameErr) editNameErr.textContent = "";
    if (editEmailErr) editEmailErr.textContent = "";
    if (editPhoneErr) editPhoneErr.textContent = "";
}

/**
 * Sends a POST request to the specified URL with the provided data.
 * @param {string} url - The URL to send the request to.
 * @param {Object} data - The data to send in the request body.
 * @returns {Promise<Response>} - The response from the server.
 */
async function sendPostRequest(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

/**
 * Handles errors from the response of an API call.
 * @param {Response} response - The response object to check for errors.
 * @throws Will throw an error if the response is not ok.
 */
async function handleResponseErrors(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Fehler: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

/**
 * Processes the API response data into an array of contacts.
 * @param {Object} data - The raw data from the API.
 * @returns {Array} - An array of contact objects.
 */
function processApiResponse(data) {
    if (!data) return [];
    const contactsArray = Object.keys(data).map(id => {
        const contact = data[id];
        contact.id = id;
        return contact;
    });
    return contactsArray.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Handles errors that occur during a fetch operation.
 * @param {Error} error - The error object to log.
 */
function handleFetchError(error) {
    console.error("Fehler beim Abrufen der Kontakte von der API:", error.message);
}

/**
 * Sends a DELETE request for a specified contact ID.
 * @param {string} contactId - The ID of the contact to delete.
 * @returns {Promise<Response>} - The response from the server.
 */
async function sendDeleteRequest(contactId) {
    const response = await fetch(`${FIREBASE_BASE_URL}/${contactId}.json`, {
        method: "DELETE"
    });
    return response;
}

/**
 * Handles errors from the response of a delete request.
 * @param {Response} response - The response object to check for errors.
 * @throws Will throw an error if the response is not ok.
 */
async function handleDeleteErrors(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Löschen des Kontakts: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

/**
 * Removes a contact from the local contacts array and re-renders the contact list.
 * @param {string} contactId - The ID of the contact to remove.
 */
function removeContactFromList(contactId) {
    contacts = contacts.filter(contact => contact.id !== contactId);
    renderContacts();
    resetContactDetail();
}

/**
 * Displays a success popup after a contact is deleted.
 */
function showDeleteSuccessPopup() {
    const popupDelete = document.getElementById("popupDelete");
    if (popupDelete) {
        popupDelete.style.display = "flex";
        setTimeout(() => {
            popupDelete.style.display = "none";
            document.getElementById("detailedContactInfo").classList.add("hidden");
        }, 800);
    }
}

/**
 * Groups contacts by the first letter of their full names.
 * @param {Array} contacts - The array of contacts to group.
 * @returns {Object} - An object with letters as keys and arrays of contacts as values.
 */
function groupContactsByLetter(contacts) {
    return contacts.reduce((grouped, contact) => {
        let firstLetter = contact.fullName ? contact.fullName.charAt(0).toUpperCase() : "#";
        if (!grouped[firstLetter]) grouped[firstLetter] = [];
        grouped[firstLetter].push(contact);
        return grouped;
    }, {});
}

/**
 * Creates a section for a specific letter in the contact list.
 * @param {string} letter - The letter for the section header.
 * @returns {HTMLElement} - The created section element.
 */
function createLetterSection(letter) {
    const section = document.createElement("div");
    const letterHeader = document.createElement("div");
    letterHeader.classList.add("letter-header");
    letterHeader.innerText = letter;
    const divider = document.createElement("hr");
    divider.classList.add("letter-divider");
    section.appendChild(letterHeader);
    section.appendChild(divider);
    return section;
}

/**
 * Updates the text content of a specified element by its ID.
 * @param {string} elementId - The ID of the element to update.
 * @param {string} text - The new text to set.
 */
function updateTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) element.innerText = text;
}

/**
 * Creates an anchor link element with specified attributes.
 * @param {string} href - The URL the link points to.
 * @param {string} text - The text to display for the link.
 * @param {string} className - The class to assign to the link element.
 * @returns {HTMLElement} - The created link element.
 */
function createLinkElement(href, text, className) {
    const link = document.createElement("a");
    link.href = href;
    link.innerText = text;
    link.classList.add(className);
    return link;
}

/**
 * Updates the contact circle with initials and background color.
 * @param {string} initials - The initials to display.
 * @param {string} color - The background color to set.
 */
function updateContactCircle(initials, color) {
    const contactCircle = document.getElementById("contactCircle");
    if (contactCircle) {
        contactCircle.innerText = initials;
        contactCircle.style.backgroundColor = color;
    }
}

/**
 * Hides a popup identified by its ID.
 * @param {string} popupId - The ID of the popup to hide.
 */
function hidePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

/**
 * Displays a success popup for a specified duration.
 * @param {string} popupId - The ID of the popup to show.
 * @param {number} duration - The duration in milliseconds to display the popup.
 */
function showSuccessPopup(popupId, duration) {
    const popupSuccess = document.getElementById(popupId);
    if (popupSuccess) {
        popupSuccess.style.display = "flex";
        setTimeout(() => { popupSuccess.style.display = "none"; }, duration);
    }
}

/**
 * Creates a new contact object based on input values.
 * @returns {Object} - The newly created contact object.
 */
function createContact() {
    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    return {
      fullName,
      email,
      phone,
      initials: getInitials(fullName),
      firstLetter: fullName.charAt(0).toUpperCase(),
      color: getRandomColor(),
      profileImage: "",
    };
  }
  

/**
 * Validates the input form for creating a contact.
 * @returns {boolean} - True if the form is valid, false otherwise.
 */
function isFormValid() {
    return nameInput.validity.valid && emailInput.validity.valid && phoneInput.validity.valid;
}

/**
 * Validates the input form for editing a contact.
 * @returns {boolean} - True if the edit form is valid, false otherwise.
 */
function isEditFormValid() {
    return editNameInput.validity.valid && editEmailInput.validity.valid && editPhoneInput.validity.valid;
}

/**
 * Updates the current contact's information based on input values.
 */
function updateCurrentContact() {
    currentContact.fullName = editNameInput.value.trim();
    currentContact.email = editEmailInput.value.trim();
    currentContact.phone = editPhoneInput.value.trim();
    currentContact.initials = getInitials(currentContact.fullName);
    currentContact.firstLetter = currentContact.fullName.charAt(0).toUpperCase();
}

/**
 * Updates the current contact in the API with the new details.
 * @throws Will throw an error if the update fails.
 */
async function updateContactInAPI() {
    const response = await fetch(`${FIREBASE_BASE_URL}/${currentContact.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentContact)
    });
    if (!response.ok) {
        throw new Error("Error updating: " + response.statusText);
    }
}

/**
 * Updates the local contact list with the modified current contact and re-renders it.
 */
function updateContactList() {
    contacts = contacts.map(contact => (contact.id === currentContact.id ? currentContact : contact));
    renderContacts();
}

/**
 * Closes the edit popup by hiding it.
 */
function closeEditPopup() {
    document.getElementById("editPopup").style.display = "none";
}

/**
 * Removes specified classes from an element and forces a reflow.
 *
 * @param {Element} element - The DOM element to modify.
 * @param {...string} classes - The classes to remove from the element.
 */
function removeClassesAndReflow(element, ...classes) {
    element.classList.remove(...classes);
    void element.offsetWidth; // Force reflow to restart CSS animations
}

/**
 * Shows the contact detail container by removing the hidden classes
 * and setting the appropriate display styles.
 */
function showContactContainer() {
    document.querySelector(".contact-detail").classList.remove("hidden");
    document.getElementById("contactDetail").style.display = "flex";
    document.getElementById("detailedContactInfo").classList.remove("hidden");
}
  
/**
 * Updates the display of the contact details using the provided contact information.
 * This includes updating the name, email, phone links, and the contact circle.
 *
 * @param {Object} contact - The contact object with details to display.
 */
function updateContactDisplay(contact) {
    updateTextContent("contactName", contact.fullName);
    const emailEl = document.getElementById("contactEmail");
    emailEl.innerHTML = "";
    emailEl.appendChild(createLinkElement(`mailto:${contact.email}`, contact.email, "email-link"));
    const phoneEl = document.getElementById("contactPhone");
    phoneEl.innerHTML = "";
    phoneEl.appendChild(createLinkElement(`tel:${contact.phone}`, contact.phone, "phone-link"));
    updateContactCircle(contact.initials, contact.color);
  }
  
  
/**
 * Sets the data attribute for the delete contact button with the given contact ID.
 *
 * @param {string} contactId - The unique identifier of the contact.
 */
function setContactDeleteButton(contactId) {
    document.getElementById("deleteContactBtn")?.setAttribute("data-contact-id", contactId);
}
  
/**
 * Adjusts the layout for responsive design.
 * If the viewport width is less than or equal to 1275px, it hides the container contact list and contact header.
 */
function handleResponsiveLayout() {
    if (window.matchMedia("(max-width: 1275px)").matches) {
      document.getElementById("containerContact").classList.add("hidden");
      document.querySelector(".contact-header").classList.add("hidden");
    }
}
