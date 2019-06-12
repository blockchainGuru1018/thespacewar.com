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
        actionLogEntries: []
    };
}
