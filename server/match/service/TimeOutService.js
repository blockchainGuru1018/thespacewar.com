const {PHASES} = require('../../../shared/phases.js');

module.exports = function TimeOutService(
    {
        gameConfig,
        retreat
    }) {

    const timeOutPerPlayer = new Map();

    return {
        updateTimeOutForPlayer
    };


    function updateTimeOutForPlayer(playerId, playerState) {
        if (playerState && playerState.phase !== PHASES.wait) {
            clearAndCreateTimeOutForPlayer(playerId);
        } else {
            clearTimeOutForPlayer(playerId);
        }
    }

    function clearAndCreateTimeOutForPlayer(playerId) {
        clearTimeOutForPlayer(playerId);
        createTimeOutForPlayer(playerId);
    }

    function clearTimeOutForPlayer(playerId) {
        const timeOutHandler = timeOutPerPlayer.get(playerId);
        clearTimeout(timeOutHandler);
    }

    function createTimeOutForPlayer(playerId) {
        // console.log(`player ${playerId} inactivity timeout will be called in ${gameConfig.minutesOfInactivityResultInAutoLoss()} milliseconds`)
        const timeOutRef = setTimeout(() => {
            // console.log(`player ${playerId} should be make to retreat`)
            retreat(playerId)
        }, gameConfig.minutesOfInactivityResultInAutoLoss());
        timeOutPerPlayer.set(playerId, timeOutRef);
    }

}