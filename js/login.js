import { getData } from './firebase.js';

/**
 * Shows a single error message below the input field without shifting it.
 * @param {string} inputId - The ID of the input field.
 * @param {string} message - The error text to display.
 */
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const container = input.closest('.input-container');
    let errorSpan = container.querySelector('.error-message');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('error-message');
        container.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
}

/**
 * Removes any existing error message for a given input field.
 * @param {string} inputId - The ID of the input field.
 */
function clearError(inputId) {
    const container = document.getElementById(inputId).closest('.input-container');
    const errorSpan = container.querySelector('.error-message');
    if (errorSpan) errorSpan.remove();
}

/**
 * Validates the email and password fields before login.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateInputs() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    let isValid = true;

    if (!email) {
        showError('loginEmail', 'Please enter your email.');
        isValid = false;
    } else {
        clearError('loginEmail');
    }

    if (!password) {
        showError('loginPassword', 'Please enter your password.');
        isValid = false;
    } else {
        clearError('loginPassword');
    }

    return isValid;
}

/**
 * Attempts to log in the user and redirects if successful.
 */
async function login() {
    if (!validateInputs()) return;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const users = await getData('users');
        const foundUser = Object.values(users || {}).find(u => u.email === email);
        if (!foundUser) return showError('loginEmail', 'User does not exist!');
        if (foundUser.password !== password) return showError('loginPassword', 'Incorrect password!');
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        window.location.href = 'summary.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
}

/**
 * Enables or disables the login button based on non-empty input fields.
 */
function checkLoginValidity() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    document.getElementById('loginButton').disabled = !(email && password);
}

// Attach listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    ['loginEmail', 'loginPassword'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            clearError(id);
            checkLoginValidity();
        });
    });
    checkLoginValidity();
});

// Expose functions globally
window.login = login;
window.redirectTo = page => window.location.href = page;
window.goBack = () => window.history.back();
