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
    }
};

const whitelist = [
    'discardedCards',
    'cardsInZone',
    'cardsInOpponentZone',
    'stationCards',
    'cardsOnHand'
];

const statePreparer = StatePreparer({
    whitelist,
    obscureHandlerByKey: obscurerByKey,
    alternateItemNames: itemNamesForOpponentByItemNameForPlayer
})
module.exports = statePreparer.prepare;