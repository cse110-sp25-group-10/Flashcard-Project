class HomeScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <!-- title, motto text -->
            <header class="top">
                <h1 class="title">10x Cards</h1>
                <h3 class="motto">Study Less, Learn 10x More</h3>
            </header>

            <!-- two buttons, remember to have them glow when you hover over them -->
            <main class="flash-card-container">
                <button class="create-deck">Create a New Deck</button>
                <button class="existing-decks">Study or Edit an Exisiting Deck</button>
            </main>
        `;
    }

    disconnectedCallback() {
        this.replaceChildren();
    }
}

customElements.define("home-screen", HomeScreen);