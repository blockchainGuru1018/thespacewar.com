const SourceFetcher = require('./SourceFetcher.js');
const FindCardRequirementFactory = require('./FindCardRequirementFactory.js');
const CounterCardRequirementFactory = require('./CounterCardRequirementFactory.js');
const PlayerServiceProvider = require('../PlayerServiceProvider.js');

module.exports = function ({
    matchService,
    playerServiceProvider
}) {

    const factories = [
        FindCardRequirementFactory,
        CounterCardRequirementFactory
    ];

    return {
        create
    };

    function create(playerId, card, requirementSpec) {
        const Constructor = factories.find(f => f.type === requirementSpec.type);
        if (!Constructor) return { ...requirementSpec };

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        let factory = Constructor({
            playerRequirementService,
            playerStateService,
            sourceFetcher: SourceFetcher({
                playerStateService,
                opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
                canThePlayer: playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId),
                filter: requirementSpec.filter
            }),
            requirementSpec,
            card
        });
        return factory.create();
    }
};
