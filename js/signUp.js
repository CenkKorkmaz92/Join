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
 * @param {string} name - Full name (e.g., "Test User")
 * @returns {string} - The initials (e.g., "TU")
 */
function getInitials(name) {
  const names = name.trim().split(' ');
  if (names.length === 0) return '';
  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Called when the user clicks the "Sign up" button.
 */
async function signUp() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const name = nameInput ? nameInput.value : "Test User";
  const email = emailInput ? emailInput.value : "testuser@example.com";
  const password = passwordInput ? passwordInput.value : "password123";

  // Generate a unique id and compute the initials
  const id = generateUUID();
  const initials = getInitials(name);

  const newUser = {
    email,
    id,
    initials,
    name,
    password,
  };

  try {
    // Save the new user in Firebase under the "users" node
    await saveData(`users/${id}`, newUser);
    console.log("User successfully created:", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
  }

  const popupSuccess = document.getElementById("popupSuccess");
  popupSuccess.style.display = "flex";
  setTimeout(function() {
      popupSuccess.style.display = "none";
  }, 2000);  // Popup hides after 800ms (adjust as needed)
}

// Expose signUp to the global scope so it can be called from your HTML button
window.signUp = signUp;

/**
 * Redirects the user to the specified page.
 * @param {string} page - The name of the HTML page to navigate to.
 */
function redirectTo(page) {
    window.location.href = page;
}

function goBack() {
    window.history.back();
}

