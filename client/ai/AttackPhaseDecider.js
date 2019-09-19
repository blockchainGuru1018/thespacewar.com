const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    matchController,
    playerStateService,
    capabilityFactory
}) {

    const Capabilities = [
        capabilityFactory.attackStationCard,
        capabilityFactory.attackInHomeZone,
        CardMoveCapability
    ];

    return {
        decide
    };

    function decide() {
        const cards = getCardsFromBothZones();
        useCardOrProceedToNextPhase(cards);
    }

    function useCardOrProceedToNextPhase(cards) {
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

    function getCardsFromBothZones() {
        const cardDataFromZones = [
            ...playerStateService.getCardsInZone(),
            ...playerStateService.getCardsInOpponentZone()
        ];
        return cardDataFromZones.map(cardData => playerStateService.createBehaviourCard(cardData));
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
};
