/**
 * Dynamically loads the navbar into pages.
 * Ensures the navbar content is inserted before highlighting the active page.
 */
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("../shared/navbar.html");
    if (!response.ok) {
      throw new Error(`Failed to load navbar: ${response.statusText}`);
    }
    const data = await response.text();
    document.getElementById("navbar-container").innerHTML = data;
    highlightActivePage();
  } catch (error) {
    console.error(error);
  }
});

/**
 * Redirects the user to a given URL.
 * @param {string} url - The destination URL.
 */
function redirectTo(url) {
  window.location.href = url;
}

/**
 * Highlights the active menu button based on the current page URL.
 * Ensures both `summary.html` and `summaryGuest.html` highlight the same menu item.
 */
function highlightActivePage() {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".navbar-item").forEach(btn => {
    const btnUrlMatch = btn.getAttribute("onclick")?.match(/'([^']+)'/);
    if (btnUrlMatch) {
      const btnUrl = btnUrlMatch[1];

      // Ensure summaryGuest.html highlights the summary menu item
      if (currentPage === "summaryGuest.html" && btnUrl.includes("summary.html")) {
        btn.classList.add("active");
      }

      if (btnUrl.includes(currentPage)) {
        btn.classList.add("active");
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("../shared/navbar.html");
    if (!response.ok) {
      throw new Error(`Failed to load navbar: ${response.statusText}`);
    }
    const data = await response.text();
    document.getElementById("navbar-container").innerHTML = data;

    // If we're on a legal page, update the legal links to point to the external versions.
    if (document.body.classList.contains('legal-page')) {
      const privacyBtn = document.getElementById("nav-privacy-policy");
      const legalBtn = document.getElementById("nav-legal-notice");
      if (privacyBtn) {
        privacyBtn.setAttribute("onclick", "redirectTo('../privacyPolicyExternal.html')");
      }
      if (legalBtn) {
        legalBtn.setAttribute("onclick", "redirectTo('../legalNoticeExternal.html')");
      }
    }

    highlightActivePage();
  } catch (error) {
    console.error(error);
  }
});

