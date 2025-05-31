
class DeckScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const deckName = this.getAttribute("data-deck-name");
        this.innerHTML = `
            <header class="deck-view-header">
                <h2 id="deck-view-name">${deckName}</h2>
                <menu class="deck-actions">
                    <button class="study-btn" type="button">Study Deck</button>
                    <button class="edit-btn" type="button">Edit Deck Info</button> 
                    <button class="back-btn" type="button">Back to Decks List</button>
                </menu>
            </header>
            <output class="card-list">
                <!-- Cards will be populated here -->
            </output>
        `;
    }

    disconnectedCallback() {
        this.replaceChildren();
    }
}

customElements.define("deck-screen", DeckScreen);