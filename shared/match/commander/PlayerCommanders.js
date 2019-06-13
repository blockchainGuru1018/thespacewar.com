const Commander = require('./Commander.js');
const FrankJohnson = require('./FrankJohnson.js');

module.exports = function ({ playerStateService }) {
    return {
        has,
        get,
        select
    };

    function has(commanderType) {
        return playerStateService.getPlayerState().commanders.includes(commanderType);
    }

    function get(commanderType) {
        if (commanderType === Commander.FrankJohnson) {
            return FrankJohnson();
        }
    }

    function select(commanderType) {
        playerStateService.update(playerState => {
            playerState.commanders = [commanderType];
        });
    }
};
