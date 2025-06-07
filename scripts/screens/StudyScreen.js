import { saveDeck } from "../database.js";
import { shuffleCards } from "../deck.js";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" href="../../stylesheets/styles.css">
    <link rel="stylesheet" href="../../stylesheets/deck_selection.css">
    <link rel="stylesheet" href="../../stylesheets/preparing_speech.css">
    <link rel="stylesheet" href="../../stylesheets/existing_flashcard.css">
    <link rel="stylesheet" href="../../stylesheets/study_screen.css">
    <header>
        <h2 id="deck-name" class="title"></h2>
        <button id="back-button">Back</button>
    </header>
    <section id="card-container" class="flash-card-container">
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="card card-front"></div>
                <div class="card card-back"></div>
            </div>
        </div>
    </section>
    <span class="card-counter">Card 0 / 0</span>
    <div class="card-timestamps"></div>
    <button id="clear-attempts-button" style="margin-top:8px;">Clear Attempts</button>
    <footer>
        <section class="status">
            <button id="practice-button">Start Practice</button>
            <button id="shuffle-toggle-button">Shuffle: On</button>
            <span class="timer">Time: 0s</span>
        </section>
        <nav class="controls bottom">
            <button id="prev-card" disabled>Previous</button>
            <button id="flip-card" disabled>Flip</button>
            <button id="next-card" disabled>Next</button>
        </nav>
    </footer>
