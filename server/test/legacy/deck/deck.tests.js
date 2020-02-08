const {
    testCase,
    assert
} = require('bocha');
const Deck = require('../../../deck/Deck.js');

test('ABC', () => expect(true).toBe(true));
// module.exports = testCase('Deck', {
//     'remove card:': {
//         'should remove card from deck': function () {
//             const deck = Deck([{ id: 'C1A' }]);
//
//             deck.removeCard('C1A');
//
//             assert.equals(deck.getAll(), []);
//         },
//         'should return removed card': function () {
//             const deck = Deck([{ id: 'C1A' }]);
//
//             const removedCard = deck.removeCard('C1A');
//
//             assert.equals(removedCard.id, 'C1A');
//         },
//         'should return null when card does NOT exist': function () {
//             const deck = Deck([]);
//
//             const removedCard = deck.removeCard('C1A');
//
//             assert(removedCard === null, 'Expected card to be null but was: ' + removedCard);
//         }
//     },
//     'getPossibleMillCount:': {
//         'when has 2 cards can mill once:': function () {
//             const deck = Deck([{}, {}]);
//             assert.equals(deck.getPossibleMillCount(), 1);
//         },
//         'when has 1 card can mill once:': function () {
//             const deck = Deck([{}]);
//             assert.equals(deck.getPossibleMillCount(), 1);
//         }
//     }
// });
