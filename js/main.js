document.addEventListener("DOMContentLoaded", function () {
    if (
      document.querySelector(".loading-screen") &&
      document.querySelector(".loading-logo") &&
      document.querySelector(".main-logo")
    ) {
      setTimeout(initLoadingAnimation, 1000);
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
    const loadingRect = loadingLogo.getBoundingClientRect();
    const navRect = navbarLogo.getBoundingClientRect();
    const loadingCenterX = loadingRect.left + (loadingRect.width / 2);
    const loadingCenterY = loadingRect.top + (loadingRect.height / 2);
    const navCenterX = navRect.left + (navRect.width / 2);
    const navCenterY = navRect.top + (navRect.height / 2);
    const translateX = navCenterX - loadingCenterX;
    const translateY = navCenterY - loadingCenterY;
    loadingLogo.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.3)`;
    loadingLogo.style.transition = "transform 1s ease-out";
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
