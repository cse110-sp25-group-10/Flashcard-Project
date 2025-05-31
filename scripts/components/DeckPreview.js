class DeckPreview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        this.deckName = this.getAttribute("data-deck-name");
        const deckLength = this.getAttribute("data-deck-length");
        const p = document.createElement("p");
        p.textContent = `${this.deckName} (${deckLength} cards)`;
        shadow.appendChild(p);
        const style = document.createElement("style");
        style.innerHTML = `
            p {
                cursor: pointer;
            }
        `;
        shadow.appendChild(style);
        this.addEventListener("click", this.dispatch);
    }

    dispatch() {
        const event = new CustomEvent("deck-select", {
            detail: this.deckName,
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    disconnectedCallback() {
        const p = this.shadowRoot.querySelector("p");
        p.removeEventListener("click", this.dispatch);
        this.shadowRoot.replaceChildren();
    }
}

customElements.define("deck-preview", DeckPreview);