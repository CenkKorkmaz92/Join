const FIREBASE_BASE_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * A central class that encapsulates all HTTP requests to Firebase.
 */
class FirebaseService {
  /**
   * Creates an instance of FirebaseService.
   *
   * @param {string} baseUrl - The base URL of the Firebase database.
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Executes an HTTP request to the specified resource.
   *
   * @param {string} resource - The path (without .json) in the database.
   * @param {string} method - HTTP method (GET, PUT, PATCH, DELETE).
   * @param {any} [data] - Optional payload (sent as JSON for PUT and PATCH).
   * @returns {Promise<any>} - The parsed JSON response (or null if nothing is returned).
   * @throws {Error} - Throws an error for non-ok HTTP responses.
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

  /**
   * Executes a GET request.
   *
   * @param {string} [path=""] - The path in the database.
   * @returns {Promise<any>} - The response data.
   */
  async fetchResource(path = "") {
    return this._sendRequest(path, "GET");
  }

  /**
   * Overwrites or stores data via a PUT request.
   *
   * @param {string} [path=""] - The path in the database.
   * @param {any} payload - The data to store.
   * @returns {Promise<any>} - The response data.
   */
  async storeResource(path = "", payload) {
    return this._sendRequest(path, "PUT", payload);
  }

  /**
   * Partially updates data via a PATCH request.
   *
   * @param {string} [path=""] - The path in the database.
   * @param {object} [payload={}] - The data to update.
   * @returns {Promise<any>} - The response data.
   */
  async updateResource(path = "", payload = {}) {
    return this._sendRequest(path, "PATCH", payload);
  }

  /**
   * Deletes data via a DELETE request.
   *
   * @param {string} [path=""] - The path in the database.
   * @returns {Promise<any>} - The response data.
   */
  async removeResource(path = "") {
    return this._sendRequest(path, "DELETE");
  }

  /**
   * Stores contact data under "contacts/{contactId}".
   *
   * @param {string} contactId - The ID of the contact.
   * @param {any} contactData - The contact data to store.
   * @returns {Promise<any>} - The response data.
   */
  async storeContact(contactId, contactData) {
    return this.storeResource(`contacts/${contactId}`, contactData);
  }
}

// Use an instance of the FirebaseService class:
const firebaseAPI = new FirebaseService(FIREBASE_BASE_URL);

/*
  Exported functions that provide the same functionality as the old code,
  but internally use the new class-based approach.
*/

/**
 * Reads data from a specified path.
 *
 * @param {string} [path=""] - The path in the database.
 * @returns {Promise<any>} - The response data.
 */
export const getData = (path = "") => firebaseAPI.fetchResource(path);

/**
 * Saves data (via PUT) at the specified path.
 *
 * @param {string} [path=""] - The path in the database.
 * @param {any} data - The data to save.
 * @returns {Promise<any>} - The response data.
 */
export const saveData = (path = "", data) =>
  firebaseAPI.storeResource(path, data);

/**
 * Removes data (via DELETE). This function throws an exception in case of an error.
 *
 * @param {string} [path=""] - The path in the database.
 * @returns {Promise<any>} - The response data.
 */
export const removeData = (path = "") => firebaseAPI.removeResource(path);

/**
 * Saves contact data in the "contacts" collection.
 *
 * @param {string} contactId - The contact's ID.
 * @param {any} contactData - The contact data to save.
 * @returns {Promise<any>} - The response data.
 */
export const saveDataToFirebase = (contactId, contactData) =>
  firebaseAPI.storeContact(contactId, contactData);

/**
 * Alias for DELETE.
 *
 * @param {string} [path=""] - The path in the database.
 * @returns {Promise<any>} - The response data.
 */
export const deleteData = (path = "") => firebaseAPI.removeResource(path);

/**
 * Alias for PUT (explicitly returns the response).
 *
 * @param {string} [path=""] - The path in the database.
 * @param {any} [data={}] - The data to store.
 * @returns {Promise<any>} - The response data.
 */
export const putData = (path = "", data = {}) =>
  firebaseAPI.storeResource(path, data);

/**
 * Updates data (via PATCH).
 *
 * @param {string} [path=""] - The path in the database.
 * @param {object} [data={}] - The data to update.
 * @returns {Promise<any>} - The response data.
 */
export const patchData = (path = "", data = {}) =>
  firebaseAPI.updateResource(path, data);
