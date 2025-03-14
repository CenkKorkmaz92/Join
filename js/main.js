document.addEventListener("DOMContentLoaded", function () {
    // Only run the loading animation if all required elements exist
    if (
      document.querySelector(".loading-screen") &&
      document.querySelector(".loading-logo") &&
      document.querySelector(".main-logo")
    ) {
      setTimeout(initLoadingAnimation, 1000); // Wait briefly before starting animation
    }
    setupBackArrow();
});


function initLoadingAnimation() {
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingLogo = document.querySelector(".loading-logo");
    const navbarLogo = document.querySelector(".main-logo");

    if (!loadingScreen || !loadingLogo || !navbarLogo) {
        console.error("🚨 Missing elements: loadingScreen, loadingLogo, or navbarLogo not found!");
        return;
    }

    animateLogo(loadingScreen, loadingLogo, navbarLogo);
}

/**
 * Translate & scale the "loadingLogo" until it aligns with the "navbarLogo."
 * Then fade out the loading screen once the transition ends.
 */
function animateLogo(loadingScreen, loadingLogo, navbarLogo) {
    // Get bounding boxes
    const loadingRect = loadingLogo.getBoundingClientRect();
    const navRect = navbarLogo.getBoundingClientRect();

    // Calculate centers
    const loadingCenterX = loadingRect.left + (loadingRect.width / 2);
    const loadingCenterY = loadingRect.top + (loadingRect.height / 2);
    const navCenterX = navRect.left + (navRect.width / 2);
    const navCenterY = navRect.top + (navRect.height / 2);

    // Translate difference
    const translateX = navCenterX - loadingCenterX;
    const translateY = navCenterY - loadingCenterY;

    // Perform the animation
    loadingLogo.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.3)`;
    loadingLogo.style.transition = "transform 1s ease-out";

    // Once the logo finishes moving, fade out the loading screen and reveal the navbar logo
    loadingLogo.addEventListener("transitionend", () => {
        loadingScreen.classList.add("fade-out");
        navbarLogo.classList.add("show");
    }, { once: true });
}

/**
 * If there's a back-arrow on the page, clicking it should go back one page.
 */
function setupBackArrow() {
    const backArrow = document.getElementById("back-arrow");
    if (backArrow) {
        backArrow.addEventListener("click", () => window.history.back());
    }
}

/**
 * Simple redirect helper (if you need it).
 */
function redirectTo(url) {
    window.location.href = url;
}
