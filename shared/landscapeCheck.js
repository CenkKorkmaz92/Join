/**
 * Checks if the current device is a mobile device (smartphone or tablet).
 * @returns {boolean} True if the device is mobile, otherwise false.
 */
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Checks the device orientation and displays a warning if the device is in landscape mode.
 */
function checkOrientation() {
    const landscapeWarning = document.getElementById('landscapeWarning');

    if (!landscapeWarning) return;

    if (isMobileDevice() && window.innerWidth > window.innerHeight) {
        landscapeWarning.style.opacity = '1';
        landscapeWarning.style.pointerEvents = 'auto';
    } else {
        landscapeWarning.style.opacity = '0';
        landscapeWarning.style.pointerEvents = 'none';
    }
}

// Run check as early as possible
document.addEventListener('DOMContentLoaded', checkOrientation);
window.addEventListener('resize', checkOrientation);
