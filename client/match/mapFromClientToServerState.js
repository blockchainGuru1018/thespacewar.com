module.exports = function (clientState) {
    const state = {
        turn: clientState.turn,
        playerOrder: clientState.playerOrder,
        playerStateById: {
            [clientState.ownUser.id]: {
                phase: clientState.phase,
                events: clientState.events,
                cardsInZone: clientState.playerCardsInZone,
                cardsInOpponentZone: clientState.playerCardsInOpponentZone
            },
            [clientState.opponentUser.id]: {
                phase: 'wait',
                events: clientState.opponentEvents,
                cardsInZone: clientState.opponentCardsInZone,
                cardsInOpponentZone: clientState.opponentCardsInPlayerZone
            }
        }
    };

    return state;
};