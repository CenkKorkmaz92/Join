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

  // Enable button only if all fields are filled, passwords match, and checkbox is checked
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

  // Extra validation (shouldn't be necessary if the button is enabled only when valid)
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Generate unique ID and compute initials
  const id = generateUUID();
  const initials = getInitials(name);

  const newUser = { id, name, email, password, initials };

  try {
    await saveData(`users/${id}`, newUser);
    console.log("User successfully created:", newUser);
    // Optionally clear the form fields after a successful sign up
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
  } catch (error) {
    console.error("Error creating user:", error);
    return;
  }

  // Show the success popup
  const popupSuccess = document.getElementById("popupSuccess");
  popupSuccess.style.display = "flex";

  // After 2 seconds, hide the popup and redirect to index.html (login page)
  setTimeout(() => {
    popupSuccess.style.display = "none";
    window.location.href = "index.html";
  }, 2000);
}

// Attach event listeners after DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
  // Run initial validation check
  checkFormValidity();

  // Get form elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("termsCheckbox");

  // Attach listeners to update validation on every input change
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
