const FakeCardFactory = require('../testUtils/FakeCardFactory.js');

module.exports = FakeDeckFactory;

FakeDeckFactory.fromCards = cards => {
    let cardFactory = { createAll: () => [...cards] };
    return FakeDeckFactory({ cardFactory });
};

FakeDeckFactory.createDeckFromCards = cards => {
    let cardFactory = { createAll: () => [cards.map(c => FakeCardFactory.createCard(c))] };
    return FakeDeck({ cardFactory });
};

function FakeDeckFactory({ cardFactory }) {
    return {
        create: () => FakeDeck({ cardFactory }),
        _getCardFactory: () => cardFactory
    }
}

function FakeDeck(deps) {

    const cardFactory = deps.cardFactory;

    let cards = cardFactory.createAll();

    return {
        draw,
        drawSingle
    }

    function drawSingle() {
        const card = cards.shift();
        if (cards.length === 0) {
            cards = cardFactory.createAll();
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
