/**
 * addTaskContacts.js
 * Manages the multi-select dropdown for assigning contacts.
 */

let allContacts = [];
let selectedContacts = [];
let dropdownOpen = false;

export function getSelectedContacts() {
    return selectedContacts;
}

export function setAllContacts(contacts) {
    allContacts = contacts;
}

/**
 * Renders the contact list in the dropdown.
 */
export function renderContactsDropdown(listEl, placeholderEl) {
    listEl.innerHTML = '';
    allContacts.forEach((contact) => {
        const item = createContactListItem(contact);
        listEl.appendChild(item);
    });
    updatePlaceholderText(placeholderEl);
}

/**
 * Creates one contact item (avatar + label + checkbox).
 */
function createContactListItem(contact) {
    const item = document.createElement('div');
    item.className = 'contact-list-item';

    const avatar = createAvatar(contact);
    const label = createLabel(contact);
    const checkbox = createCheckbox(contact);

    item.appendChild(avatar);
    item.appendChild(label);
    item.appendChild(checkbox);

    // Add click event listener to the whole item
    item.addEventListener('click', (e) => {
        // Prevent toggling twice if the click originates on the checkbox itself
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            toggleContact(contact, checkbox);
        }
    });

    return item;
}


function createAvatar(contact) {
    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    avatar.style.backgroundColor = contact.color || '#999';
    avatar.textContent = contact.initials || '?';
    return avatar;
}

function createLabel(contact) {
    const label = document.createElement('span');
    label.className = 'contact-label';
    label.textContent = contact.fullName;
    return label;
}

function createCheckbox(contact) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => toggleContact(contact, checkbox));
    return checkbox;
}

/**
 * Push or remove the contact from `selectedContacts`.
 */
function toggleContact(contact, checkbox) {
    if (checkbox.checked) {
        selectedContacts.push(contact);
    } else {
        selectedContacts = selectedContacts.filter(
            (c) => c.firebaseId !== contact.firebaseId
        );
    }
    updateSelectedContactsUI();
}

/**
 * Updates the chips shown for selected contacts.
 */
export function updateSelectedContactsUI() {
    const container = document.getElementById('selectedContactsContainer');
    container.innerHTML = '';
    selectedContacts.forEach((contact) => {
        const chip = document.createElement('div');
        chip.className = 'contact-chip';
        chip.style.backgroundColor = contact.color || '#999';
        chip.textContent = contact.initials || '?';
        container.appendChild(chip);
    });
    updatePlaceholderText(document.getElementById('dropdownPlaceholder'));
}

function updatePlaceholderText(placeholderEl) {
    if (!placeholderEl) return;
    if (selectedContacts.length > 0) {
        placeholderEl.textContent = `${selectedContacts.length} contact(s) selected`;
    } else {
        placeholderEl.textContent = 'Select contact(s)';
    }
}

/**
 * Toggle the dropdown open/close UI.
 */
export function toggleContactsDropdown(
    dropdownEl,
    arrowEl,
    dropdownPlaceholderEl
) {
    dropdownOpen = !dropdownOpen;
    dropdownEl.classList.toggle('hidden', !dropdownOpen);
    arrowEl.classList.toggle('rotated', dropdownOpen);
    if (!dropdownOpen) updatePlaceholderText(dropdownPlaceholderEl);
}

/**
 * Closes the dropdown if click is outside.
 */
export function closeDropdownIfClickedOutside(e, toggleEl, dropdownEl, arrowEl) {
    if (!toggleEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownOpen = false;
        dropdownEl.classList.add('hidden');
        arrowEl.classList.remove('rotated');
    }
}
