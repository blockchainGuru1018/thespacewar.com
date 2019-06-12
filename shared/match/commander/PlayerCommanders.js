const Commander = require('./Commander.js');
const FrankJohnson = require('./FrankJohnson.js');

module.exports = function ({ playerStateService }) {
    return {
        has,
        get
    };

    function has(commanderType) {
        return playerStateService.getPlayerState().commanders.includes(commanderType);
    }

    function get(commanderType) {
        if (commanderType === Commander.FrankJohnson) {
            return FrankJohnson();
        }
    }
};
