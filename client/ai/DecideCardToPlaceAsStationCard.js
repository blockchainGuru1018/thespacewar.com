const CardTypeComparer = require('./CardTypeComparer.js');
const CardCostComparer = require('./CardCostComparer.js');

module.exports = function ({
    playerStateService
}) {
    return () => {
        return playerStateService.getCardsOnHand()[0].id;
    };
};
