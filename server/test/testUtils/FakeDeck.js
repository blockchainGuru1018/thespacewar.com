const Deck = require('../../deck/Deck.js');

module.exports = FakeDeck;

FakeDeck.fromCards = cards => {
    return FakeDeck({
        cardDataAssembler: {
            createAll: () => [...cards]
        }
    });
};

FakeDeck.realDeckFromCards = cards => {
    return Deck({
        cardDataAssembler: {
            createAll: () => [...cards]
        }
    });
};

function FakeDeck(deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    const cards = cardDataAssembler.createRegularDeck();

    return {
        draw,
        getCardCount: () => cards.length,
        getPossibleMillCount: () => Math.floor(cards.length / 2),
        _getDeck: () => [...cards]
    };

    function draw(count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(drawSingle());
        }
        return result;
    }

    function drawSingle() {
        return cards.shift();
    }
}
