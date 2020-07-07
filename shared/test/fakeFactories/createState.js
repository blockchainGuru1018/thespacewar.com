const defaults = require("lodash/defaults");
const playerStateFactory = require("../../match/playerStateFactory.js");
const MatchMode = require("../../match/MatchMode.js");

module.exports = function createState(options = {}) {
    defaults(options, {
        mode: MatchMode.game,
        turn: 1,
        currentPlayer: "P1A",
        playerOrder: ["P1A", "P2A"],
        playerStateById: {},
    });

    const playerStateIds = Object.keys(options.playerStateById);
    if (playerStateIds.length < 2) {
        playerStateIds.push(options.playerOrder[1]);
    }
    for (const key of playerStateIds) {
        options.playerStateById[key] = createPlayerState(
            options.playerStateById[key]
        );
    }

    for (const playerId of options.playerOrder) {
        if (!options.playerStateById[playerId]) {
            options.playerStateById[playerId] = createPlayerState();
        }
    }

    return options;
};

function createPlayerState(options = {}) {
    return defaults(options, playerStateFactory.empty());
}
