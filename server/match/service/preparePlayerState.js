const StatePreparer = require('./StatePreparer');
const obscureHandlerByKey = {
    stationCards: {
        obscure: require('./prepareStationCardsForClient'),
        key: 'stationCards'
    },
    cardsInDeck: {
        obscure(cardsInDeck) {
            return cardsInDeck.length;
        },
        key: 'playerCardsInDeckCount'
    }
};

const whitelist = [
    'discardedCards',
    'cardsInZone',
    'cardsInOpponentZone',
    'stationCards',
    'cardsOnHand',
    'cardsInDeck',
    'events',
    'requirements',
    'phase',
    'actionLogEntries',
    'commanders',
    'clock'
];

module.exports = StatePreparer({ obscureHandlerByKey, whitelist }).prepare;
