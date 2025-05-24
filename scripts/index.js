import "./screens/HomeScreen.js";
import "./screens/CreateScreen.js";
import "./components/CardPreview.js"
import { Deck, Card } from "./deck.js";

window.addEventListener("DOMContentLoaded", init);

function init() {
    const flashcardApp = document.querySelector("flashcard-app");
    initHome();

    /**
     * Swap to the home screen
     */
    function initHome() {
        flashcardApp.replaceChildren();
        const homeScreen = document.createElement("home-screen");
        flashcardApp.appendChild(homeScreen);

        // Get references to the buttons within the home screen
        const createDeck = document.querySelector(".create-deck");
        const existingDecks = document.querySelector(".existing-decks");

        // Add event listeners
        createDeck.addEventListener("click", swapToCreate);
        existingDecks.addEventListener("click", swapToExisting);

        /**
         * Swap to the deck creation screen
         */
        function swapToCreate() {
            clearEvents();
            initCreate();
        }

        /**
         * Swap to the existing decks screen
         */
        function swapToExisting() {
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
     */
    function initCreate() {
        // TODO: Set up creation screen implementation
        flashcardApp.replaceChildren();
        const createScreen = document.createElement("create-screen");
        flashcardApp.appendChild(createScreen);

        // Create an empty deck
        const newDeck = Deck("Example Deck");

        // Get references to buttons
        const saveBtn = flashcardApp.querySelector("#save-button");

        // Get references to card form elements
        const cardForm = flashcardApp.querySelector("#customize-card");
        const front = flashcardApp.querySelector("#input-front-card");
        const back = flashcardApp.querySelector("#input-back-card");
        const time = flashcardApp.querySelector("#set-time");
        const cardList = flashcardApp.querySelector("output");

        // Get references to speech form elements
        const speechForm = flashcardApp.querySelector("#speech-form");
        const speechName = flashcardApp.querySelector("#title-speech");
        

        // Add event listeners
        cardForm.addEventListener("submit", validateCard);
        speechForm.addEventListener("submit", validateName);
        saveBtn.addEventListener("click", swapToHome);

        /**
         * Swap to the home screen
         */
        function swapToHome() {
            // TODO: Save the deck
            clearEvents();
            initHome();
        }

        /**
         * Validates that the user input creates a valid card and if so, add it's to the deck
         * @param {Event} event The event that causes this function to trigger (should be submit)
         */
        function validateCard(event) {
            event.preventDefault();
            const frontText = front.value;
            const backText = back.value;
            const timeNum = Number(time.value);

            // Attempt to create a new card using given values
            const newCard = Card(frontText, backText, timeNum); 
            // If a card is successfully created (i.e. not null), add it to the deck
            if (newCard !== null) {
                const added = newDeck.addCard(newCard);
                // If a card is successfully added to the deck, render it in the preview
                if (added) {
                    const newPreview = document.createElement("card-preview");
                    newPreview.setAttribute("data-front-text", frontText);
                    newPreview.setAttribute("data-back-text", backText);
                    cardList.appendChild(newPreview);
                    front.value = "";
                    back.value = "";
                    time.value = "";
                }
            }
        }

        /**
         * Updates the name of the deck if it is valid
         * @param {Event} event The event that causes this function to trigger (should be submit)
         * @returns Returns if the name is invalid
         */
        function validateName(event) {
            event.preventDefault();
            const name = speechName.value;
            if (typeof name !== 'string') { return; }
            if (name.length === 0 || name.length > 60) { return; }
            newDeck["deckName"] = name;
        }

        /**
         * Remove event listeners from the deck creation screen to prevent memory leaks
         */
        function clearEvents() {
            cardForm.removeEventListener("onsubmit", validateCard);
            speechForm.removeEventListener("submit", validateName);
            saveBtn.removeEventListener("click", swapToHome);
        }
    }

    function initExisting() {
        // TODO: Add functionality to swap to existing decks screen
    }
}