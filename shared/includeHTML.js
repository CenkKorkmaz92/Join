/**
 * Asynchronously loads HTML content into specific elements by their IDs.
 * This function fetches external HTML files and inserts them into designated
 * containers on the page, such as the navbar and header.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} Resolves when all content is loaded.
 */
async function includeHTML() {
    /**
     * Loads HTML content into an element if it exists.
     * 
     * @param {string} elementId - The ID of the target container.
     * @param {string} filePath - The relative path to the HTML file.
     * @returns {Promise<void>}
     */
    async function loadContent(elementId, filePath) {
        const container = document.getElementById(elementId);
        if (container) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
                }
                const data = await response.text();
                container.innerHTML = data;
            } catch (error) {
                console.error(error);
            }
        }
    }

    // Load the navbar and header
    await Promise.all([
        loadContent("navbar-container", "/Join/shared/navbar.html"),
        loadContent("header-container", "/Join/shared/header.html"),
    ]);
}

/**
 * Event listener to load HTML content after the DOM has fully loaded.
 */
document.addEventListener("DOMContentLoaded", async () => {
    await includeHTML();
});
