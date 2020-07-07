const PlayerRequirementUpdater = require("../../shared/match/requirement/PlayerRequirementUpdater.js");

class PlayerRequirementUpdaterFactory {
  constructor({ playerServiceProvider, matchService, playerServiceFactory }) {
    this._playerServiceProvider = playerServiceProvider;
    this._matchService = matchService;
    this._playerServiceFactory = playerServiceFactory;
  }

  create(playerId, requirementMatchConditions) {
    const opponentId = this._matchService.getOpponentId(playerId);
    return new PlayerRequirementUpdater({
      requirementMatchConditions,
      playerStateService: this._playerServiceProvider.getStateServiceById(
        playerId
      ),
      playerRequirementService: this._playerServiceProvider.getRequirementServiceById(
        playerId
      ),
      opponentRequirementService: this._playerServiceProvider.getRequirementServiceById(
        opponentId
      ),
      addRequirementFromSpec: this._playerServiceFactory.addRequirementFromSpec(
        playerId
      ),
      cardFactory: this._playerServiceFactory.cardFactory(),
    });
  }
}

module.exports = PlayerRequirementUpdaterFactory;
