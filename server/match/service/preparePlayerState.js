const StatePreparer = require('./StatePreparer');
const obscureHandlerByKey = {
    stationCards: {
        obscure: require('./prepareStationCardsForClient'),
        key: 'stationCards'
    }
};

const whitelist = [
    'discardedCards',
    'cardsInZone',
    'cardsInOpponentZone',
    'stationCards',
    'cardsOnHand',
    'events',
    'requirements',
    'phase'
];

module.exports = StatePreparer({ obscureHandlerByKey, whitelist }).prepare;
