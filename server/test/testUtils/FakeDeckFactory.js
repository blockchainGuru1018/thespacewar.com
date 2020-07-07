const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const FakeDeck = require("./FakeDeck.js");

module.exports = FakeDeckFactory;

FakeDeckFactory.fromCards = (cards) => {
    const cardDataAssembler = FakeCardDataAssembler({
        createAll: () => [...cards],
    });
    return FakeDeckFactory({ cardDataAssembler });
};

FakeDeckFactory.createDeckFromCards = (cards) => {
    const cardDataAssembler = FakeCardDataAssembler({
        createAll: () => cards.map((c) => FakeCardDataAssembler.createCard(c)),
    });
    return FakeDeck({ cardDataAssembler });
};

function FakeDeckFactory({ cardDataAssembler }) {
    return {
        create: () => FakeDeck({ cardDataAssembler }),
        _getCardDataAssembler: () => cardDataAssembler,
    };
}
