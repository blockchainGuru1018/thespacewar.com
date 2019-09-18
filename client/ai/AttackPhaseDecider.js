const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    matchController,
    playerStateService,
    opponentStateService
}) {

    const Capabilities = [
        CardAttackStationCardCapability,
        CardAttackInHomeZoneCapability,
        CardMoveCapability
    ];

    return {
        decide
    };

    function decide() {
        const cards = getCardsFromBothZones();

        for (const card of cards) {
            for (const Capability of Capabilities) {
                const capability = Capability(card);
                if (capability.canDoIt()) {
                    capability.doIt();
                    return;
                }
            }
        }

        matchController.emit('nextPhase', { currentPhase: PHASES.attack });
    }

    function getTargetStationCardIds() {
        return opponentStateService.getStationCards().map(s => s.id);
    }

    function getCardsFromBothZones() {
        const cardDataFromZones = [
            ...playerStateService.getCardsInZone(),
            ...playerStateService.getCardsInOpponentZone()
        ];
        return cardDataFromZones.map(cardData => playerStateService.createBehaviourCard(cardData));
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
