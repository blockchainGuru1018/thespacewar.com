const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');

module.exports = {
    empty
};

function empty() {
    return {
        phase: 'wait',
        cardsOnHand: [],
        cardsInZone: [],
        cardsInOpponentZone: [],
        stationCards: [],
        discardedCards: [],
        events: [],
        requirements: [],
        commanders: [],
        actionLogEntries: [],
        cardsInDeck: [FakeCardDataAssembler.createCard()],
        clock: {
            events: []
        }
    };
}
