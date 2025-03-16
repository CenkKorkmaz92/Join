/**
 * Validates the name input field on each "input" event.
 */
nameInput.addEventListener('input', function () {
  const nameError = document.getElementById('nameError');
  if (nameInput.validity.valid) {
    nameError.textContent = '';
  } else {
    if (nameInput.validity.valueMissing) {
      nameError.textContent = 'Please enter a name.';
    } else if (nameInput.validity.patternMismatch) {
      nameError.textContent =
        'The name may contain a maximum of three words and only letters and spaces.';
    }
  }
  checkFormValidity();
});

/**
 * Regular expression to validate email addresses.
 */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Validates the email input field on each "input" event using emailRegex.
 * @param {Event} event - The input event triggered by the user.
 */
emailInput.addEventListener('input', function () {
  const emailError = document.getElementById('emailError');
  if (emailRegex.test(emailInput.value)) {
    emailError.textContent = '';
  } else {
    emailError.textContent =
      'Please enter a valid e-mail address (e.g. name@domain.de).';
  }
  checkFormValidity();
});

/**
 * Validates the phone input field on each "input" event.
 */
phoneInput.addEventListener('input', function () {
  const phoneError = document.getElementById('phoneError');
  if (phoneInput.validity.valid) {
    phoneError.textContent = '';
  } else {
    if (phoneInput.validity.valueMissing) {
      phoneError.textContent = 'Please enter a telephone number.';
    } else if (phoneInput.validity.patternMismatch) {
      phoneError.textContent =
        'Please enter a valid phone number (at least 6 characters, only numbers, spaces and + allowed).';
    }
  }
  checkFormValidity();
});

/**
 * Checks the validity of the create form fields and updates
 * the state of the "Create Contact" button.
 */
function checkFormValidity() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = !(
    nameInput.checkValidity() &&
    phoneInput.checkValidity() &&
    emailInput.checkValidity() &&
    emailRegex.test(emailInput.value)
  );
}

/**
 * Clears the create contact input fields and updates the button state.
 */
function clearInputs() {
  nameInput.value = '';
  emailInput.value = '';
  phoneInput.value = '';
  checkFormValidity();
}

/**
 * Handles the "Create Contact" button click event. Validates the form,
 * creates a new contact, updates the contacts list, pushes the new contact
 * to the API, clears inputs, hides the popup, and shows a success popup.
 * @async
 */
document.getElementById('saveBtn').addEventListener('click', async function () {
  if (!isFormValid()) return;
  const newContact = createContact();
  contacts.push(newContact);
  contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
  renderContacts();
  await pushContactToAPI(newContact);
  clearInputs();
  hidePopup('popup');
  showSuccessPopup('popupSuccess', 800);
});

document.addEventListener('DOMContentLoaded', checkFormValidity);

const editNameInput = document.getElementById('editNameInput');
const editEmailInput = document.getElementById('editEmailInput');
const editPhoneInput = document.getElementById('editPhoneInput');

/**
 * Validates the edit name input field on each "input" event.
 */
if (editNameInput) {
  editNameInput.addEventListener('input', function () {
    const editNameError = document.getElementById('editNameError');
    if (editNameInput.validity.valid) {
      editNameError.textContent = '';
    } else {
      if (editNameInput.validity.valueMissing) {
        editNameError.textContent = 'Please enter a name.';
      } else if (editNameInput.validity.patternMismatch) {
        editNameError.textContent =
          'The name may contain a maximum of three words and only letters and spaces.';
      }
    }
    checkEditFormValidity();
  });
}

/**
 * Validates the edit email input field on each "input" event using emailRegex.
 * @param {Event} event - The input event triggered by the user.
 */
if (editEmailInput) {
  editEmailInput.addEventListener('input', function () {
    const editEmailError = document.getElementById('editEmailError');
    if (emailRegex.test(editEmailInput.value)) {
      editEmailError.textContent = '';
    } else {
      editEmailError.textContent =
        'Please enter a valid e-mail address (e.g. name@domain.de).';
    }
    checkEditFormValidity();
  });
}

/**
 * Validates the edit phone input field on each "input" event.
 */
