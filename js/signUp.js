import { saveData } from './firebase.js';

/** 
 * Form submission flag; helps show/hide error messages for the terms checkbox after the user tries to submit.
 */
let formSubmitted = false;

/** 
 * Generates a UUID (version 4).
 */
function generateUUID() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function getInitials(name) {
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Retrieves the value from an input element by its id.
 * @param {string} id - The id of the input element to retrieve the value from.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Creates a new user object with the provided details.
 */
function createNewUser(name, email, password) {
  const id = generateUUID();
  return {
    id,
    name,
    email,
    password,
    initials: getInitials(name)
  };
}

/**
 * Saves the new user object to the data store.
 */
async function saveUser(newUser) {
  try {
    await saveData(`users/${newUser.id}`, newUser);
    clearInputs();
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

/**
 * Clears the input fields for the sign-up form.
 */
function clearInputs() {
  ['name', 'email', 'password', 'confirmPassword'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('termsCheckbox').checked = false;
}

/** 
 * Shows/hides an error message text in the given element.
 */
function toggleErrorMessage(errorElement, message) {
  if (!errorElement) return;
  if (message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    errorElement.style.display = 'none';
  }
}

/**
 * Validates the name input (two words, each at least two letters).
 */
function validateName(value) {
  const namePattern = /^([A-Za-z]{2,})\s+([A-Za-z]{2,})/;
  return namePattern.test(value)
    ? ''
    : 'The name must contain at least two words, each with at least two letters.';
}

/**
 * Validates email format using a simple pattern.
 */
function validateEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(value.trim())
    ? ''
    : 'Please enter a valid e-mail address.';
}


/**
 * Validates the password:
 *   - Must contain at least one uppercase letter.
 *   - Must contain at least one number.
 *   - Minimum length of 8 characters.
 *   - Allows special characters.
 */
function validatePassword(value) {
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;
  return passwordPattern.test(value)
    ? ''
    : 'The password must contain at least one capital letter, one number, and be at least 8 characters long.';
}

/**
 * Validates that confirmPassword matches password.
 */
function validateConfirmPassword(confirmValue, passwordValue) {
  return confirmValue === passwordValue
    ? ''
    : 'The passwords must match.';
}

/**
 * Returns the validation error text (if any) for a given input.
 */
function getValidationError(input) {
  const value = input.value.trim();
  if (!value) {
    return '';
  }
  switch (input.id) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      const passwordValue = getInputValue('password');
      return validateConfirmPassword(value, passwordValue);
    default:
      return '';
  }
}

/**
 * Shows validation error on blur (once user leaves the field).
 */
function validateOnBlur(event) {
  const input = event.target;
  const errorElement = document.getElementById(`${input.id}-error`);
  if (!errorElement) return;
  if (!input.value.trim()) {
    toggleErrorMessage(errorElement, '');
    return;
  }

  const errorText = getValidationError(input);
  toggleErrorMessage(errorElement, errorText);
}

/** 
 * Hides the error message while the user is typing (on input).
 */
function handleOnInput(event) {
  const input = event.target;
  const errorElement = document.getElementById(`${input.id}-error`);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  if (input.id === 'password') {
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput.value.trim()) {
      const confirmErrorElement = document.getElementById('confirmPassword-error');
      const errorText = getValidationError(confirmInput);
      toggleErrorMessage(confirmErrorElement, errorText);
    }
  }
  checkFormValidity();
}


/** 
 * Checks if the sign up button should be enabled or disabled.
 * We do a final check of all fields + the checkbox here.
 */
function checkFormValidity() {
  const name = getInputValue('name');
  const email = getInputValue('email');
  const password = getInputValue('password');
  const confirmPassword = getInputValue('confirmPassword');
  const termsChecked = document.getElementById('termsCheckbox').checked;
  const isFormValid = (
    name.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    confirmPassword === password &&
    termsChecked
  );

  document.getElementById('signUpButton').disabled = !isFormValid;
}

/** 
 * Validates the terms checkbox. 
 * If the user has tried to submit before and it's still unchecked, show an error.
 */
function validateCheckbox() {
  const checkbox = document.getElementById('termsCheckbox');
  const errorElement = document.getElementById('termsCheckbox-error');
  if (!checkbox.checked) {
    errorElement.style.display = 'block';
  } else {
    errorElement.style.display = 'none';
  }
}

/**
 * Final sign-up attempt. Called when user clicks "Sign Up" button.
 */
async function signUp() {
  formSubmitted = true;
  if (document.getElementById('signUpButton').disabled) {
    validateCheckbox();
    return;
  }
  const name = getInputValue('name');
  const email = getInputValue('email');
  const password = getInputValue('password');
  const newUser = createNewUser(name, email, password);
  const success = await saveUser(newUser);
  if (success) {
    showSuccessPopup();
  }
}

/**
 * Displays a success popup, then redirects after a short delay.
 */
function showSuccessPopup() {
  const popupSuccess = document.getElementById('popupSuccess');
  popupSuccess.style.display = 'flex';
  setTimeout(() => {
    popupSuccess.style.display = 'none';
    window.location.href = 'index.html';
  }, 2000);
}

/** 
 * Initialization: attach event listeners once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('#name, #email, #password, #confirmPassword');
  inputs.forEach(input => {
    input.addEventListener('blur', validateOnBlur);
  });
  inputs.forEach(input => {
    input.addEventListener('input', e => {
      handleOnInput(e);
      checkFormValidity();
    });
  });

  const termsCheckbox = document.getElementById('termsCheckbox');
  termsCheckbox.addEventListener('change', () => {
    validateCheckbox();
    checkFormValidity();
  });
  checkFormValidity();
});

/**
 * Helper to redirect to a page (used in HTML onclick).
 */
function redirectTo(page) {
  window.location.href = page;
}
window.redirectTo = redirectTo;

/**
 * Helper to go back in history (used in HTML onclick).
 */
function goBack() {
  window.history.back();
}
window.goBack = goBack;

/** 
 * Expose signUp function to the window so HTML can call it.
 */
window.signUp = signUp;
