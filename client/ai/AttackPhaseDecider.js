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
        const cards = playerStateService.getCardsInZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData));

        const toAttackCardInHomeZone = cards.map(CardAttackInHomeZoneCapability).filter(c => c.canDoIt());
        toAttackCardInHomeZone.forEach(c => c.doIt());

        let toMove = [];
        if (toAttackCardInHomeZone.length === 0) {
            toMove = cards.map(CardMoveCapability).filter(c => c.canDoIt());
            toMove.forEach(c => c.doIt());
        }

        const targetStationCardIds = opponentStateService.getStationCards().map(s => s.id);
        const toAttackStation = cardsThatCanAttackStation();
        toAttackStation.forEach(card => matchController.emit('attackStationCard', {
            attackerCardId: card.id,
            targetStationCardIds
        }));

        if (toMove.length === 0 && toAttackStation.length === 0 && toAttackCardInHomeZone.length === 0) {
            matchController.emit('nextPhase', { currentPhase: PHASES.attack });
        }
    }

    function CardMoveCapability(card) {
        return {
            canDoIt,
            doIt
        };

        function canDoIt() {
            return card.canMove();
        }

        function doIt() {
            matchController.emit('moveCard', card.id);
        }
    }

    function CardAttackInHomeZoneCapability(card) {
        return {
            canDoIt,
            doIt
        };

        function canDoIt() {
            const targets = attackableOpponentCardsInHomeZone(card);
            return targets.length > 0;
        }

        function doIt() {
            const targets = attackableOpponentCardsInHomeZone(card);

            matchController.emit('attack', {
                attackerCardId: card.id,
                defenderCardId: targets[0].id
            });
        }
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
