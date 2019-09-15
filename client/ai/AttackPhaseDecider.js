const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    matchController,
    playerStateService,
    opponentStateService
}) {

    return {
        decide
    };

    function decide() {
        cardsThatCanMove().forEach(card => matchController.emit('moveCard', card.id));

        const targetStationCardIds = opponentStateService.getStationCards().map(s => s.id);
        cardsThatCanAttackStation().forEach(card => matchController.emit('attackStationCard', {
            attackerCardId: card.id,
            targetStationCardIds
        }));

        matchController.emit('nextPhase', { currentPhase: PHASES.attack });
    }

    function cardsThatCanMove() {
        return playerStateService
            .getCardsInZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(card => card.canMove());
    }

    function cardsThatCanAttackStation() {
        return playerStateService
            .getCardsInOpponentZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(card => card.canAttackStationCards());
    }
};
