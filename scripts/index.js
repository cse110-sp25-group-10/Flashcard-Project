import "./screens/HomeScreen.js";
import "./screens/CreateScreen.js";
import "./screens/ExistingScreen.js"
import "./components/CardPreview.js";
import "./components/DeckPreview.js";
import "./screens/DeckScreen.js"
import { Deck, Card } from "./deck.js";
import { saveDeck, getAllDecks } from "./database.js";
import "./components/ConfirmationModal.js";

window.addEventListener("DOMContentLoaded", init);

// Application state to hold loaded decks and the deck currently being created
const appState = {
    decks: {}, // Stores Deck instances, keyed by deckName: { "deckName1": deckInstance1, ... }
    currentDeckInCreation: null, // Holds the Deck object while it's being built in CreateScreen
    previousScreen: "home"
};

function init() {
    const flashcardApp = document.querySelector("flashcard-app");
    if (!flashcardApp) {
        console.error("Flashcard app container not found!");
        return;
    }
    initHome();

    /**
     * Swap to the home screen
     */
    async function initHome() {
        flashcardApp.replaceChildren();
        const homeScreen = document.createElement("home-screen");
        flashcardApp.appendChild(homeScreen);

        // Load all decks from the database
        try {
            const allDeckData = await getAllDecks();
            appState.decks = {};
            for (const deckData of allDeckData) {
                const deckInstance = Deck(deckData.deckName); // Re-create Deck instance
                if (deckInstance) {
                    deckInstance.cards = deckData.cards; // Populate cards
                    appState.decks[deckInstance.deckName] = deckInstance;
                }
            }
            console.log("Decks loaded from DB:", appState.decks);
        } catch (error) {
            console.error("Failed to load decks from DB:", error);
        }

        // Get references to the buttons within the home screen
        const shadowRoot = homeScreen.shadowRoot;
        const createDeck = shadowRoot.querySelector(".create-deck");
        const existingDecks = shadowRoot.querySelector(".existing-decks");

        // Add event listeners
        createDeck.addEventListener("click", swapToCreate);
        existingDecks.addEventListener("click", swapToExisting);

        /**
         * Swap to the deck creation screen
         */
        function swapToCreate() {
            appState.previousScreen = "home";
            clearEvents();
            initCreate();
        }

        /**
         * Swap to the existing decks screen
         */
        function swapToExisting() {
            appState.previousScreen = "home";
            clearEvents();
            initExisting();
        }

        /**
         * Remove event listeners from the home screen elements to prevent memory leaks
         */
        function clearEvents() {
            createDeck.removeEventListener("click", swapToCreate);
            existingDecks.removeEventListener("click", swapToExisting);
        }
    }

    /**
     * Swap to the deck creation screen
     * @param {Number} editIndex The index if a specific card is edited, -1 otherwise
     */
    function initCreate(editIndex = -1) {
        // TODO: Set up creation screen implementation
        flashcardApp.replaceChildren();
        const createScreen = document.createElement("create-screen");
        flashcardApp.appendChild(createScreen);

        // Get references to buttons
        const saveBtn = flashcardApp.querySelector("#save-button");

        // Get references to card form elements
        const cardForm = flashcardApp.querySelector("#customize-card");
        const front = flashcardApp.querySelector("#input-front-card");
        const back = flashcardApp.querySelector("#input-back-card");
        const time = flashcardApp.querySelector("#set-time");
        const cardList = flashcardApp.querySelector("output");
        const backBtn = flashcardApp.querySelector("#back-button");

        // Get references to speech form elements
        const speechForm = flashcardApp.querySelector("#speech-form");
        const speechName = flashcardApp.querySelector("#title-speech");

        // Add event listeners
        cardForm.addEventListener("submit", handleCardSubmit);
        speechForm.addEventListener("submit", handleDeckNameSubmit);
        saveBtn.addEventListener("click", handleSaveDeckAndGoHome);
        backBtn.addEventListener("click", swapToPrevScreen);
        cardList.addEventListener("delete-card", deleteCard);
        cardList.addEventListener("edit-card", editCard);

        let editingState = editIndex;

        initExistingCards();
        if (editingState !== -1) {
            console.log(cardList.children[editingState]);
            editCard(
                new CustomEvent("edit-card", {
                    detail: cardList.children[editingState],
                })
            );
        }

        /**
         * Swap to the home screen
         */
        function swapToPrevScreen() {
            if (appState.previousScreen === "deck") {
                const deckName = appState.currentDeckInCreation.deckName;
                clearEvents();
                initDeckViewScreen(new CustomEvent("deck-select", {
                    detail: deckName,
                    bubbles: false
                }));                
            } else {
                clearEvents();
                initHome();
            }
        }

        /**
         * Validates that the user input creates a valid card and if so, add it's to the deck
         * @param {Event} event The event that causes this function to trigger (should be submit)
         */
        async function handleCardSubmit(event) {
            event.preventDefault();
            // TODO: Use validation techniques instead of alert
            if (!appState.currentDeckInCreation) {
                alert("Please set a deck name first using the 'Name your Speech' form.");
                return;
            }
            if (!appState.currentDeckInCreation.deckName) {
                alert(
                    "The deck needs a name before adding cards. Please use the 'Name your Speech' form."
                );
                return;
            }

            const frontText = front.value;
            const backText = back.value;
            const timeNum = Number(time.value);

            // Attempt to create a new card using given values
            const newCard = Card(frontText, backText, timeNum);
            // TODO: Use validation techniques instead of alert
            // If a card is successfully created (i.e. not null), add it to the deck if we're creating a card or override the card at the specified index
            if (newCard !== null) {
                if (editingState >= 0) {
                    const updated = appState.currentDeckInCreation.updateCard(editingState, newCard);
                    if (updated) {
                        // Create a new card component with the new values
                        const newPreview = document.createElement("card-preview");
                        newPreview.setAttribute("data-front-text", frontText);
                        newPreview.setAttribute("data-back-text", backText);
                        newPreview.setAttribute("data-time", timeNum);
                        // Clear the data in the form
                        front.value = "";
                        back.value = "";
                        time.value = "";
                        // Replace the existing card in the DOM
                        cardList.children[editingState].replaceWith(newPreview);
                        // Reset the state to -1 (indicating that we are back to creating new cards)
                        editingState = -1;
                        // Save the deck
                        await saveDeck(appState.currentDeckInCreation);
                    }
                } else {
                    const added = appState.currentDeckInCreation.addCard(newCard);
                    // If a card is successfully added to the deck, render it in the preview
                    if (added) {
                        // Create a new card component with the new values
                        const newPreview = document.createElement("card-preview");
                        newPreview.setAttribute("data-front-text", frontText);
                        newPreview.setAttribute("data-back-text", backText);
                        newPreview.setAttribute("data-time", timeNum);
                        // Render it in the DOM
                        cardList.appendChild(newPreview);
                        // Reset form values
                        front.value = "";
                        back.value = "";
                        time.value = "";

                        try {
                            await saveDeck(appState.currentDeckInCreation);
                            console.log(
                                `Deck "${appState.currentDeckInCreation.deckName}" saved after adding card.`
                            );
                        } catch (error) {
                            console.error("Error saving deck after adding card:", error);
                            alert("Error saving deck. Changes may not be persisted.");
                        }
                    } else {
                        alert("Failed to add card to deck (internal validation).");
                    }
            }
            } else {
                alert(
                    "Invalid card details. Please check inputs:\n- Front: 1-60 chars\n- Back: 1-250 chars\n- Time: 1-60 secs"
                );
            }
        }

        /**
         * Updates the name of the deck if it is valid
         * @param {Event} event The event that causes this function to trigger (should be submit)
         * @returns Returns if the name is invalid
         */
        function handleDeckNameSubmit(event) {
            event.preventDefault();
            const name = speechName.value.trim();
            if (typeof name !== "string" || name.length === 0 || name.length > 60) {
                alert("Deck name must be between 1 and 60 characters.");
                return;
            }

            if (!appState.currentDeckInCreation) {
                appState.currentDeckInCreation = Deck(name);
                if (!appState.currentDeckInCreation) {
                    alert("Error creating deck. Please try again.");
                    return;
                }
                console.log(`Deck "${name}" initialized for creation.`);
            } else {
                appState.currentDeckInCreation.deckName = name;
                console.log(`Deck name updated to "${name}".`);
            }
        }

        /**
         * Saves the current deck to IndexedDB and navigates back to the home screen.
         */
        async function handleSaveDeckAndGoHome() {
            if (appState.currentDeckInCreation && appState.currentDeckInCreation.deckName) {
                if (appState.currentDeckInCreation.cards.length === 0) {
                    // TODO: Use dialog tag instead
                    const modal = document.createElement("confirmation-modal");

                    // Add modal to DOM so it can be displayed
                    document.body.appendChild(modal);

                    const userConfirmed = await modal.open(
                        "This deck has no cards. Do you still want to save it?",
                        "Save Anyway",
                        "Cancel"
                    );

                    // Remove modal from DOM after use
                    document.body.removeChild(modal);

                    if (!userConfirmed) {
                        console.log("User chose not to save empty deck.");
                        return; // User clicked "Cancel" or closed the modal
                    } else {
                        initHome();
                    }
                }
                try {
                    await saveDeck(appState.currentDeckInCreation);
                    appState.decks[appState.currentDeckInCreation.deckName] =
                        appState.currentDeckInCreation; // Update in-memory list
                    console.log(
                        `Deck "${appState.currentDeckInCreation.deckName}" finalized and saved.`
                    );
                } catch (error) {
                    console.error("Error saving deck:", error);
                    alert("Error saving deck. Please try again.");
                    return; // Don't navigate away if save failed
                }
            } else {
                alert("No deck to save or deck has no name. Please name your deck.");
                return; // Don't navigate or clear events
            }

            swapToPrevScreen(); // Go back to the previous screen you came from (either home or deck screen)
        }

        /**
         * Deletes the card from the deck
         * @param {Event} event The event that triggered this function (should be "delete-card")
         */
        async function deleteCard(event) {
            const index = getIndexInDOM(event.detail);
            const deleted = appState.currentDeckInCreation.deleteCard(index);
            if (deleted) {
                cardList.removeChild(cardList.children[index]);
                await saveDeck(appState.currentDeckInCreation);
            }
        }

        /**
         * Sets the existing values in the form and sets the editingState to be the index of the card to edit
         * @param {Event} event The event that triggered this function (should be "edit-card");
         */
        function editCard(event) {
            const index = getIndexInDOM(event.detail);
            const card = appState.currentDeckInCreation.readCard(index);
            if (card) {
                if (editingState !== -1 && editingState !== index) {
                    cardList.children[editingState].classList.remove("selected");
                }
                cardList.children[index].classList.add("selected");
                front.value = card.frontText;
                back.value = card.backText;
                time.value = card.time;
                editingState = index;
            }
        }

        /**
         * Loads existing cards when editing an existing deck
         */
        function initExistingCards() {
            if (appState.currentDeckInCreation !== null) {
                let index = 0;
                for (const card of appState.currentDeckInCreation.cards) {
                    const newPreview = document.createElement("card-preview");
                    newPreview.setAttribute("data-front-text", card.frontText);
                    newPreview.setAttribute("data-back-text", card.backText);
                    newPreview.setAttribute("data-time", card.time);
                    newPreview.setAttribute("data-card-index", index);
                    cardList.appendChild(newPreview);
                    index++;
                }
            }
        }

        /**
         * Remove event listeners from the deck creation screen to prevent memory leaks
         */
        function clearEvents() {
            // Remove event listeners
            if (speechForm) { speechForm.removeEventListener("submit", handleDeckNameSubmit) };

            // Remove card form event listener
            if (cardForm) { cardForm.removeEventListener("submit", handleCardSubmit) };

            // Remove save button event listener
            if (saveBtn) { saveBtn.removeEventListener("click", handleSaveDeckAndGoHome) };

            cardList.removeEventListener("edit-card", editCard);
            cardList.removeEventListener("delete-card", deleteCard);

            // Reset the current deck in creation
            appState.currentDeckInCreation = null;
        }
    }

    /**
     * Initialize and swap to the existing decks screen (list view).
     */
    function initExisting() {
        // Add functionality to swap to existing decks screen
        flashcardApp.replaceChildren();
        const existingDecksScreen = document.createElement("existing-screen");
        
        flashcardApp.appendChild(existingDecksScreen);

        // Get references to elements in existing decks screen
        const deckListContainer = existingDecksScreen.querySelector("#deck-list-container");
        const backToHomeBtn = existingDecksScreen.querySelector("#back-button");

        // Add event listeners
        backToHomeBtn.addEventListener("click", swapToHome);

        // Add existing decks to the deck list
        if (Object.keys(appState.decks).length === 0) {
            deckListContainer.innerHTML = `
                <p>There are no decks yet. Please create one.</p>
            `;
        } else {
            for (const deckName in appState.decks) {
                const deck = appState.decks[deckName]
                const deckPreview = document.createElement("deck-preview");
                deckPreview.setAttribute("data-deck-name", deck.deckName);
                deckPreview.setAttribute("data-deck-length", deck.cards.length);
                deckListContainer.appendChild(deckPreview);
            }
        }

        deckListContainer.addEventListener("deck-select", initDeckViewScreen);

        /**
         * Swap to the home screen from the existing deck screen, clears event listeners for elements in the existing deck screen
         */
        function swapToHome() {
            appState.previousScreen = "existing";
            clearEvents();
            initHome();
        }
        
        /**
         * Remove event listeners from the deck creation screen to prevent memory leaks
         */
        function clearEvents() {
            // Remove event listeners
            backToHomeBtn.removeEventListener("click", swapToHome);
        }
    }

    /**
     * Initialize and swap to the screen for viewing/managing a single deck.
     * @param {Event} event Should be a custom event "deck-select" with a detail key containing the values of the deck name
     */
    async function initDeckViewScreen(event) {
        const deckName = event.detail;
        const deckToView = appState.decks[deckName];
        // TODO: Replace alert
        if (!deckToView) {
            console.error(`Deck "${deckName}" not found in appState.`);
            alert("Error: Could not load the selected deck.");
            initExisting(); // Go back to the list if deck not found
            return;
        }

        flashcardApp.replaceChildren();
        const deckViewContainer = document.createElement("deck-screen");
        deckViewContainer.setAttribute("data-deck-name", deckName);
        flashcardApp.appendChild(deckViewContainer);

        // Get references to the buttons
        const cardDisplayArea = deckViewContainer.querySelector(".card-list");
        const studyDeckBtn = deckViewContainer.querySelector(".study-btn");
        const editDeckBtn = deckViewContainer.querySelector(".edit-btn");
        const backToDecksBtn = deckViewContainer.querySelector(".back-btn");

        // Populate Cards
        if (deckToView.cards.length === 0) {
            cardDisplayArea.innerHTML = "<p>This deck has no cards yet. You can add some!</p>";
        } else {
            deckToView.cards.forEach((card, index) => {
                const deckCard = document.createElement("card-preview");
                deckCard.setAttribute("data-front-text", card.frontText);
                deckCard.setAttribute("data-back-text", card.backText);
                deckCard.setAttribute("data-card-index", index);
                if (card.time !== undefined) {
                    deckCard.setAttribute("data-time", String(card.time));
                }
                cardDisplayArea.appendChild(deckCard);
            });
        }

        // Add event listeners
        backToDecksBtn.addEventListener("click", swapToExisting);
        studyDeckBtn.addEventListener("click", initStudy);
        editDeckBtn.addEventListener("click", editDeck);
        cardDisplayArea.addEventListener("delete-card", deleteCard);
        cardDisplayArea.addEventListener("edit-card", editCard);

        /**
         * Sets the current deck to let initCreate() know to use the existing deck instead of creating a new one, clear event listeners, and swap to the create deck screen.
         */
        function editDeck() {
            appState.previousScreen = "deck";
            appState.currentDeckInCreation = deckToView;
            clearEvents();
            initCreate();
        }

        /**
         * Deletes a card from a deck and removes the corresponding element from the DOM
         * @param {Event} event The event that triggered this function (should be "delete-card" event)
         */
        async function deleteCard(event) {
            const index = getIndexInDOM(event.detail);
            // TODO: Dialog confirmation
            const deleted = deckToView.deleteCard(index);
            if (deleted) {
                cardDisplayArea.removeChild(cardDisplayArea.children[index]);
                await saveDeck(deckToView);
            }
        }

        function editCard(event) {
            appState.previousScreen = "deck";
            appState.currentDeckInCreation = deckToView;
            const index = getIndexInDOM(event.detail);
            if (index !== -1) {
                clearEvents();
                initCreate(index);
            }
        }

        /**
         * Clear event listeners before swapping to the existing deck screen
         */
        function swapToExisting() {
            appState.previousScreen = "deck";
            clearEvents();
            initExisting();
        }

        /**
         * Clears events for elements in the deck view screen
         */
        function clearEvents() {
            backToDecksBtn.removeEventListener("click", initExisting);
            studyDeckBtn.removeEventListener("click", initStudy);
            editDeckBtn.removeEventListener("click", editDeck);
            cardDisplayArea.removeEventListener("delete-card", deleteCard);
            cardDisplayArea.removeEventListener("edit-card", editCard);
        }
    }

    /**
     * TO BE REMOVED (POSSIBLY)
     * Handles deleting a specific card from a deck.
     * @param {object} deck The deck object.
     * @param {number} cardIndex The index of the card to delete.
    async function handleDeleteCard(deck, cardIndex) {
        const card = deck.cards[cardIndex];
        if (!card) return;

        const modal = document.createElement("confirmation-modal");
        document.body.appendChild(modal);
        const userConfirmed = await modal.open(
            `Are you sure you want to delete this card?\nFront: "${card.frontText}"`,
            "Delete Card",
            "Cancel"
        );
        document.body.removeChild(modal);

        if (!userConfirmed) {
            return;
        }

        deck.deleteCard(cardIndex);

        try {
            // Save the entire deck after card deletion
            await saveDeck(deck);
            console.log(
                `Card at index ${cardIndex} in deck "${deck.deckName}" deleted and deck saved.`
            );
            // Re-render this deck view to show changes
            initDeckViewScreen(deck.deckName);
        } catch (error) {
            console.error("Error saving deck after deleting card:", error);
            alert("Failed to save changes after deleting card.");
        }
    }
    */

    function initStudy() {
        // TODO: Implement study screen
    }
}

/**
 * Gets the index of an HTML element within its parent (i.e. the 5th child of its parent)
 * @param {HTMLElement} el An HTML element 
 * @returns The index of el or -1 if not found
 */
function getIndexInDOM(el) {
    const parent = el.parentElement;
    let count = 0;
    for (const child of parent.children) {
        if (child === el) {
            return count;
        }
        count++;
    }
    return -1;
}
