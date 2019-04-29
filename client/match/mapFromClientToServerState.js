module.exports = function (clientState) {
    const state = {
        turn: clientState.turn,
        playerOrder: clientState.playerOrder,
        currentPlayer: clientState.currentPlayer,
        ended: clientState.ended,
        retreatedPlayerId: clientState.retreatedPlayerId,
        playerStateById: {
            [clientState.ownUser.id]: {
                phase: clientState.phase,
                events: clientState.events,
                cardsInZone: clientState.playerCardsInZone,
                cardsInOpponentZone: clientState.playerCardsInOpponentZone,
                cardsOnHand: clientState.playerCardsOnHand,
                stationCards: [
                    ...clientState.playerStation.drawCards,
                    ...clientState.playerStation.actionCards,
                    ...clientState.playerStation.handSizeCards
                ],
                requirements: clientState.requirements
            },
            [clientState.opponentUser.id]: {
                phase: clientState.opponentPhase,
                events: clientState.opponentEvents,
                cardsInZone: clientState.opponentCardsInZone,
                cardsInOpponentZone: clientState.opponentCardsInPlayerZone,
                cardsOnHand: new Array(clientState.opponentCardCount).fill({}),
                stationCards: [
                    ...clientState.opponentStation.drawCards,
                    ...clientState.opponentStation.actionCards,
                    ...clientState.opponentStation.handSizeCards
                ]
            }
        }
    };

    return state;
};
