module.exports = function (clientState) {
  const state = {
    mode: clientState.mode,
    turn: clientState.turn,
    playerOrder: clientState.playerOrder,
    currentPlayer: clientState.currentPlayer,
    ended: clientState.ended,
    retreatedPlayerId: clientState.retreatedPlayerId,
    lastStandInfo: clientState.lastStandInfo,
    readyPlayerIds: clientState.readyPlayerIds,
    playerStateById: {
      [clientState.ownUser.id]: {
        clock: clientState.clock,
        commanders: clientState.commanders,
        actionLogEntries: clientState.actionLogEntries,
        phase: clientState.phase,
        events: clientState.events,
        currentDeck: clientState.currentDeck,
        customDeck: clientState.customDeck,
        cardsInZone: clientState.playerCardsInZone,
        cardsInOpponentZone: clientState.playerCardsInOpponentZone,
        cardsOnHand: clientState.playerCardsOnHand,
        discardedCards: clientState.playerDiscardedCards,
        stationCards: [
          ...clientState.playerStation.drawCards,
          ...clientState.playerStation.actionCards,
          ...clientState.playerStation.handSizeCards,
        ],
        requirements: clientState.requirements,
        cardsInDeck: new Array(clientState.playerCardsInDeckCount).fill({}),
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
          ...clientState.opponentStation.handSizeCards,
        ],
        requirements: clientState.opponentRequirements,
      },
    },
  };

  return state;
};
