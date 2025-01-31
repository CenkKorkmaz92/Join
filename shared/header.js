/**
 * Redirects the user to the given URL.
 * @param {string} url - The URL to navigate to.
 */
function redirectTo(url) {
    window.location.href = url;
}

/**
 * Toggles the visibility of the user dropdown menu.
 */
function toggleUserDropdown() {
    let dropdown = document.getElementById("user-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

/**
 * Logs out the user by redirecting them to the index page.
 */
function logoutUser() {
    window.location.href = "./index.html";
}

/**
 * Adds event listeners after the header loads.
 * Ensures the user dropdown opens on click and closes when clicking outside.
 */
document.addEventListener("DOMContentLoaded", function () {
    let userProfile = document.getElementById("user-initials");
    let logoutLink = document.getElementById("logout-link");
    let dropdown = document.getElementById("user-dropdown");

    if (userProfile) {
        userProfile.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevents event from immediately closing dropdown
            toggleUserDropdown();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", logoutUser);
    }

    // Close dropdown when clicking outside of it
    document.addEventListener("click", function (event) {
        if (dropdown && dropdown.classList.contains("show") && 
            event.target !== userProfile && !dropdown.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
});
