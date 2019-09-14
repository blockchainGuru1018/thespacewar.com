const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    playerStateService,
    matchController,
    decideRowForStationCard,
    decideCardToPlaceAsStationCard,
    playerRuleService
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
        else if (playerRuleService.canPutDownMoreStationCardsThisTurn() && cardsOnHand.length) {
            const stationRow = decideRowForStationCard();
            const location = 'station-' + stationRow;
            const cardId = decideCardToPlaceAsStationCard();
            matchController.emit('putDownCard', { cardId, location });
        }
        else {
            matchController.emit('nextPhase', { currentPhase: PHASES.action });
        }
    }
};
