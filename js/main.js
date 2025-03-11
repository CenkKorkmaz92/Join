document.addEventListener("DOMContentLoaded", function () {
    setTimeout(initLoadingAnimation, 1000);
    setupBackArrow();
});

function initLoadingAnimation() {
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingLogo = document.querySelector(".loading-logo");
    const navbarLogo = document.querySelector(".main-logo");

    if (!loadingLogo || !navbarLogo) {
        console.error("🚨 Missing elements: loadingLogo or navbarLogo not found!");
        return;
    }

    animateLogo(loadingLogo, navbarLogo);
    fadeOutLoadingScreen(loadingScreen, navbarLogo);
}

function animateLogo(loadingLogo, navbarLogo) {
    const targetPosition = navbarLogo.getBoundingClientRect();
    const loadingPosition = loadingLogo.getBoundingClientRect();
    const deltaX = targetPosition.left - loadingPosition.left;
    const deltaY = targetPosition.top - loadingPosition.top;

    loadingLogo.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
    loadingLogo.style.transition = "transform 1s ease-out";
}

function fadeOutLoadingScreen(loadingScreen, navbarLogo) {
    setTimeout(() => {
        loadingScreen.classList.add("fade-out");
        navbarLogo.classList.add("show");
    }, 700);
}

function setupBackArrow() {
    const backArrow = document.getElementById("back-arrow");
    if (backArrow) {
        backArrow.addEventListener("click", () => window.history.back());
    }
}

function redirectTo(url) {
    window.location.href = url;
}