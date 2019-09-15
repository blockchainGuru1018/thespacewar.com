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
        const toMove = cardsThatCanMove();
        toMove.forEach(card => matchController.emit('moveCard', card.id));

        const targetStationCardIds = opponentStateService.getStationCards().map(s => s.id);
        const toAttackStation = cardsThatCanAttackStation();
        toAttackStation.forEach(card => matchController.emit('attackStationCard', {
            attackerCardId: card.id,
            targetStationCardIds
        }));

        if (toMove.length === 0 && toAttackStation.length === 0) {
            matchController.emit('nextPhase', { currentPhase: PHASES.attack });
        }
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
