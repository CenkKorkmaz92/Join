import { getData } from './firebase.js';

/**
 * Shows a single error message below the input field without shifting it.
 * @param {string} inputId - The ID of the input field.
 * @param {string} message - The error text to display.
 */
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const container = input.closest('.input-container');

    // If an error span doesn't exist, create it
    let errorSpan = container.querySelector('.error-message');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('error-message');
        container.appendChild(errorSpan);
    }
    errorSpan.textContent = message;

    // Optionally highlight the input to show there's an error
    input.classList.add('input-error');
}

/**
 * Removes any existing error message for a given input field.
 * @param {string} inputId - The ID of the input field.
 */
function clearError(inputId) {
    const input = document.getElementById(inputId);
    const container = input.closest('.input-container');
    const errorSpan = container.querySelector('.error-message');
    if (errorSpan) errorSpan.remove();

    // Remove any error styling
    input.classList.remove('input-error');
}

/**
 * Basic email format check with a simple regex.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if valid email, false otherwise.
 */
function isValidEmail(email) {
    // Simple pattern for typical email formats.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Validates an individual input field on blur.
 * @param {string} inputId - The ID of the input field to validate.
 */
function validateField(inputId) {
    const value = document.getElementById(inputId).value.trim();

    switch (inputId) {
        case 'loginEmail':
            if (!value) {
                showError(inputId, 'Please enter your email.');
            } else if (!isValidEmail(value)) {
                showError(inputId, 'Please enter a valid email address.');
            } else {
                clearError(inputId);
            }
            break;

        case 'loginPassword':
            if (!value) {
                showError(inputId, 'Please enter your password.');
            } else {
                clearError(inputId);
            }
            break;
    }

    // After each field validation, update button state
    checkLoginValidity();
}

/**
 * Enables or disables the login button based on basic checks
 * (email is not empty, valid format; password is not empty).
 */
function checkLoginValidity() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Basic enabling: If we have a valid email format and non-empty password
    const isEmailValid = email && isValidEmail(email);
    const isPasswordValid = !!password;

    document.getElementById('loginButton').disabled = !(isEmailValid && isPasswordValid);
}

/**
 * Attempts to log in the user and redirects if successful.
 */
async function login() {
    // Double-check that fields are valid
    if (document.getElementById('loginButton').disabled) return;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const users = await getData('users');
        const foundUser = Object.values(users || {}).find(u => u.email === email);

        if (!foundUser || foundUser.password !== password) {
            // Since we don't know if it's the email or the password,
            // we can show a generic error for either input:
            showError('loginEmail', 'User or password are incorrect!');
            showError('loginPassword', 'User or password are incorrect!');
            return;
        }

        // If we reach here, the email and password are correct
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        window.location.href = 'summary.html';

    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Attach listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    // Validate on blur for both email and password
    ['loginEmail', 'loginPassword'].forEach(id => {
        document.getElementById(id).addEventListener('blur', () => validateField(id));
    });

    // Initial check for button state (e.g. if fields are pre-filled)
    checkLoginValidity();
});

// Expose functions globally
window.login = login;
window.redirectTo = page => window.location.href = page;
window.goBack = () => window.history.back();
