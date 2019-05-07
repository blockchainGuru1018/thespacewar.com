const obscureOpponentEvents = require('./obscureOpponentEvents.js');
const itemNamesForOpponentByItemNameForPlayer = require('../itemNamesForOpponentByItemNameForPlayer.js');
const StatePreparer = require('./StatePreparer.js');
const obscurerByKey = {
    stationCards: {
        obscure: require('./prepareStationCardsForClient'),
        key: 'stationCards'
    },
    cardsOnHand: {
        obscure(cardsOnHand) {
            return cardsOnHand.length;
        },
        key: 'opponentCardCount'
    },
    events: {
        obscure: obscureOpponentEvents,
        key: 'opponentEvents'
    }
};

const whitelist = [
    'discardedCards',
    'cardsInZone',
    'cardsInOpponentZone',
    'stationCards',
    'cardsOnHand',
    'events',
    'phase'
];

const statePreparer = StatePreparer({
    whitelist,
    obscureHandlerByKey: obscurerByKey,
    alternateItemNames: itemNamesForOpponentByItemNameForPlayer
});
module.exports = statePreparer.prepare;
