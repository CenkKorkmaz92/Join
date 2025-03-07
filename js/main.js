/**
 * Initializes loading screen animation and transitions logo to navbar.
 * Executes once the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const loadingScreen = document.querySelector(".loading-screen");
        const loadingLogo = document.querySelector(".loading-logo");
        const navbarLogo = document.querySelector(".main-logo");

        /**
         * Calculates the position difference between the loading logo and the navbar logo.
         */
        const targetPosition = navbarLogo.getBoundingClientRect();
        const loadingPosition = loadingLogo.getBoundingClientRect();

        const deltaX = targetPosition.left - loadingPosition.left;
        const deltaY = targetPosition.top - loadingPosition.top;

        /**
         * Animates the loading logo to move and shrink into the navbar position.
         */
        loadingLogo.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
        loadingLogo.style.transition = "transform 1s ease-out";

        /**
         * Fades out the loading screen and makes the navbar logo visible.
         */
        setTimeout(() => {
            loadingScreen.classList.add("fade-out");
            navbarLogo.classList.add("show");
        }, 1000); // Matches transition duration
    }, 2000); // Delay before animation starts
});

document.addEventListener("DOMContentLoaded", function () {
    let backArrow = document.getElementById("back-arrow");

    if (backArrow) {
        backArrow.addEventListener("click", function () {
            window.history.back(); // Go back to the previous page
        });
    }
});

function redirectTo(url) {
    window.location.href = url;
}

