class CardPreview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const frontText = this.getAttribute("data-front-text");
        const backText = this.getAttribute("data-back-text");
        shadow.innerHTML = `
            <p>${frontText}</p>
            <hr>
            <p>${backText}</p>
        `;
    }
}

customElements.define("card-preview", CardPreview);