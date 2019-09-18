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

        const toAttackStation = playerStateService
            .getCardsInOpponentZone()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .map(CardAttackStationCardCapability)
            .filter(c => c.canDoIt());
        toAttackStation.forEach(c => c.doIt());

        if (toMove.length === 0 && toAttackStation.length === 0 && toAttackCardInHomeZone.length === 0) {
            matchController.emit('nextPhase', { currentPhase: PHASES.attack });
        }
    }

    function getTargetStationCardIds() {
        return opponentStateService.getStationCards().map(s => s.id);
    }

    function CardAttackStationCardCapability(card) {
        return {
            canDoIt,
            doIt
        };

        function canDoIt() {
            return card.canAttackStationCards();
        }

        function doIt() {
            matchController.emit('attackStationCard', {
                attackerCardId: card.id,
                targetStationCardIds: getTargetStationCardIds()
            });
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

        function attackableOpponentCardsInHomeZone(playerCard) {
            return opponentStateService
                .getCardsInOpponentZone()
                .map(opponentCardData => opponentStateService.createBehaviourCard(opponentCardData))
                .filter(opponentCard => playerCard.canAttackCard(opponentCard));
        }
    }
};