/**
 * File: contactsEventListener.js
 * Description: Contains event listeners for validating contact form inputs, handling popups,
 * managing contact operations, and adapting the layout on resize.
 */

/**
 * Handles input validation for the name input field.
 */
nameInput.addEventListener("input", function () {
  const nameError = document.getElementById("nameError");
  if (nameInput.validity.valid) {
    nameError.textContent = "";
  } else {
    if (nameInput.validity.valueMissing) {
      nameError.textContent = "Please enter a name.";
    } else if (nameInput.validity.patternMismatch) {
      nameError.textContent =
        "The name may contain a maximum of three words and only letters and spaces.";
    }
  }
  checkFormValidity();
});

/**
 * Regular expression to validate email addresses.
 * The pattern checks that the email follows the standard format.
 *
 * @constant {RegExp} emailRegex - The regular expression used to validate email input.
 */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Event listener for the "input" event on the email input field.
 * Validates the email input against the emailRegex pattern and updates the button state.
 *
 * @param {Event} event - The input event triggered by the user.
 */
emailInput.addEventListener("input", function () {
  const emailError = document.getElementById("emailError");
  if (emailRegex.test(emailInput.value)) {
    emailError.textContent = "";
  } else {
    emailError.textContent =
      "Please enter a valid e-mail address (e.g. name@domain.de).";
  }
  checkFormValidity();
});

/**
 * Handles input validation for the phone input field.
 */
phoneInput.addEventListener("input", function () {
  const phoneError = document.getElementById("phoneError");
  if (phoneInput.validity.valid) {
    phoneError.textContent = "";
  } else {
    if (phoneInput.validity.valueMissing) {
      phoneError.textContent = "Please enter a telephone number.";
    } else if (phoneInput.validity.patternMismatch) {
      phoneError.textContent =
        "Please enter a valid phone number (at least 6 characters, only numbers, spaces and + allowed).";
    }
  }
  checkFormValidity();
});

// Edit contact input fields
const editNameInput = document.getElementById("editNameInput");
const editEmailInput = document.getElementById("editEmailInput");
const editPhoneInput = document.getElementById("editPhoneInput");

/**
 * Handles input validation for the edit name input field.
 */
if (editNameInput) {
  editNameInput.addEventListener("input", function () {
    const editNameError = document.getElementById("editNameError");
    if (editNameInput.validity.valid) {
      editNameError.textContent = "";
    } else {
      if (editNameInput.validity.valueMissing) {
        editNameError.textContent = "Please enter a name.";
      } else if (editNameInput.validity.patternMismatch) {
        editNameError.textContent =
          "The name may contain a maximum of three words and only letters and spaces.";
      }
    }
  });
}

/**
 * Event listener for the "input" event on the editEmailInput field.
 * Checks if the email input value matches the emailRegex pattern.
 *
 * @param {Event} event - The input event triggered by the user.
 */
if (editEmailInput) {
  editEmailInput.addEventListener("input", function () {
    const editEmailError = document.getElementById("editEmailError");
    if (emailRegex.test(editEmailInput.value)) {
      editEmailError.textContent = "";
    } else {
      editEmailError.textContent =
        "Please enter a valid e-mail address (e.g. name@domain.de).";
    }
  });
}

/**
 * Handles input validation for the edit phone input field.
 */
if (editPhoneInput) {
  editPhoneInput.addEventListener("input", function () {
    const editPhoneError = document.getElementById("editPhoneError");
    if (editPhoneInput.validity.valid) {
      editPhoneError.textContent = "";
    } else {
      if (editPhoneInput.validity.valueMissing) {
        editPhoneError.textContent = "Please enter a telephone number.";
      } else if (editPhoneInput.validity.patternMismatch) {
        editPhoneError.textContent =
          "Please enter a valid phone number (at least 6 characters, only numbers, spaces and + allowed).";
      }
    }
  });
}

/**
 * Opens the edit popup and populates it with the current contact's details.
 */
