/**
 * Toggles the user dropdown menu and ensures the header is above the navbar when open.
 * @param {Event} event - The click event object.
 */
function toggleUserDropdown(event) {
    event.stopPropagation();
    let dropdown = document.getElementById("user-dropdown");
    let header = document.querySelector(".top-header");

    if (!dropdown) return; // Prevent errors if dropdown is missing

    dropdown.classList.toggle("show");

    if (dropdown.classList.contains("show")) {
        header.classList.add("dropdown-active"); // Bring header forward
    } else {
        header.classList.remove("dropdown-active"); // Reset z-index
    }
}

/**
 * Adds event listeners after the header loads.
 */
function attachEventListeners() {
    let userProfile = document.getElementById("user-initials");
    let logoutLink = document.getElementById("logout-link");
    let dropdown = document.getElementById("user-dropdown");
    let header = document.querySelector(".top-header");

    if (userProfile) {
        userProfile.addEventListener("click", toggleUserDropdown);
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", logoutUser);
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!dropdown || !userProfile) return; // Prevents errors if elements are missing

        if (!dropdown.contains(event.target) && !userProfile.contains(event.target)) {
            dropdown.classList.remove("show");
            header.classList.remove("dropdown-active");
        }
    });
}

/**
 * Ensures event listeners are attached after the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    // Wait for the header to load before attaching event listeners
    let headerContainer = document.getElementById("header-container");

    if (headerContainer) {
        let observer = new MutationObserver(() => {
            if (document.getElementById("user-dropdown")) {
                attachEventListeners();
                observer.disconnect(); // Stop observing once elements are loaded
            }
        });

        observer.observe(headerContainer, { childList: true, subtree: true });
    } else {
        attachEventListeners(); // Fallback if header is already loaded
    }
});
