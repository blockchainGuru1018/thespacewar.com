module.exports = function ({
    playerServiceProvider
}) {

    return {
        getType: () => 'actionPoints',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, { count }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.storeEvent({ type: 'cheatAddActionPoints', count })
    }
};