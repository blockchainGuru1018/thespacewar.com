module.exports = function (clientState) {
    const state = {
        mode: clientState.mode,
        turn: clientState.turn,
        playerOrder: clientState.playerOrder,
        currentPlayer: clientState.currentPlayer,
        ended: clientState.ended,
        retreatedPlayerId: clientState.retreatedPlayerId,
        playerStateById: {
            [clientState.ownUser.id]: {
                clock: clientState.clock,
                commanders: clientState.commanders,
                actionLogEntries: clientState.actionLogEntries,
                phase: clientState.phase,
                events: clientState.events,
                cardsInZone: clientState.playerCardsInZone,
                cardsInOpponentZone: clientState.playerCardsInOpponentZone,
                cardsOnHand: clientState.playerCardsOnHand,
                discardedCards: clientState.playerDiscardedCards,
                stationCards: [
                    ...clientState.playerStation.drawCards,
                    ...clientState.playerStation.actionCards,
                    ...clientState.playerStation.handSizeCards
                ],
                requirements: clientState.requirements
            },
            [clientState.opponentUser.id]: {
                clock: clientState.opponentClock,
                commanders: clientState.opponentCommanders,
                phase: clientState.opponentPhase,
                events: clientState.opponentEvents,
                cardsInZone: clientState.opponentCardsInZone,
                cardsInOpponentZone: clientState.opponentCardsInPlayerZone,
                cardsOnHand: new Array(clientState.opponentCardCount).fill({}),
                discardedCards: clientState.opponentDiscardedCards,
                stationCards: [
                    ...clientState.opponentStation.drawCards,
                    ...clientState.opponentStation.actionCards,
                    ...clientState.opponentStation.handSizeCards
                ],
                requirements: clientState.opponentRequirements
            }
        }
    };

    return state;
};
