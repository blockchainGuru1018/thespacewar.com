module.exports = function (clientState) {
    const state = {
        turn: clientState.turn,
        playerStateById: {
            [clientState.ownUser.id]: {
                phase: clientState.phase,
                events: clientState.events,
                cardsInZone: clientState.playerCardsInZone,
                cardsInOpponentZone: clientState.playerCardsInOpponentZone
            }
        }
    };

    return state;
};