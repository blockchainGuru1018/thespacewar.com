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
        const toAttackCardInHomeZone = cardsThatCanAttackCardsInHomeZone();
        toAttackCardInHomeZone.forEach(card => {
            const defenderCard = attackableOpponentCardsInHomeZone(card)[0];
            matchController.emit('attack', {
                attackerCardId: card.id,
                defenderCardId: defenderCard.id
            });
        });

        let toMove = [];
        if (toAttackCardInHomeZone.length === 0) {
            toMove = cardsThatCanMove();
            toMove.forEach(card => matchController.emit('moveCard', card.id));
        }

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

    function cardsThatCanAttackCardsInHomeZone() {
        return playerStateService
            .getCardsInZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(card => attackableOpponentCardsInHomeZone(card).length > 0);
    }

    function attackableOpponentCardsInHomeZone(playerCard) {
        return opponentStateService
            .getCardsInOpponentZone()
            .map(opponentCardData => opponentStateService.createBehaviourCard(opponentCardData))
            .filter(opponentCard => playerCard.canAttackCard(opponentCard));
    }
};
