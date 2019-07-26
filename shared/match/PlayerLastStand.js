module.exports = function ({
    playerId,
    matchService,
    playerTurnControl,
    opponentTurnControl
}) {
    return {
        start
    };

    function start() {
        matchService.update(state => {
            state.lastStandInfo = { playerId, started: Date.now() };
        });

        if (playerTurnControl.opponentHasControlOfPlayersTurn()) {
            opponentTurnControl.releaseControlOfOpponentsTurn();
        }
        else if (playerTurnControl.opponentHasControlOfOwnTurn()) {
            playerTurnControl.takeControlOfOpponentsTurn();
        }
    }
};