if (editPhoneInput) {
  editPhoneInput.addEventListener('input', function () {
    const editPhoneError = document.getElementById('editPhoneError');
    if (editPhoneInput.validity.valid) {
      editPhoneError.textContent = '';
    } else {
      if (editPhoneInput.validity.valueMissing) {
        editPhoneError.textContent = 'Please enter a telephone number.';
      } else if (editPhoneInput.validity.patternMismatch) {
        editPhoneError.textContent =
          'Please enter a valid phone number (at least 6 characters, only numbers, spaces and + allowed).';
      }
    }
    checkEditFormValidity();
  });
}

/**
 * Checks the validity of the edit form fields and updates
 * the state of the "Save" button in the edit form.
 */
function checkEditFormValidity() {
  const saveEditBtn = document.getElementById('saveEditBtn');
  saveEditBtn.disabled = !(
    editNameInput.checkValidity() &&
    editPhoneInput.checkValidity() &&
    editEmailInput.checkValidity() &&
    emailRegex.test(editEmailInput.value)
  );
}

/**
 * Checks if the edit form is valid.
 * @returns {boolean} True if the edit form is valid.
 */
function isEditFormValid() {
  return (
    editNameInput.checkValidity() &&
    editPhoneInput.checkValidity() &&
    editEmailInput.checkValidity() &&
    emailRegex.test(editEmailInput.value)
  );
}

/**
 * Handles the "Save" button click event in the edit form.
 * Validates the form, updates the contact, pushes the update to the API,
 * hides the edit popup, and shows a success popup.
 * @async
 * @param {Event} event - The click event triggered by the user.
 */
document.getElementById('saveEditBtn').addEventListener('click', async function (event) {
  event.preventDefault();
  if (!isEditFormValid()) return;
  const updatedContact = updateContact();
  await pushEditContactToAPI(updatedContact);
  hidePopup('editPopup');
  showSuccessPopup('popupSuccess', 800);
});

document.addEventListener('DOMContentLoaded', checkEditFormValidity);

/**
 * Opens the edit popup and populates it with the current contact's details.
 */
document.getElementById('editContactBtn').addEventListener('click', function () {
  if (currentContact) {
    const editPopup = document.getElementById('editPopup');
    editPopup.style.display = 'flex';
    editPopup.classList.remove('fly-in');
    void editPopup.offsetWidth;
    editPopup.classList.add('fly-in');
    editNameInput.value = currentContact.fullName;
    editEmailInput.value = currentContact.email;
    editPhoneInput.value = currentContact.phone;
    const profileCircle = document.getElementById('selectedContactProfile');
    profileCircle.innerText = currentContact.initials;
    profileCircle.style.backgroundColor = currentContact.color;
    checkEditFormValidity();
  }
});

/**
 * Deletes the currently selected contact from the API.
 */
document.getElementById('deleteContactBtn')?.addEventListener('click', async function () {
  const contactId = this.getAttribute('data-contact-id');
  if (contactId) {
    await deleteContactFromAPI(contactId);
  }
});

/**
 * Clears the edit input fields when the delete button is clicked.
 * @param {Event} event - The click event triggered by the user.
 */
document.getElementById('deleteBtn').addEventListener('click', function (event) {
  event.preventDefault();
  editNameInput.value = '';
  editEmailInput.value = '';
  editPhoneInput.value = '';
  checkEditFormValidity();
});

/**
 * Opens the "Add Contact" popup with a fly-in animation.
 */
document.getElementById('addContactBtn').addEventListener('click', function () {
  openPopupGeneric('popup', '.popup-form');
});

/**
 * Opens a generic popup when the "add-new-contact-responsive" button is clicked.
 */
document.querySelector('.add-new-contact-responsive').addEventListener('click', function () {
  openPopupGeneric('popup', '.popup-form');
});

/**
 * Hides the contact details view and shows the contact list when back button is clicked.
 */
document.querySelector('.back-to-contact-list-button').addEventListener('click', function () {
  document.querySelector('.contact-detail').classList.add('hidden');
  document.getElementById('containerContact').classList.remove('hidden');
});

/**
 * Adds an event listener for window resize to toggle the visibility of the contact list and header.
 */
window.addEventListener('resize', handleResize);

/**
 * Handles the window resize event to show/hide the contact list and header
 * based on the screen width and whether a contact is selected.
 */
function handleResize() {
  if (window.innerWidth > 1275) {
    document.getElementById('containerContact').classList.remove('hidden');
    document.querySelector('.contact-header').classList.remove('hidden');
  } else if (currentContact) {
    document.getElementById('containerContact').classList.add('hidden');
    document.querySelector('.contact-header').classList.add('hidden');
  }
}
