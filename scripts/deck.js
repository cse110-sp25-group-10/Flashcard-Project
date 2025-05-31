/**
 * Creates a speech card with the appropriate data.
 * @param {string} frontText The text for the front of the card
 * @param {string} backText The text for the back of the card
 * @param {number} time The time length the user expects to spend on a card (in seconds)
 * @returns A JS object representing the speech card if valid and null otherwise
 */
export const Card = function createCard(frontText, backText, time) {
    // Validate that frontText and backText are strings and that time is a number
    // Validate that the front text is between 1 and 60 characters (inclusive)
    // Validate that the back text is between 1 and 250 characters (inclusive)
    // Validate that the time length is between 1 and 60 seconds (inclusive)
    if (typeof frontText !== "string" || typeof backText !== "string") {
        return null;
    }
    if (frontText.length === 0 || frontText.length > 60) {
        return null;
    }
    if (backText.length === 0 || backText.length > 250) {
        return null;
    }
    if (typeof time !== "number" || isNaN(time)) {
        return null;
    }
    if (time < 1 || time > 60) {
        return null;
    }

    return {
        "frontText": frontText,
        "backText": backText,
        "time": time,
    };
};

/**
 * Create a deck object with Deck()
 * @param {string} deckName The name of the deck
 * @returns A deck object if successfully created and null otherwise
 */
export const Deck = function createDeck(deckName) {
    if (typeof deckName !== "string") {
        return null;
    }
    if (deckName.length === 0 || deckName.length > 60) {
        return null;
    }

    const deckInstance = {
        "deckName": deckName,
        "cards": [],

        /**
         * Adds a card to the array cards
         * @param {object} card An object representing a card from createCard()
         * @returns Returns true if the card was added and false otherwise
         */
        addCard(card) {

            // Null check
            if(card === null || card === undefined)
            {
                console.error("Card is not valid");
                return false;
            }

            // Validate the card
            if (
                typeof card !== "object" ||
                // Make sure the newCard object has the correct properties
                !Object.hasOwn(card, "frontText") ||
                !Object.hasOwn(card, "backText") ||
                !Object.hasOwn(card, "time")
            ) {
                console.error("Invalid card.");
                return false;
            }

            this.cards.push(card);
            return true;
        },

        /**
         * Returns a card at an index
         * @param {number} index Where in the deck order the specified card is located
         * @returns A JS object representing the speech card at the specified index if valid and null otherwise
         */
        readCard(index) {
            // TODO: Validation
            // Check whether deck is empty/null before running if statement
            if (this.cards.length === 0) {
                return null;
            }
            // Check that index is inbounds
            if (index >= this.cards.length || index < 0) {
                return null;
            }

            return this.cards[index];
        },

        /**
         * Removes a card at an index of the deck
         * @param {number} index Where in the deck order the specified card is located
         * @returns The card that was deleted if valid and null otherwise
         */
        deleteCard(index) {
            // TOOD: Validation
            // Check if deck already empty
            if (this.cards.length === 0) {
                return null;
            }
            // Check that index is inbounds
            if (index >= this.cards.length || index < 0) {
                return null;
            }

            const deletedCard = this.cards.splice(index, 1);

            return deletedCard.length > 0 ? deletedCard[0] : null;
        },

        /**
         * Updates a card at an index of a deck with a new card
         * @param {number} index - The index of the card to update
         * @param {Object} newCard - The new card to update with
         * @returns {boolean} - Returns true if the card was updated successfully, false otherwise
         */
        updateCard(index, newCard) {

            // Check if null
            if(newCard === null || newCard === undefined)
            {
                console.error("newCard is not valid.");
                return false;
            }
            // Validate the index
            if (index < 0 || index >= this.cards.length) {
                console.error("Invalid index for updateCard.");
                return false;
            }
            // Validate the new card
            if (
                typeof newCard !== "object" ||
                // Make sure the newCard object has the correct properties
                !Object.hasOwn(newCard, "frontText") ||
                !Object.hasOwn(newCard, "backText") ||
                !Object.hasOwn(newCard, "time")
            ) {
                console.error(
                    "Invalid newCard object for updateCard. It must be a complete card object."
                );
                return false;
            }

            // Same Validation as createCard
            if (
                typeof newCard.frontText !== "string" ||
                newCard.frontText.length === 0 ||
                newCard.frontText.length > 60
            ) {
                console.error("Invalid frontText for updateCard.");
                return false;
            }
            if (
                typeof newCard.backText !== "string" ||
                newCard.backText.length === 0 ||
                newCard.backText.length > 250
            ) {
                console.error("Invalid backText for updateCard.");
                return false;
            }
            if (typeof newCard.time !== "number" || newCard.time < 1 || newCard.time > 60) {
                console.error("Invalid time for updateCard.");
                return false;
            }

            // Update the card
            this.cards[index] = newCard;
            return true;
        },
    };

    return deckInstance;
};

/**
 * Shuffles the cards in a deck
 * @param {Array} deck - The deck of cards
 * @returns True if the deck was shuffled and false otherwise
 */
export function shuffleCards(deck) {
    if (!Array.isArray(deck)) {
        console.error("Invalid deck for shuffleDeck.");
        return false;
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements using a temporary variable
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return true;
}
