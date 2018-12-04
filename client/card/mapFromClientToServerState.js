module.exports = function (clientState) {
    const state = {
        turn: clientState.turn,
        playerStateById: {
            [clientState.ownUser.id]: {
                phase: clientState.phase,
                events: clientState.events
            }
        }
    };

    return state;
};