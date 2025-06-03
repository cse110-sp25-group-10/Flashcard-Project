import { Card } from "../scripts/deck.js";
import { Deck } from "../scripts/deck.js";

// im not sure how to set this up :(
import * as database from "../scripts/database.js";
import { saveDeck, getDeck, deleteDeckDB } from "../scripts/database.js";

test("creates a Deck and saves it to the database", async () => {
    const deck = Deck("Example Title");
    const card1 = Card("Example Topic1", "Example description1", 10);
    const card2 = Card("Example Topic2", "Example description2", 15);
    const card3 = Card("Example Topic3", "Example description3", 20);
    deck.addCard(card1);
    deck.addCard(card2);
    deck.addCard(card3);

    await saveDeck(deck);
    const savedDeck = await getDeck(deck.deckName);
    expect(savedDeck.deckName).toStrictEqual(deck.deckName);
    // also expect for the actual deck but have deckName only for now until it is imported correctly
});

test("creates a Deck and saves it to the database", async () => {
    const whalesDeck = Deck("Whales");
    const whalesCard1 = Card("What are whales?", "Whales are a marine mammal.", 10);
    const whalesCard2 = Card("Habitat", "They live in the ocean.", 15);
    const whalesCard3 = Card("Food they eat", "Whales like to eat krill and plankton", 20);
    deck.addCard(whalesCard1);
    deck.addCard(whalesCard2);
    deck.addCard(whalesCard3);

    const tigersDeck = Deck("Tigers");
    const tigerCard1 = Card("What are tigers?", "Tigers are a land mammal.", 10);
    const tigerCard2 = Card("Habitat", "They live in the rainforests.", 15);
    const tigerCard3 = Card("Food they eat", "Whales like to eat krill and plankton", 20);
    deck.addCard(tigerCard1);
    deck.addCard(tigerCard2);
    deck.addCard(tigerCard3);

    await saveDeck(whalesDeck);
    await saveDeck(tigersDeck);


    // const savedDeck = await getDeck(deck.deckName);
    // expect(savedDeck.deckName).toStrictEqual(deck.deckName);
    // also expect for the actual deck but have deckName only for now until it is imported correctly
});