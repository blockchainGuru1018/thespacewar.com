module.exports = function MatchInfoRepository(deps) {

    return {
        getTurn
    };

    function getTurn() {
        return deps.turn;
    }
}