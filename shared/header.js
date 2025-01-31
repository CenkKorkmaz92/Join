/**
 * Dynamically loads the header into pages.
 */
document.addEventListener("DOMContentLoaded", function () {
    fetch("../shared/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            attachEventListeners();
        })
        .catch(error => console.error("Error loading header:", error));
});

/**
 * Redirects the user to the given URL.
 * @param {string} url - The URL to navigate to.
 */
function redirectTo(url) {
    window.location.href = url;
}

/**
 * Toggles the user dropdown menu.
 */
function toggleUserDropdown(event) {
    event.stopPropagation(); // Prevents closing the dropdown when clicking the button
    let dropdown = document.getElementById("user-dropdown");
    dropdown.classList.toggle("show");
}

/**
 * Logs out the user by redirecting to the index page.
 */
function logoutUser() {
    window.location.href = "../index.html";
}

/**
 * Adds event listeners after the header loads.
 */
function attachEventListeners() {
    let userProfile = document.getElementById("user-initials");
    let logoutLink = document.getElementById("logout-link");
    let dropdown = document.getElementById("user-dropdown");

    if (userProfile) {
        userProfile.addEventListener("click", toggleUserDropdown);
    }
    if (logoutLink) {
        logoutLink.addEventListener("click", logoutUser);
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target) && !userProfile.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
}
