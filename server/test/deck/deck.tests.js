const {
    testCase,
    assert
} = require('bocha');
const Deck = require('../../deck/Deck.js');

module.exports = testCase('Deck', {
    'remove card:': {
        'should remove card from deck': function () {
            const cards = [{ id: 'C1A' }];
            const deck = Deck({ cardDataAssembler: { createAll: () => cards } });

            deck.removeCard('C1A');

            assert.equals(deck.getAll(), []);
        },
        'should return removed card': function () {
            const cards = [{ id: 'C1A' }];
            const deck = Deck({ cardDataAssembler: { createAll: () => cards } });

            const removedCard = deck.removeCard('C1A');

            assert.equals(removedCard.id, 'C1A');
        },
        'should return null when card does NOT exist': function () {
            const deck = Deck({ cardDataAssembler: { createAll: () => [] } });

            const removedCard = deck.removeCard('C1A');

            assert(removedCard === null, 'Expected card to be null but was: ' + removedCard);
        }
    }
});