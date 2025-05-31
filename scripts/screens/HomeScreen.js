class HomeScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
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
        const style = document.createElement("style");
        style.innerHTML = `
            .title {
                display: flex;
                font-family: "Jersey 10", sans-serif;
                font-weight: 400;
                font-style: normal;
                font-size: 8vw;
                color: var(--white);
                justify-content: center;
            }

            .motto {
                display: flex;
                color: var(--lilac);
                justify-content: center;
                font-family: "Lilita One", sans-serif;
                font-weight: 400;
                font-size: 3vw;
                font-style: normal;
            }
        `;
        this.shadowRoot.append(style);
    }

    disconnectedCallback() {
        this.shadowRoot.replaceChildren();
    }
}

customElements.define("home-screen", HomeScreen);