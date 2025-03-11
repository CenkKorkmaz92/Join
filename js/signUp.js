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
 * Signs up a new user.
 * Gathers input data, saves the user to Firebase, shows a success popup,
 * and redirects to index.html after 2 seconds.
 */
async function signUp() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  const id = generateUUID();
  const initials = getInitials(name);
  const newUser = { id, name, email, password, initials };
  try {
    await saveData(`users/${id}`, newUser);
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
  } catch (error) {
    console.error("Error creating user:", error);
    return;
  }
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
* Gets the validation error text based on the input's id.
* @param {HTMLInputElement} input The input element being validated.
* @returns {string} The error message or an empty string if valid.
*/
function getValidationError(input) {
  switch (input.id) {
      case "name": return validateName(input.value);
      case "email": return validateEmail(input.value);
      case "password": return validatePassword(input.value);
      case "confirmPassword":
          return validateConfirmPassword(input.value, document.getElementById("password").value.trim());
      default: return input.value.trim() === "" ? "Dieses Feld darf nicht leer sein." : "";
  }
}

/**
 * Validates the name input.
 * Ensures the name contains at least two words, each with at least two letters.
 * @param {string} value The value of the name input.
 * @returns {string} The error message or an empty string if valid.
 */
function validateName(value) {
  const namePattern = /^([A-Za-z]{2,})\s+([A-Za-z]{2,})/;
  return namePattern.test(value.trim()) ? "" : "Der Name muss mindestens zwei Wörter enthalten, mit jeweils mindestens zwei Buchstaben.";
}

/**
* Validates the email input.
* Ensures the email is in a valid format.
* @param {string} value The value of the email input.
* @returns {string} The error message or an empty string if valid.
*/
function validateEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim()) ? "" : "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
}

/**
* Validates the password input.
* Ensures the password contains at least one uppercase letter, one number, and is at least 8 characters long.
* @param {string} value The value of the password input.
* @returns {string} The error message or an empty string if valid.
*/
function validatePassword(value) {
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordPattern.test(value.trim()) ? "" : "Das Passwort muss mindestens einen Großbuchstaben, eine Zahl und mindestens 8 Zeichen enthalten.";
}

/**
* Validates the confirm password input.
* Ensures the confirm password matches the password.
* @param {string} value The value of the confirm password input.
* @param {string} password The value of the original password input.
* @returns {string} The error message or an empty string if valid.
*/
function validateConfirmPassword(value, password) {
  return value.trim() === password ? "" : "Die Passwörter müssen übereinstimmen.";
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
