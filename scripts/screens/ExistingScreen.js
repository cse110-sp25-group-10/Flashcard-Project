class ExistingScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <h2>Your Decks</h2>
            <output id="deck-list-container"></output>
            <button id="back-button">Back to Home</button>
        `;
    }

    disconnectedCallback() {
        this.replaceChildren();
    }
}

customElements.define("existing-screen", ExistingScreen);