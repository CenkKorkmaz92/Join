/**
 * Checks if the current device is a mobile device (smartphone or tablet).
 * @returns {boolean} True if the device is mobile, otherwise false.
 */
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Checks the device orientation and displays a warning if the device is in landscape mode.
 * The warning is only shown on mobile devices.
 */
function checkOrientation() {
    const landscapeWarning = document.getElementById('landscapeWarning');

    if (landscapeWarning) {
        // Show the warning only if it's a mobile device and in landscape mode
        if (isMobileDevice() && window.innerWidth > window.innerHeight) {
            landscapeWarning.style.display = 'flex';
        } else {
            landscapeWarning.style.display = 'none';
        }
    }
}

// Add event listeners to detect orientation changes and page load
window.addEventListener('resize', checkOrientation);
window.addEventListener('load', checkOrientation);
