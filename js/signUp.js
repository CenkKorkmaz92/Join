// signUp.js
import { saveData } from './firebase.js';

/**
 * Generates a UUID (version 4).
 * Uses crypto.randomUUID if available, otherwise a fallback.
 */
function generateUUID() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Extracts initials from a full name.
 *
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function getInitials(name) {
  const names = name.trim().split(" ");
  if (names.length === 0) return "";
  if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Checks the validity of the form fields and enables/disables the sign-up button.
 */
function checkFormValidity() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("termsCheckbox");
  const signUpButton = document.getElementById("signUpButton");
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const termsChecked = termsCheckbox.checked;
  if (name && email && password && confirmPassword && (password === confirmPassword) && termsChecked) {
    signUpButton.disabled = false;
  } else {
    signUpButton.disabled = true;
  }
}

/**
 * Handles the sign-up process, including gathering user inputs,
 * validating the password, creating a new user, and saving the user.
 * Shows a success popup if the user is successfully saved.
 */
async function signUp() {
  const name = getInputValue("name");
  const email = getInputValue("email");
  const password = getInputValue("password");
  const confirmPassword = getInputValue("confirmPassword");
  if (!validatePasswords(password, confirmPassword)) return;
  const newUser = createNewUser(name, email, password);
  if (await saveUser(newUser)) {
    showSuccessPopup();
  }
}

/**
 * Retrieves the value from an input element by its id.
 * 
 * @param {string} id - The id of the input element to retrieve the value from.
 * @returns {string} The value of the input element.
 */
function getInputValue(id) {
  return document.getElementById(id).value;
}

/**
 * Validates if the password and confirmPassword match.
 * 
 * @param {string} password - The password entered by the user.
 * @param {string} confirmPassword - The confirmation password entered by the user.
 * @returns {boolean} Returns true if passwords match, otherwise false.
 */
function validatePasswords(password, confirmPassword) {
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return false;
  }
  return true;
}

/**
 * Creates a new user object with the provided details.
 * 
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Object} The new user object with id, name, email, password, and initials.
 */
function createNewUser(name, email, password) {
  const id = generateUUID();
  const initials = getInitials(name);
  return { id, name, email, password, initials };
}

/**
 * Saves the new user object to the data store (e.g., database or local storage).
 * 
 * @param {Object} newUser - The new user object to save.
 * @returns {Promise<boolean>} Returns a promise that resolves to true if the user is saved, otherwise false.
 */
async function saveUser(newUser) {
  try {
    await saveData(`users/${newUser.id}`, newUser);
    clearInputs();
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
}

/**
 * Clears the input fields for the sign-up form.
 */
function clearInputs() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
}

/**
 * Displays a success popup for a short duration and redirects to the home page.
 */
function showSuccessPopup() {
  const popupSuccess = document.getElementById("popupSuccess");
  popupSuccess.style.display = "flex";
  setTimeout(() => {
    popupSuccess.style.display = "none";
    window.location.href = "index.html";
  }, 2000);
}


/**
 * Displays or hides the error message based on the validation result.
 * @param {HTMLElement} errorMessage The error message element to show or hide.
 * @param {string} errorText The error message text to display.
 */
function toggleErrorMessage(errorMessage, errorText) {
  if (errorText) {
    errorMessage.style.display = "block";
    errorMessage.textContent = errorText;
  } else {
    errorMessage.style.display = "none";
  }
}

/**
* General input validation function that uses specific helper functions.
* @param {HTMLInputElement} input The input element being validated.
*/
function validateInput(input) {
  const errorMessage = document.getElementById(`${input.id}-error`);
  const errorText = getValidationError(input);
  toggleErrorMessage(errorMessage, errorText);
}

/**
 * Validates the input field and shows or hides the error message.
 * @param {HTMLInputElement} input - The input element that needs validation.
 */
window.validateInput = function (input) {
  const errorMessage = document.getElementById(`${input.id}-error`);
  const errorText = getValidationError(input);
  toggleErrorMessage(errorMessage, errorText);
};

/**
 * Returns the validation error message for a specific input field.
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {string} - The validation error message or an empty string if valid.
 */
function getValidationError(input) {
  switch (input.id) {
    case "name": return validateName(input.value);
    case "email": return validateEmail(input.value);
    case "password": return validatePassword(input.value);
    case "confirmPassword": return validateConfirmPassword(input.value, document.getElementById("password").value.trim());
    default: return input.value.trim() === "" ? "This field cannot be empty." : "";
  }
}

/**
 * Event listener for when the DOM content is loaded. It attaches 'input' event listeners to all input fields.
 */
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("input", () => validateInput(input));
  });
});

/**
 * Validates the name input.
 * Ensures the name contains at least two words, each with at least two letters.
 * @param {string} value The value of the name input.
 * @returns {string} The error message or an empty string if valid.
 */
function validateName(value) {
  const namePattern = /^([A-Za-z]{2,})\s+([A-Za-z]{2,})/;
  return namePattern.test(value.trim()) ? "" : "The name must contain at least two words, each with at least two letters.";
}

/**
* Validates the email input.
* Ensures the email is in a valid format.
* @param {string} value The value of the email input.
* @returns {string} The error message or an empty string if valid.
*/
function validateEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim()) ? "" : "Please enter a valid e-mail address.";
}

/**
* Validates the password input.
* Ensures the password contains at least one uppercase letter, one number, and is at least 8 characters long.
* @param {string} value The value of the password input.
* @returns {string} The error message or an empty string if valid.
*/
function validatePassword(value) {
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordPattern.test(value.trim()) ? "" : "The password must contain at least one capital letter, one number and at least 8 characters.";
}

/**
* Validates the confirm password input.
* Ensures the confirm password matches the password.
* @param {string} value The value of the confirm password input.
* @param {string} password The value of the original password input.
* @returns {string} The error message or an empty string if valid.
*/
function validateConfirmPassword(value, password) {
  return value.trim() === password ? "" : "The passwords must match.";
}

/**
 * Initializes event listeners for input fields to validate them when they lose focus.
 * This function runs when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("blur", () => validateInput(input));
  });
});

/**
 * Validates the terms checkbox and displays or hides the error message accordingly.
 * This function checks if the checkbox is checked and shows or hides the error message.
 */
function validateCheckbox() {
  const termsCheckbox = document.getElementById("termsCheckbox");
  const errorMessage = document.getElementById("termsCheckbox-error");
  if (termsCheckbox.checked) {
    errorMessage.style.display = "none";
  } else {
    errorMessage.style.display = "block";
  }
}

/**
 * Initializes the checkbox validation by adding an event listener to the checkbox.
 * This function runs when the DOM is fully loaded.
 * It also performs an initial check to set the correct visibility of the error message.
 */
document.addEventListener("DOMContentLoaded", () => {
  const termsCheckbox = document.getElementById("termsCheckbox");
  termsCheckbox.addEventListener("change", validateCheckbox);
  validateCheckbox();
});

// Attach event listeners after DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
  checkFormValidity();
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("termsCheckbox");
  nameInput.addEventListener("input", checkFormValidity);
  emailInput.addEventListener("input", checkFormValidity);
  passwordInput.addEventListener("input", checkFormValidity);
  confirmPasswordInput.addEventListener("input", checkFormValidity);
  termsCheckbox.addEventListener("change", checkFormValidity);
});

// Expose functions to the global scope for HTML onclick attributes
window.signUp = signUp;

function redirectTo(page) {
  window.location.href = page;
}
window.redirectTo = redirectTo;

function goBack() {
  window.history.back();
}
window.goBack = goBack;