document.getElementById("editContactBtn").addEventListener("click", function () {
  if (currentContact) {
    const editPopup = document.getElementById("editPopup");
    editPopup.style.display = "flex";
    editPopup.classList.remove("fly-in");
    void editPopup.offsetWidth; // Trigger a reflow
    editPopup.classList.add("fly-in");
    editNameInput.value = currentContact.fullName;
    editEmailInput.value = currentContact.email;
    editPhoneInput.value = currentContact.phone;
    let profileCircle = document.getElementById("selectedContactProfile");
    profileCircle.innerText = currentContact.initials;
    profileCircle.style.backgroundColor = currentContact.color;
  }
});

/**
 * Deletes the currently selected contact from the API.
 */
document.getElementById("deleteContactBtn")?.addEventListener("click", async function () {
  const contactId = this.getAttribute("data-contact-id");
  if (contactId) {
    await deleteContactFromAPI(contactId);
  }
});

/**
 * Clears the edit input fields when the delete button is clicked.
 */
document.getElementById("deleteBtn").addEventListener("click", function (event) {
  event.preventDefault();
  editNameInput.value = "";
  editEmailInput.value = "";
  editPhoneInput.value = "";
});

/**
 * Adds a click event listener to the "Add Contact" button.
 * Opens the "Add Contact" popup with a fly-in animation.
 *
 * @listens click
 */
document.getElementById("addContactBtn").addEventListener("click", function () {
  openPopupGeneric("popup", ".popup-form");
});

/**
 * Adds a click event listener to the "Edit Contact" button.
 * Opens the "Edit Contact" popup with a fly-in animation.
 *
 * @listens click
 */
document.getElementById("editContactBtn").addEventListener("click", function () {
  openPopupGeneric("editPopup", ".popup-content");
});

/**
 * Event listener for the "add-new-contact-responsive" button click event.
 * Opens a generic popup when the button is clicked.
 *
 * @listens click
 */
document.querySelector(".add-new-contact-responsive").addEventListener("click", function () {
  openPopupGeneric("popup", ".popup-form");
});

/**
 * Event listener for the "back-to-contact-list-button" click event.
 * Hides the contact details view and shows the contact list.
 *
 * @listens click
 */
document.querySelector(".back-to-contact-list-button").addEventListener("click", function () {
  document.querySelector(".contact-detail").classList.add("hidden");
  document.getElementById("containerContact").classList.remove("hidden");
});

/**
 * Adds an event listener to the window object to trigger handleResize on resize events.
 */
window.addEventListener("resize", handleResize);

/**
 * Handles the window resize event to toggle the visibility of the contact list and header.
 * Shows the contact list and header when the window width is greater than 1275px.
 * Hides them when 1275px or less and a contact is selected.
 */
function handleResize() {
  if (window.innerWidth > 1275) {
    document.getElementById("containerContact").classList.remove("hidden");
    document.querySelector(".contact-header").classList.remove("hidden");
  } else if (currentContact) {
    document.getElementById("containerContact").classList.add("hidden");
    document.querySelector(".contact-header").classList.add("hidden");
  }
}

/**
 * Checks the validity of the form fields and updates the state of the "Create Contact" button.
 * The email field is validated using both its built-in validity check and the custom emailRegex.
 */
function checkFormValidity() {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled =
    !(nameInput.checkValidity() &&
      phoneInput.checkValidity() &&
      emailInput.checkValidity() &&
      emailRegex.test(emailInput.value));
}

/**
 * Clears the create contact input fields and updates the button state.
 */
function clearInputs() {
  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  checkFormValidity();
}

// Add real-time validation for enabling/disabling the "Create Contact" button.
nameInput.addEventListener("input", checkFormValidity);
emailInput.addEventListener("input", checkFormValidity);
phoneInput.addEventListener("input", checkFormValidity);

/**
 * Event listener for the "saveBtn" button click event.
 * Validates the form, creates a new contact, updates the contacts list, pushes the new contact to the API,
 * clears the inputs, hides the popup, and shows a success popup.
 *
 * @async
 * @listens click
 */
document.getElementById("saveBtn").addEventListener("click", async function () {
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

// Ensure the "Create Contact" button is disabled initially when the DOM is ready.
document.addEventListener("DOMContentLoaded", checkFormValidity);