`;

class StudyScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._deck = null;
        this.shuffledCards = [];
        this.shouldShuffle = true;
        this.currentIndex = 0;
        this.isPracticing = false;
        this.timerInterval = null;
        this.cardTime = 0;
    }

    set deck(deckData) {
        this._deck = deckData;
        this.shuffledCards = [...this._deck.cards]; // Start with unshuffled
    }

    connectedCallback() {
        // Get element references
        this.elements = {
            deckName: this.shadowRoot.querySelector("#deck-name"),
            backButton: this.shadowRoot.querySelector("#back-button"),
            practiceButton: this.shadowRoot.querySelector("#practice-button"),
            timer: this.shadowRoot.querySelector(".timer"),
            cardCounter: this.shadowRoot.querySelector(".card-counter"),
            prevButton: this.shadowRoot.querySelector("#prev-card"),
            flipButton: this.shadowRoot.querySelector("#flip-card"),
            nextButton: this.shadowRoot.querySelector("#next-card"),
            cardContainer: this.shadowRoot.querySelector("#card-container"),
            cardFront: this.shadowRoot.querySelector(".card-front"),
            cardBack: this.shadowRoot.querySelector(".card-back"),
            flipCardContainer: this.shadowRoot.querySelector(".flip-card"),
            cardTimestamps: this.shadowRoot.querySelector(".card-timestamps"),
            clearAttemptsButton: this.shadowRoot.querySelector("#clear-attempts-button"),
            shuffleToggleButton: this.shadowRoot.querySelector("#shuffle-toggle-button"),
        };

        // Add event listeners using named functions
        this.elements.backButton.addEventListener("click", this.handleBackButtonClick.bind(this));
        this.elements.practiceButton.addEventListener(
            "click",
            this.handlePracticeButtonClick.bind(this)
        );

        this.elements.shuffleToggleButton = this.shadowRoot.querySelector("#shuffle-toggle-button");
        this.elements.shuffleToggleButton.addEventListener("click", this.handleShuffleToggleClick.bind(this));

        
        this.elements.nextButton.addEventListener("click", this.handleNextButtonClick.bind(this));
        this.elements.prevButton.addEventListener("click", this.handlePrevButtonClick.bind(this));
        this.elements.flipButton.addEventListener("click", this.handleFlipButtonClick.bind(this));
        this.elements.cardContainer.addEventListener(
            "click",
            this.handleCardContainerClick.bind(this)
        );
        this.elements.clearAttemptsButton.addEventListener(
            "click",
            this.handleClearAttemptsClick.bind(this)
        );

        this.updateShuffleButtonLabel();

        this.render();
    }

    disconnectedCallback() {
        // Clean up the timer when the element is removed
        this.stopTimer();
    }

    /**
     * Toggles the practice mode on and off.
     * When starting, shuffles cards and resets timer.
     * When ending, saves practice times.
     */
    togglePracticeMode() {
        if (this.isPracticing) {
            // Save time spent on the current card before ending practice
            this.saveCurrentCardTime();
            // Practice is ending: save times to IndexedDB
            this.savePracticeTimes();
        }

        this.isPracticing = !this.isPracticing;
        if (this.isPracticing) {
            this.practiceTimes = Array(this.shuffledCards.length).fill(0);
            this.practiceStart = Date.now();
            this.lastCardIndex = this.currentIndex;
            // Shuffle the deck depending on toggleable state
            this.shuffledCards = this.shouldShuffle
                ? shuffleCards([...this._deck.cards])
                : [...this._deck.cards];
        
            this.currentIndex = 0;

            // Update UI
            this.elements.practiceButton.textContent = "End Practice";
            this.elements.practiceButton.classList.add("active");
            this.elements.flipButton.removeAttribute("disabled");
            this.elements.shuffleToggleButton.disabled = this.isPracticing;
            this.startTimer();

            // Switch to practice mode layout
            this.elements.cardContainer.classList.add("practice-mode");
        } else {
            // Reset to initial state
            this.shuffledCards = [...this._deck.cards];
            this.currentIndex = 0;

            // Update UI
            this.elements.practiceButton.textContent = "Start Practice";
            this.elements.practiceButton.classList.remove("active");
            this.elements.flipButton.setAttribute("disabled", "");
            this.stopTimer();
            this.elements.timer.textContent = "Time: 0s";

            // Switch to default layout
            this.elements.cardContainer.classList.remove("practice-mode");
            this.elements.shuffleToggleButton.disabled = false;

        }
        this.render();
    }

    /**
     * Navigates to the next or previous card.
     * @param {number} direction - 1 for next, -1 for previous.
     */
    navigateCard(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.shuffledCards.length) {
            if (this.isPracticing) {
                // Save time spent on current card
                this.saveCurrentCardTime();
            }
            this.currentIndex = newIndex;
            if (this.isPracticing) {
                this.startTimer();
            }
            this.render();
        }
    }

    /**
     * Flips the current card to show the back or front.
     */
    flipCard() {
        if (!this._deck || this._deck.cards.length === 0 || !this.isPracticing) return;
        this.elements.flipCardContainer.classList.toggle("flipped");
    }

    /**
     * Renders the current state of the study screen.
     * Updates card content, navigation, and practice data.
     */
    render() {
        if (!this._deck) return;

        // Always reset flip on render in practice mode
        if (this.isPracticing) {
            this.elements.flipCardContainer.classList.remove("flipped");
        }

        // Update deck name
        this.elements.deckName.textContent = `Studying: ${this._deck.deckName}`;

        const cardCount = this.shuffledCards.length;
        if (cardCount === 0) {
            this.elements.cardFront.textContent = "This deck has no cards.";
            this.elements.cardBack.textContent = "";
            this.elements.cardCounter.textContent = "Card 0 / 0";
            this.elements.practiceButton.setAttribute("disabled", "");
            return;
        }

        // Enable/disable navigation buttons
        this.elements.nextButton.disabled = this.currentIndex >= cardCount - 1;
        this.elements.prevButton.disabled = this.currentIndex <= 0;

        // Update card content
        const currentCard = this.shuffledCards[this.currentIndex];
        this.elements.cardFront.textContent = currentCard.frontText;
        this.elements.cardBack.textContent = currentCard.backText;

        // Update card counter
        this.elements.cardCounter.textContent = `Card ${this.currentIndex + 1} / ${cardCount}`;

        // Display all timestamps for the current card
        const originalCard = this._deck.cards.find(
            (card) =>
                card.frontText === currentCard.frontText && card.backText === currentCard.backText
        );

        if (
            originalCard &&
            Array.isArray(originalCard.practiceTimes) &&
            originalCard.practiceTimes.length > 0
        ) {
            let html =
                "<strong>All attempts for this card:</strong><ul style='margin:0;padding-left:1.2em'>";
            originalCard.practiceTimes.forEach((t, i) => {
                html += `<li>Attempt ${i + 1}: ${t}s</li>`;
            });
            html += "</ul>";
            this.elements.cardTimestamps.innerHTML = html;
        } else {
            this.elements.cardTimestamps.innerHTML = "<em>No practice data for this card yet.</em>";
        }
    }

    /**
     * Updates the displayed timestamps for the current card.
     * @param {Object} card - The current card object.
     */
    updateCardTimestamps(card) {
        const container = this.shadowRoot.querySelector(".card-timestamps");
        container.innerHTML = ""; // Clear previous timestamps

        if (!card.practiceTimes || card.practiceTimes.length === 0) {
            const noDataMessage = document.createElement("div");
            noDataMessage.textContent = "No practice data available for this card.";
            container.appendChild(noDataMessage);
            return;
        }

        // Create a list to display all practice times for the card
        const list = document.createElement("ul");
        card.practiceTimes.forEach((time, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Attempt ${index + 1}: ${time}s`;
            list.appendChild(listItem);
        });

        container.appendChild(list);
    }

    /**
     * Starts the timer for the current card.
     */
    startTimer() {
        this.stopTimer();
        this.cardTime = 0;
        this.elements.timer.textContent = "Time: 0s";
        this.timerInterval = setInterval(() => {
            this.cardTime++;
            this.elements.timer.textContent = `Time: ${this.cardTime}s`;
        }, 1000);
        this.practiceStart = Date.now();
    }

    /**
     * Stops the current timer.
     */
    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    /**
     * Save practice times for each card to IndexedDB.
     */
    async savePracticeTimes() {
        // Attach times to each card in the original deck order
        for (let i = 0; i < this.shuffledCards.length; i++) {
            const shuffledCard = this.shuffledCards[i];
            const originalIndex = this._deck.cards.findIndex(
                (card) =>
                    card.frontText === shuffledCard.frontText &&
                    card.backText === shuffledCard.backText
            );
            if (originalIndex !== -1) {
                const card = this._deck.cards[originalIndex];
                if (!Array.isArray(card.practiceTimes)) card.practiceTimes = [];
                
                // Push new time into specific card
                card.practiceTimes.push(this.practiceTimes[i]);

                // Remove oldest attempt to keep 5 latest attempts per card
                while (card.practiceTimes.length > 5) {
                    card.practiceTimes.shift();
                }
            }
        }
        // Save the deck
        if (this._deck) {
            await saveDeck(this._deck);
        }
    }

    /**
     * Save the time spent on the current card.
     */
    saveCurrentCardTime() {
        if (!this.practiceTimes) return;
        const elapsed = Math.floor((Date.now() - this.practiceStart) / 1000);
        this.practiceTimes[this.currentIndex] += elapsed;
        this.practiceStart = Date.now();
    }

    // Event handler functions
    handleBackButtonClick() {
        this.dispatchEvent(new CustomEvent("study-finished"));
    }

    handlePracticeButtonClick() {
        this.togglePracticeMode();
    }

    handleNextButtonClick() {
        this.navigateCard(1);
    }

    handlePrevButtonClick() {
        this.navigateCard(-1);
    }

    handleFlipButtonClick() {
        this.flipCard();
    }

    handleCardContainerClick() {
        this.flipCard();
    }

    handleShuffleToggleClick() {
        this.shouldShuffle = !this.shouldShuffle;
        this.elements.shuffleToggleButton.textContent = `Shuffle: ${this.shouldShuffle ? "On" : "Off"}`;
    }

    updateShuffleButtonLabel() {
        this.elements.shuffleToggleButton.textContent = `Shuffle: ${this.shouldShuffle ? "On" : "Off"}`;
    }
    
    

    /**
     * Handles clearing attempts for the current card.
     * Shows a dialog to choose between clearing the last attempt or all attempts.
     */
    async handleClearAttemptsClick() {
        const currentCard = this.shuffledCards[this.currentIndex];
        const originalCard = this._deck.cards.find(
            (card) =>
                card.frontText === currentCard.frontText && card.backText === currentCard.backText
        );
        if (!originalCard || !Array.isArray(originalCard.practiceTimes)) return;

        // Custom dialog with two options
        const dialog = document.createElement("dialog");
        dialog.className = "custom-dialog";
        dialog.innerHTML = `
            <form method="dialog">
                <p>What would you like to clear?</p>
                <menu>
                    <button value="clear-current">Clear Current Attempt</button>
                    <button value="clear-all" autofocus>Clear All Attempts</button>
                    <button value="cancel">Cancel</button>
                </menu>
            </form>
        `;
        document.body.appendChild(dialog);

        const result = await new Promise((resolve) => {
            function handleClose() {
                resolve(dialog.returnValue);
                dialog.removeEventListener("close", handleClose);
                dialog.remove();
            }
            dialog.addEventListener("close", handleClose);
            dialog.showModal();
        });

        if (result === "clear-all") {
            originalCard.practiceTimes = [];
            await saveDeck(this._deck);
            this.render();
        } else if (result === "clear-current") {
            if (originalCard.practiceTimes.length > 0) {
                originalCard.practiceTimes.pop();
                await saveDeck(this._deck);
                this.render();
            }
        }
    }
}

customElements.define("study-screen", StudyScreen);
