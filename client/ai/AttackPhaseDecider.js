const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    playerStateService,
    matchController
}) {

    return {
        decide
    };

    function decide() {
        cardsThatCanMove().forEach(card => matchController.emit('moveCard', card.id));

        matchController.emit('nextPhase', { currentPhase: PHASES.attack });
    }

    function cardsThatCanMove() {
        return playerStateService
            .getCardsInZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(card => card.canMove());
    }
};
