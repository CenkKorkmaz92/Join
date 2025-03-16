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
    input.classList.remove('input-error');
}

/**
 * Checks if the provided email string matches a basic pattern.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
function isValidEmail(email) {
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
    checkLoginValidity();
}

/**
 * Enables or disables the login button based on whether
 * the email and password are valid.
 */
function checkLoginValidity() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const isEmailValid = email && isValidEmail(email);
    const isPasswordValid = !!password;
    document.getElementById('loginButton').disabled = !(isEmailValid && isPasswordValid);
}

/**
 * Attempts to log in the user and redirects if successful.
 * Uses data from Firebase to verify the email and password.
 * @async
 */
async function login() {
    if (document.getElementById('loginButton').disabled) return;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
        const users = await getData('users');
        const foundUser = Object.values(users || {}).find(u => u.email === email);
        if (!foundUser || foundUser.password !== password) {
            showError('loginEmail', 'User or password are incorrect!');
            showError('loginPassword', 'User or password are incorrect!');
            return;
        }
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        window.location.href = 'summary.html';
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
}

/**
 * Attaches blur validation to email/password fields and checks login validity once DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    ['loginEmail', 'loginPassword'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('blur', () => validateField(id));
        }
    });
    checkLoginValidity();
});

/**
 * Makes the login function accessible globally.
 */
window.login = login;

/**
 * Redirects to the specified page.
 * @param {string} page - The URL or page to redirect to.
 */
window.redirectTo = page => window.location.href = page;

/**
 * Navigates one step back in the browser history.
 */
window.goBack = () => window.history.back();
