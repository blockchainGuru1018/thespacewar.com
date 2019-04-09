const PlayerRequirementUpdater = require('../../shared/match/requirement/PlayerRequirementUpdater.js');

class PlayerRequirementUpdaterFactory {

    constructor({
        playerServiceProvider,
        matchComService //TODO Should use matchService
    }) {
        this._playerServiceProvider = playerServiceProvider;
        this._matchComService = matchComService;
    }

    create(playerId, requirementMatchConditions) {
        const opponentId = this._matchComService.getOpponentId(playerId);
        return new PlayerRequirementUpdater({
            requirementMatchConditions,
            playerStateService: this._playerServiceProvider.getStateServiceById(playerId),
            playerRequirementService: this._playerServiceProvider.getRequirementServiceById(playerId),
            opponentRequirementService: this._playerServiceProvider.getRequirementServiceById(opponentId)
        });
    }
}

module.exports = PlayerRequirementUpdaterFactory;