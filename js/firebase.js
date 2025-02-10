const FIREBASE_BASE_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Eine zentrale Klasse, die alle HTTP-Anfragen an Firebase kapselt.
 */
class FirebaseService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Führt eine HTTP-Anfrage an den angegebenen Ressourcennamen aus.
   *
   * @param {string} resource - Der Pfad (ohne .json) in der Datenbank.
   * @param {string} method - HTTP-Methode (GET, PUT, PATCH, DELETE).
   * @param {any} [data] - Optionaler Payload (wird bei PUT und PATCH als JSON gesendet).
   * @returns {Promise<any>} - Die geparste JSON-Antwort (oder null, wenn nichts zurückkommt).
   * @throws {Error} - Bei nicht-ok HTTP-Antworten.
   */
  async _sendRequest(resource, method = "GET", data) {
    const url = `${this.baseUrl}${resource}.json`;
    const config = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (data !== undefined) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(
        `Request ${method} ${url} failed: ${response.status} ${response.statusText}`
      );
    }

    try {
      return await response.json();
    } catch (err) {
      return null;
    }
  }

  // Führt eine GET-Anfrage aus.
  async fetchResource(path = "") {
    return this._sendRequest(path, "GET");
  }

  // Überschreibt bzw. speichert Daten via PUT.
  async storeResource(path = "", payload) {
    return this._sendRequest(path, "PUT", payload);
  }

  // Aktualisiert Daten teilweise via PATCH.
  async updateResource(path = "", payload = {}) {
    return this._sendRequest(path, "PATCH", payload);
  }

  // Löscht Daten via DELETE.
  async removeResource(path = "") {
    return this._sendRequest(path, "DELETE");
  }

  // Speichert Kontaktdaten unter "contacts/{contactId}".
  async storeContact(contactId, contactData) {
    return this.storeResource(`contacts/${contactId}`, contactData);
  }
}

// Eine Instanz der FirebaseService-Klasse verwenden:
const firebaseAPI = new FirebaseService(FIREBASE_BASE_URL);

/* 
  Exportierte Funktionen, die dieselbe Funktionalität wie der alte Code bieten,
  aber intern den neuen Klassenansatz nutzen.
*/

// Liest Daten aus einem beliebigen Pfad
export const getData = (path = "") => firebaseAPI.fetchResource(path);

// Speichert Daten (via PUT) an einem angegebenen Pfad
export const saveData = (path = "", data) =>
  firebaseAPI.storeResource(path, data);

// Entfernt Daten (via DELETE) – diese Funktion wirft im Fehlerfall eine Exception
export const removeData = (path = "") => firebaseAPI.removeResource(path);

// Speichert Kontaktdaten in der "contacts"-Collection
export const saveDataToFirebase = (contactId, contactData) =>
  firebaseAPI.storeContact(contactId, contactData);

// Alias für DELETE, falls gewünscht:
export const deleteData = (path = "") => firebaseAPI.removeResource(path);

// Alias für PUT (gibt explizit die Antwort zurück)
export const putData = (path = "", data = {}) =>
  firebaseAPI.storeResource(path, data);

// Aktualisiert Daten (via PATCH)
export const patchData = (path = "", data = {}) =>
  firebaseAPI.updateResource(path, data);
