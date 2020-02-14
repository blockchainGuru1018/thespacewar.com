const FindCardRequirementFactory = require('./FindCardRequirementFactory.js');
const CounterCardRequirementFactory = require('./CounterCardRequirementFactory.js');
const CounterAttackRequirementFactory = require('./CounterAttackRequirementFactory.js');

module.exports = function ({
    sourceFetcher,
    queryAttacks,
    playerStateService,
    opponentStateService
}) {

    const factories = [
        FindCardRequirementFactory,
        CounterCardRequirementFactory,
        CounterAttackRequirementFactory,
    ];

    return {
        createForCardAndSpec,
    };

    function createForCardAndSpec(card, requirementSpec) {
        const Constructor = factories.find(f => f.type === requirementSpec.type);
        if (!Constructor) {
            //WARNING: Mutating argument //TODO This will mutate requirementSpec. Would be great to have some deepClone in the future!
            if (requirementSpec.whenResolvedAddAlso) {
                requirementSpec.whenResolvedAddAlso.forEach(spec => {
                    spec._cardData = card.getCardData();
                    spec._playerId = card.playerId;
                });
            }
            //END OF WARNING

            return {
                ...requirementSpec
            };
        }

        const factory = Constructor({
            playerStateService,
            opponentStateService,
            sourceFetcher,
            queryAttacks,
            requirementSpec,
            card
        });
        return factory.create();
    }
};
