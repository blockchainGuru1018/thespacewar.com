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

    let cards = cardDataAssembler.createAll();

    return {
        draw,
        getCardCount: () => cards.length,
        getPossibleMillCount: () => Math.floor(cards.length / 2),
        _getDeck: () => [...cards]
    };

    function draw(count) {
        let result = [];
        for (let i = 0; i < count; i++) {
            result.push(drawSingle());
        }
        return result;
    }

    function drawSingle() {
        const card = cards.shift();
        if (cards.length === 0) {
            cards = cardDataAssembler.createAll();
        }
        return card;

    }
}
