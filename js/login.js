// login.js
import { getData } from './firebase.js';

/**
 * Attempts to log in a user.
 * Retrieves the entered email and password, searches for the user in Firebase,
 * and if the credentials match, redirects to summary.html.
 */
async function login() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Basic validation (should be satisfied by the enabled button)
  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    // Fetch all users from Firebase (assumes your users are stored under "users")
    const users = await getData("users");
    let foundUser = null;

    if (users) {
      // Iterate over the users to find a matching email
      for (const key in users) {
        if (users.hasOwnProperty(key)) {
          const user = users[key];
          if (user.email === email) {
            foundUser = user;
            break;
          }
        }
      }
    }

    if (!foundUser) {
      alert("User does not exist!");
      return;
    }

    if (foundUser.password !== password) {
      alert("Incorrect password!");
      return;
    }

    // Login successful; redirect to summary.html
    window.location.href = "summary.html";
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login. Please try again.");
  }
}

/**
 * Checks if the login form is valid (both email and password are filled)
 * and enables/disables the login button accordingly.
 */
function checkLoginValidity() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (email && password) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

// Attach event listeners when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  emailInput.addEventListener("input", checkLoginValidity);
  passwordInput.addEventListener("input", checkLoginValidity);

  // Run the check once on page load.
  checkLoginValidity();
});

// Expose the login function globally so it can be called from the HTML.
window.login = login;

/**
 * Redirects the user to the specified page.
 * @param {string} page - The URL of the page to navigate to.
 */
function redirectTo(page) {
  window.location.href = page;
}
window.redirectTo = redirectTo;

/**
 * Navigates back to the previous page.
 */
function goBack() {
  window.history.back();
}
window.goBack = goBack;
