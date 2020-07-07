module.exports = function ({ playerServiceProvider, matchService }) {
    return {
        getType: () => "removeAllRequirements",
        forPlayerWithData,
    };

    function forPlayerWithData(playerId) {
        removePlayerRequirements(playerId);

        const opponentId = matchService.getOpponentId(playerId);
        removePlayerRequirements(opponentId);
    }

    function removePlayerRequirements(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(
            playerId
        );
        playerStateService.update((playerState) => {
            playerState.requirements = [];
        });
    }
};
