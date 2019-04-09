const SourceFetcher = require('./SourceFetcher.js');
const FindCardRequirementFactory = require('./FindCardRequirementFactory.js');

module.exports = function ({
    playerServiceProvider
}) {

    const factories = [
        FindCardRequirementFactory
    ];

    return {
        create
    };

    function create(playerId, cardData, requirementSpec) {
        const Constructor = factories.find(f => f.type === requirementSpec.type);

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getStateServiceById(playerId);
        let factory = Constructor({
            playerRequirementService,
            playerStateService,
            sourceFetcher: SourceFetcher({ playerStateService, filter: requirementSpec.filter }),
            requirementSpec,
            cardData
        });
        return factory.create();
    }
};