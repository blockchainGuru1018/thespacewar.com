const OverworkEventFactory = require('./event/OverworkEventFactory.js');
const PlayerOverwork = require('./PlayerOverwork.js');

module.exports = function ({
    matchService,
    playerServiceProvider
}) {

    return {
        create
    };

    function create(playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        return PlayerOverwork({
            matchService,
            overworkEventFactory: overworkEventFactory(playerId),
            playerStateService: playerStateService(playerId),
            playerRequirementService: playerRequirementService(playerId),
            opponentRequirementService: playerRequirementService(opponentId),
        });
    }

    function playerStateService(playerId) {
        return playerServiceProvider.getStateServiceById(playerId);
    }

    function playerRequirementService(playerId) {
        return playerServiceProvider.getRequirementServiceById(playerId);
    }

    function overworkEventFactory(playerId) {
        return OverworkEventFactory({
            matchService,
            playerStateService: playerServiceProvider.getStateServiceById(playerId)
        });
    }
};
