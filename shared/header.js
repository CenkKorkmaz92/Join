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
        // Toggle the dropdown visibility
        let isOpen = dropdown.classList.toggle("show");

        // If the dropdown is open, add the event listener to close it when clicking outside
        if (isOpen) {
            document.addEventListener("click", closeDropdownOnClickOutside);
        } else {
            document.removeEventListener("click", closeDropdownOnClickOutside);
        }
    }
}

/**
 * Closes the dropdown when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeDropdownOnClickOutside(event) {
    let userProfile = document.getElementById("user-initials");
    let dropdown = document.getElementById("user-dropdown");

    if (dropdown && !dropdown.contains(event.target) && event.target !== userProfile) {
        dropdown.classList.remove("show");
        document.removeEventListener("click", closeDropdownOnClickOutside);
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

    if (userProfile) {
        userProfile.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevents event bubbling to the document
            toggleUserDropdown();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", logoutUser);
    }
});
