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
 * Handles input validation for the email input field.
 */
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
          editNameError.textContent = "Bitte geben Sie einen Namen ein.";
        } else if (editNameInput.validity.patternMismatch) {
          editNameError.textContent =
            "Der Name darf maximal drei Wörter enthalten und nur Buchstaben sowie Leerzeichen beinhalten.";
        }
      }
    });
}
  
/**
 * Handles input validation for the edit email input field.
 */
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
          editPhoneError.textContent = "Bitte geben Sie eine Telefonnummer ein.";
        } else if (editPhoneInput.validity.patternMismatch) {
          editPhoneError.textContent =
            "Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Zeichen, nur Zahlen, Leerzeichen und + erlaubt).";
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
