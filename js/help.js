'use strict';

/**
 * Asynchronously loads external HTML files into elements
 * that have the `w3-include-html` attribute.
 * 
 * This function iterates over all elements with the attribute,
 * fetches the specified HTML file, and inserts its content.
 * If the file is not found, it displays "Page not found".
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    let file = element.getAttribute("w3-include-html"); // Path to the external HTML file
    
    try {
      let resp = await fetch(file);
      
      if (resp.ok) {
        element.innerHTML = await resp.text();
      } else {
        element.innerHTML = "Page not found";
      }
    } catch (error) {
      console.error(`Error loading file ${file}:`, error);
      element.innerHTML = "Error loading content";
    }
  }
}

/**
 * Navigates the user back to the previous page in browser history.
 */
function goBack() {
  window.history.back();
}
