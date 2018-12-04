const FakeCardDataAssembler = require('../testUtils/FakeCardDataAssembler.js');

module.exports = FakeDeckFactory;

FakeDeckFactory.fromCards = cards => {
    let cardDataAssembler = { createAll: () => [...cards] };
    return FakeDeckFactory({ cardDataAssembler });
};

FakeDeckFactory.createDeckFromCards = cards => {
    let cardDataAssembler = { createAll: () => [cards.map(c => FakeCardDataAssembler.createCard(c))] };
    return FakeDeck({ cardDataAssembler });
};

function FakeDeckFactory({ cardDataAssembler }) {
    return {
        create: () => FakeDeck({ cardDataAssembler }),
        _getCardDataAssembler: () => cardDataAssembler
    }
}

function FakeDeck(deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    let cards = cardDataAssembler.createAll();

    return {
        draw,
        drawSingle
    }

    function drawSingle() {
        const card = cards.shift();
        if (cards.length === 0) {
            cards = cardDataAssembler.createAll();
        }
        return card;
    }

    function draw(count) {
        let result = [];
        for (let i = 0; i < count; i++) {
            result.push(drawSingle());
        }
        return result;
    }
}
