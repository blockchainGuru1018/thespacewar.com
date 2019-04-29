const playerStateServiceFactory = require("./playerStateServiceFactory.js");
const PlayerPhase = require('../../match/PlayerPhase.js');
const MatchService = require('../../match/MatchService.js');
const TurnControl = require('../../match/TurnControl.js');

module.exports = function (state) {

    return {
        matchService,
        playerPhase,
        playerStateService,
        turnControl
    };

    function matchService() {
        let matchService = new MatchService();
        matchService.setState(state);
        return matchService;
    }

    function turnControl(playerId) {
        const opponentId = matchService().getOpponentId(playerId);
        return new TurnControl({
            matchService: matchService(),
            playerStateService: playerStateService(playerId),
            opponentStateService: playerStateService(opponentId),
            playerPhase: playerPhase(playerId),
            opponentPhase: playerPhase(opponentId),
        });
    }

    function playerPhase(playerId) {
        return new PlayerPhase({
            playerStateService: playerStateServiceFactory.fromIdAndState(playerId, state)
        });
    }

    function playerStateService(playerId) {
        return playerStateServiceFactory.fromIdAndState(playerId, state);
    }
};
