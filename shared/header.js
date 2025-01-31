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
function toggleUserDropdown() {
    document.getElementById("user-dropdown").classList.toggle("show");
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
document.addEventListener("DOMContentLoaded", function () {
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
});
