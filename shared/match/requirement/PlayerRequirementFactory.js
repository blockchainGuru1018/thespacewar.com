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
        create
    };

    function create(card, requirementSpec) {
        const Constructor = factories.find(f => f.type === requirementSpec.type);
        if (!Constructor) return { ...requirementSpec };

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
