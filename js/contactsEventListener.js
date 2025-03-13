/**
 * Handles input validation for the name input field.
 */
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
  
/**
 * Regular expression to validate email addresses.
 * The pattern checks that the email follows the standard format of:
 * - Local part (username) with letters, digits, and special characters.
 * - "@" symbol separating local and domain parts.
 * - Domain part with letters, digits, and hyphens.
 * - A dot separating the domain and top-level domain (TLD).
 * - The TLD should be at least two letters long.
 *
 * @constant {RegExp} emailRegex - The regular expression used to validate email input.
 */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Event listener for the "input" event on the `emailInput` field.
 * This function validates the email input against the `emailRegex` pattern every time the user types.
 * - If the email is valid, it clears the error message.
 * - If the email is invalid, it displays an error message prompting the user to enter a valid email address.
 *
 * @function
 * @param {Event} event - The input event triggered by the user typing in the email input field.
 */
emailInput.addEventListener("input", function () {
    const emailError = document.getElementById("emailError");
    if (emailRegex.test(emailInput.value)) {
        emailError.textContent = "";
    } else {
        emailError.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@domain.de).";
    }
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
        phoneError.textContent = "Bitte geben Sie eine Telefonnummer ein.";
      } else if (phoneInput.validity.patternMismatch) {
        phoneError.textContent =
          "Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Zeichen, nur Zahlen, Leerzeichen und + erlaubt).";
      }
    }
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
 * Event listener for the "input" event on the `editEmailInput` field.
 * This function checks if the email input value matches the `emailRegex` pattern.
 * - If the email is valid, it clears the error message.
 * - If the email is invalid, it displays an error message prompting the user to enter a valid email address.
 *
 * @function
 * @param {Event} event - The input event triggered by the user typing in the email input field.
 */
if (editEmailInput) {
  editEmailInput.addEventListener("input", function () {
    const editEmailError = document.getElementById("editEmailError");
    if (emailRegex.test(editEmailInput.value)) {
      editEmailError.textContent = "";
    } else {
      editEmailError.textContent = "Please enter a valid e-mail address (e.g. name@domain.de).";
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
};
  
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
 * When clicked, it opens the "Add Contact" popup with a fly-in animation.
 *
 * @listens click
 */
document.getElementById("addContactBtn").addEventListener("click", function () {
  openPopupGeneric("popup", ".popup-form");
});

/**
 * Adds a click event listener to the "Edit Contact" button.
 * When clicked, it opens the "Edit Contact" popup with a fly-in animation.
 *
 * @listens click
 */
document.getElementById("editContactBtn").addEventListener("click", function () {
  openPopupGeneric("editPopup", ".popup-content");
});


/**
 * Event listener for the "add-new-contact-responsive" button click event.
 * This function opens a generic popup when the button is clicked.
 * It calls the `openPopupGeneric` function, passing the popup ID ("popup") 
 * and the class of the popup form (".popup-form") as arguments.
 *
 * @function
 */
document.querySelector(".add-new-contact-responsive").addEventListener("click", function () {
  openPopupGeneric("popup", ".popup-form");
});


/**
 * Event listener for the "back-to-contact-list-button" click event.
 * This function performs the following actions:
 * - Hides the contact details view by adding the "hidden" class to the element with the class "contact-detail".
 * - Removes the "hidden" class from the contact list container (identified by the ID "containerContact"),
 *   making it visible again.
 *
 * @function
 */
document.querySelector(".back-to-contact-list-button").addEventListener("click", function () {
  document.querySelector(".contact-detail").classList.add("hidden");
  document.getElementById("containerContact").classList.remove("hidden");
});

/**
 * Adds an event listener to the window object that triggers the handleResize function
 * whenever the window is resized. This ensures that the layout adapts to changes in
 * window size.
 */
window.addEventListener('resize', handleResize);

/**
 * Handles the window resize event to toggle the visibility of the contact list and header
 * based on the current window width. If the width exceeds 1275 pixels, the contact list
 * and header are shown; otherwise, they are hidden.
 */
function handleResize() {
  if (window.innerWidth > 1275) {
    // Show the contact list and header when window width is greater than 1275px
    document.getElementById('containerContact').classList.remove('hidden');
    document.querySelector('.contact-header').classList.remove('hidden');
  } else if (currentContact) {
    // Hide the contact list and header when window width is 1275px or less
    document.getElementById('containerContact').classList.add('hidden');
    document.querySelector('.contact-header').classList.add('hidden');
  }
}

/**
 * Event listener for the "saveBtn" button click event.
 * This function performs the following actions:
 * - Validates the form input.
 * - Creates a new contact object.
 * - Adds the new contact to the contacts array.
 * - Sorts the contacts array alphabetically by fullName.
 * - Renders the updated list of contacts.
 * - Pushes the new contact to an external API asynchronously.
 * - Clears the form inputs.
 * - Hides the popup and shows a success popup for 800 milliseconds.
 *
 * @async
 * @function
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

// Initial call to set the correct visibility based on the current window size
handleResize();
