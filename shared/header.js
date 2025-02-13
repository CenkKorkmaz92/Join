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
 * Logs out the user by removing their data from localStorage
 * and redirecting to the login page.
 */
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  redirectTo("./index.html");
}

/**
 * Updates header elements with the logged-in user's data.
 * If no user is found, defaults the initials to "G" for guest.
 */
function updateHeaderElements() {
  const userProfile = document.getElementById("user-initials");
  const logoutLink = document.getElementById("logout-link");

  if (userProfile && logoutLink) {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userProfile.textContent = user.initials;
      logoutLink.classList.remove("hidden");
      console.log("Header updated with user initials:", user.initials);
    } else {
      userProfile.textContent = "G";
      console.log("No user data found; defaulting header initials to 'G'");
    }
  } else {
    // Retry if elements are not yet available.
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
 * Attaches an event listener to the help icon.
 * If the page is an external page (with class "legal-page"), clicking the help icon
 * will always redirect to the external help page.
 * Otherwise, it redirects to the internal help page.
 */
function attachHelpIconListener() {
  const helpIcon = document.querySelector(".help-icon");
  if (!helpIcon) {
    console.warn("Help icon not found, retrying...");
    return setTimeout(attachHelpIconListener, 100);
  }
  
  if (document.body.classList.contains("legal-page")) {
    helpIcon.onclick = function(event) {
      event.preventDefault();
      redirectTo("../helpExternal.html");
    };
    console.log("External page detected; help icon set to external help page.");
  } else {
    helpIcon.onclick = function(event) {
      event.preventDefault();
      redirectTo("../help.html");
    };
    console.log("Normal page detected; help icon set to internal help page.");
  }
}

// Attach event listeners once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  // Attach dropdown toggle for the user profile if available.
  const userProfile = document.getElementById("user-initials");
  if (userProfile) {
    userProfile.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleUserDropdown();
    });
  }

  // Attach event listener for the logout link if available.
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logoutUser();
    });
  }

  // Update header elements with the current user data.
  updateHeaderElements();

  // Attach the help icon event listener.
  attachHelpIconListener();
});

// Expose functions globally if needed.
window.redirectTo = redirectTo;
window.toggleUserDropdown = toggleUserDropdown;
window.logoutUser = logoutUser;
window.guestLogin = guestLogin;
