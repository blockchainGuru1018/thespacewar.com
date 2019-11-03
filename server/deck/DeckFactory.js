const Deck = require('./Deck.js');

module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    return {
        create,
        createCardsForDeck
    };

    function create(cards) {
        return Deck(cards);
    }

    function createCardsForDeck() {
        const deck = cardDataAssembler.createAll();
        shuffle(deck);
        return deck;
    }
};

function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}
