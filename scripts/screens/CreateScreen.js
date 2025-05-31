class CreateScreen extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <!-- whole top part is going to be a form -->
            <button type="button" id="save-button">Save & Finish</button>
            <form id="speech-form">
                <!-- title this speech text field, save and finish button -->
                <fieldset class="top">
                    <label for="title-speech">Speech Name:</label>
                    <input type="text" id="title-speech" name="title-speech">
                </fieldset>
                <button type="submit" id="save-name-button">Save</button>
            </form>
            <form id="customize-card">
                <!-- previous button, front of card, back of card, next button -->
                <fieldset class="flash-card-container">
                    <button type="button" class="previous-card-button">left arrow</button>

                    <!-- textareas let us go multi-line, also do we want the user to be able to easily do bullet points? -->
                    <textarea id="input-front-card" placeholder="[Add Text]"></textarea>
                    <textarea id="input-back-card" placeholder="[Add Text]"></textarea>

                    <button type="button" class="next-card-button">right arrow</button>
                </fieldset>

                <fieldset class="bottom">
                    <label for="set-time">Time Length:</label>
                    <input id="set-time" name="set-time" type="number" placeholder="5">
                    <button type="submit" id="upload-card">Upload Card</button>
                </fieldset>
            </form>

            <output class="flash-card-list-container"></output>
            <br>
            <button type="button" id="back-button">Back</button>
        `;
    }

    disconnectedCallback() {
        this.replaceChildren();
    }
}

customElements.define("create-screen", CreateScreen);
