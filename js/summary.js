/**
 * Updates the summary page greeting with the logged-in user's name.
 * Retrieves the user data from localStorage and updates the element with class "user-name".
 */
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the stored user from localStorage.
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      console.warn("No logged in user found in localStorage.");
      return;
    }
  
    const user = JSON.parse(loggedInUser);
    console.log("Logged in user:", user);
  
    // Update the greeting on the summary page.
    const userNameElem = document.querySelector(".user-name");
    if (userNameElem) {
      userNameElem.textContent = user.name;
      console.log("User name set to:", user.name);
    } else {
      console.error("Element with class 'user-name' not found.");
    }
  });
  