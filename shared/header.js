/**
 * Redirects the user to the specified URL.
 * @param {string} url - The URL to navigate to.
 */
function redirectTo(url) {
  window.location.href = url;
}

/**
 * Toggles the visibility of the user dropdown menu.
 */
function toggleUserDropdown() {
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown) {
    const isOpen = dropdown.classList.toggle("show");
    if (isOpen) {
      document.addEventListener("click", closeDropdownOnClickOutside);
    } else {
      document.removeEventListener("click", closeDropdownOnClickOutside);
    }
  }
}

/**
 * Closes the dropdown menu when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeDropdownOnClickOutside(event) {
  const userProfile = document.getElementById("user-initials");
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown && !dropdown.contains(event.target) && event.target !== userProfile) {
    dropdown.classList.remove("show");
    document.removeEventListener("click", closeDropdownOnClickOutside);
  }
}

/**
 * Logs out the user by removing their data from localStorage and redirecting to the login page.
 */
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  redirectTo("./index.html");
}

/**
 * Updates header elements with the logged-in user's data.
 * If no user is found, defaults to a guest ("G").
 */
function updateHeaderElements() {
  const userProfile = document.getElementById("user-initials");
  const logoutLink = document.getElementById("logout-link");

  if (userProfile && logoutLink) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      userProfile.textContent = user.initials;
      logoutLink.classList.remove("hidden");
      console.log("Header updated with user initials:", user.initials);
    } else {
      userProfile.textContent = "G";
      console.log("No user data; defaulting header initials to 'G'");
    }
  } else {
    // Retry after 100ms if elements are not yet available.
    setTimeout(updateHeaderElements, 100);
  }
}

/**
 * Logs in a guest user and redirects to the summary page.
 */
function guestLogin() {
  const guestData = {
    name: "Guest",
    initials: "G"
  };
  localStorage.setItem("loggedInUser", JSON.stringify(guestData));
  redirectTo("summary.html");
}

/**
 * Attaches an event listener to the help icon once it is present in the DOM.
 * If a user is logged in, clicking the icon redirects to the internal help page;
 * otherwise, it redirects to the external help page.
 */
function attachHelpIconListener() {
  const helpIcon = document.querySelector(".help-icon");
  if (helpIcon) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      helpIcon.onclick = (event) => {
        event.preventDefault();
        redirectTo("../help.html");
      };
    } else {
      helpIcon.onclick = (event) => {
        event.preventDefault();
        redirectTo("../helpExternal.html");
      };
    }
    console.log("Help icon event listener attached.");
  } else {
    // Retry if the help icon isn't yet in the DOM.
    console.warn("Help icon not found, retrying...");
    setTimeout(attachHelpIconListener, 100);
  }
}

// Wait for the DOM to be fully loaded before attaching event listeners.
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listener for the user profile (dropdown) if it exists.
  const userProfile = document.getElementById("user-initials");
  if (userProfile) {
    userProfile.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleUserDropdown();
    });
  }

  // Attach event listener for the logout link if it exists.
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logoutUser();
    });
  }

  // Update header elements with user data.
  updateHeaderElements();

  // Attach the help icon listener (polling until the element is found).
  attachHelpIconListener();
});

// Expose functions globally if needed.
window.redirectTo = redirectTo;
window.toggleUserDropdown = toggleUserDropdown;
window.logoutUser = logoutUser;
window.guestLogin = guestLogin;
