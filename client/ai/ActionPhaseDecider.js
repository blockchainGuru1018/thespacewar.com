const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    playerStateService,
    matchController,
    decideRowForStationCard
}) {

    return {
        decide
    };

    function decide() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const actionPoints = playerStateService.getActionPointsForPlayer();
        const affordableCard = cardsOnHand.find(c => c.cost <= actionPoints && c.type === 'spaceShip');
        if (affordableCard) {
            matchController.emit('putDownCard', { cardId: affordableCard.id, location: 'zone' });
        }
        else if (cardsOnHand.some(c => c.cost > actionPoints)) {
            const stationRow = decideRowForStationCard();
            const location = 'station-' + stationRow;
            const cardId = cardsOnHand.find(c => c.cost > actionPoints).id;
            matchController.emit('putDownCard', { cardId, location });
        }
        else {
            matchController.emit('nextPhase', { currentPhase: PHASES.action });
        }
    }
};
