// Constants for IndexedDB configuration
const DB_NAME = "FlashcardAppDB"; // Name of the IndexedDB database
const DB_VERSION = 1; // Version of the database (increment to trigger upgrade)
const STORE_NAME = "decks"; // Name of the object store for decks

let db; // Cached database instance for reuse

/**
 * Opens and initializes the IndexedDB database.
 * If the database or object store does not exist, it will be created.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        // If already opened, reuse the cached instance
        if (db) {
            resolve(db);
            return;
        }

        // Open (or create) the database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle error opening the database
        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject(`Database error: ${event.target.error}`);
        };

        // Handle successful database open
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database opened successfully");
            resolve(db);
        };

        // Handle database upgrade (e.g., first open or version change)
        request.onupgradeneeded = (event) => {
            console.log("Database upgrade needed");
            const tempDb = event.target.result;
            // Create the object store if it doesn't exist
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                // Use deckName as the primary key for each deck
                tempDb.createObjectStore(STORE_NAME, { keyPath: "deckName" });
                console.log(`Object store "${STORE_NAME}" created.`);
            }
        };
    });
}

/**
 * Saves or updates a deck in IndexedDB.
 * If a deck with the same name exists, it will be overwritten.
 * The deck object should have a `deckName` and a `cards` array.
 * @param {object} deckObject - The deck object (e.g., { deckName: "...", cards: [...] })
 * @returns {Promise<void>} Resolves when the deck is saved.
 */
export async function saveDeck(deckObject) {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
        // Only store plain objects (avoid class instances)
        const plainDeckObject = {
            deckName: deckObject.deckName,
            cards: deckObject.cards,
        };

        // Start a readwrite transaction for saving
        const transaction = currentDb.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        // Use put to add or update the deck
        const request = store.put(plainDeckObject);

        request.onsuccess = () => {
            console.log(`Deck "${deckObject.deckName}" saved successfully.`);
            resolve();
        };
        request.onerror = (event) => {
            console.error(`Error saving deck "${deckObject.deckName}":`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Retrieves a specific deck from IndexedDB by its name.
 * @param {string} deckName - The name of the deck to retrieve.
 * @returns {Promise<object|null>} Resolves with the deck object or null if not found.
 */
export async function getDeck(deckName) {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
        // Start a readonly transaction for retrieval
        const transaction = currentDb.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(deckName);

        request.onsuccess = () => {
            if (request.result) {
                console.log(`Deck "${deckName}" retrieved.`);
                resolve(request.result); // Deck object: { deckName: "...", cards: [...] }
            } else {
                console.log(`Deck "${deckName}" not found.`);
                resolve(null);
            }
        };
        request.onerror = (event) => {
            console.error(`Error getting deck "${deckName}":`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Retrieves all decks from IndexedDB.
 * @returns {Promise<Array<object>>} Resolves with an array of all deck objects.
 */
export async function getAllDecks() {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
        // Start a readonly transaction for retrieval
        const transaction = currentDb.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            console.log("All decks retrieved.");
            resolve(request.result || []); // Array of deck objects
        };
        request.onerror = (event) => {
            console.error("Error getting all decks:", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Deletes a deck from IndexedDB by its name.
 * @param {string} deckName - The name of the deck to delete.
 * @returns {Promise<void>} Resolves when the deck is deleted.
 */
export async function deleteDeckDB(deckName) {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
        // Start a readwrite transaction for deletion
        const transaction = currentDb.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(deckName);

        request.onsuccess = () => {
            console.log(`Deck "${deckName}" deleted successfully.`);
            resolve();
        };
        request.onerror = (event) => {
            console.error(`Error deleting deck "${deckName}":`, event.target.error);
            reject(event.target.error);
        };
    });
}
