class CardPreview extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        const frontText = this.getAttribute("data-front-text");
        const backText = this.getAttribute("data-back-text");
        const time = this.getAttribute("data-time");
        shadow.innerHTML = `
            <p class="front-text">${frontText}</p>
            <p class="back-text">${backText}</p>
            <p class="time-text">${time}s</p>
            <button class="edit-card-btn button-small">Edit</button>
            <button class="delete-card-btn button-small danger">Delete</button>
            <hr>
        `;
        const editBtn = shadow.querySelector(".edit-card-btn");
        const deleteBtn = shadow.querySelector(".delete-card-btn");
        editBtn.addEventListener("click", this.editCard);
        deleteBtn.addEventListener("click", this.deleteCard);
    }

    editCard() {
        const editEvent = new CustomEvent("edit-card", {
            detail: this.getRootNode().host,
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(editEvent);
    }

    deleteCard() {
        const deleteEvent = new CustomEvent("delete-card", {
            detail: this.getRootNode().host,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(deleteEvent);
    }

    disconnectedCallback() {
        const editBtn = this.shadowRoot.querySelector(".edit-card-btn");
        const deleteBtn = this.shadowRoot.querySelector(".delete-card-btn");
        editBtn.removeEventListener("click", this.editCard);
        deleteBtn.removeEventListener("click", this.deleteCard);
        this.shadowRoot.replaceChildren();
    }
}

customElements.define("card-preview", CardPreview);