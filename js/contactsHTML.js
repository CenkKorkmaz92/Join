/**
 * Creates a DOM element representing a contact.
 *
 * This function generates a `div` element styled as a contact card, including
 * the contact's initials, name, and email. It also sets up an event listener
 * to handle click events, allowing the user to select a contact and view its details.
 *
 * @param {Object} contact - The contact object containing the contact's details.
 * @param {string} contact.color - The background color for the contact's circle.
 * @param {string} contact.initials - The initials to display in the contact's circle.
 * @param {string} contact.fullName - The full name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @returns {HTMLElement} The `div` element representing the contact.
 */
function createContactElement(contact) {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.innerHTML = `
    <div class="contact-circle" style="background: ${contact.color};">
      ${contact.initials}
    </div>
    <div class="contact-info">
      <div class="contact-name">${contact.fullName}</div>
      <div class="contact-email">${contact.email}</div>
    </div>
  `;
  contactDiv.onclick = function () {
    if (selectedContactDiv) selectedContactDiv.classList.remove("selected");
    contactDiv.classList.add("selected");
    selectedContactDiv = contactDiv;
    showContactDetails(contact);
  };
  return contactDiv;
}
