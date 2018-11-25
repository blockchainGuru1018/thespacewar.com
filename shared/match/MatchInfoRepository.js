module.exports = function MatchInfoRepository(deps) {

    return {
        getTurn,
        getPlayerPhase
    };

    function getTurn() {
        return deps.turn;
    }

    function getPlayerPhase(playerId) {
        return deps.playerStateById[playerId].phase;
    }
}