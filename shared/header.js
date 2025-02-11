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
   * Closes the dropdown when clicking outside of it.
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
   * Logs out the user by removing the logged-in user data from localStorage
   * and redirecting to the login page.
   */
  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "./index.html";
  }
  
  /**
   * Polls for header elements and updates them with the logged-in user's data.
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
      }
    } else {
      // Retry after 100ms if elements are not yet available.
      setTimeout(updateHeaderElements, 100);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // Attach dropdown toggle to the user profile element, if it exists.
    const userProfile = document.getElementById("user-initials");
    if (userProfile) {
      userProfile.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleUserDropdown();
      });
    }
  
    // Attach logout event listener if the logout link exists.
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", logoutUser);
    }
  
    // Start polling for header elements to update them with user data.
    updateHeaderElements();
  });
  
  // Expose functions globally if needed.
  window.redirectTo = redirectTo;
  window.toggleUserDropdown = toggleUserDropdown;
  window.logoutUser = logoutUser;
  