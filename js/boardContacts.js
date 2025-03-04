/**
 * boardContacts.js
 * Responsible for loading and storing all contact data.
 */

export let allContacts = [];

/**
 * Loads all contacts from Firebase, storing them in `allContacts`.
 */
export async function loadAllContacts() {
    const FIREBASE_CONTACTS_URL =
        'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';

    try {
        const response = await fetch(FIREBASE_CONTACTS_URL);
        const data = await response.json();

        if (!data) {
            console.log('No contacts found');
            allContacts = [];
            return;
        }

        allContacts = Object.entries(data).map(([id, contact]) => ({
            firebaseId: id,
            fullName: contact.fullName,
            color: contact.color,
            initials: contact.initials,
        }));
        console.log('Contacts loaded:', allContacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        allContacts = [];
    }
}
