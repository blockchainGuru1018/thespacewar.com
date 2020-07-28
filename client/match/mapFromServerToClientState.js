module.exports = function (serverState, clientPlayerId) {
  const playerState = serverState.playerStateById[clientPlayerId];
  return {
    events: playerState.events,
    playerCardsInZone: playerState.cardsInZone,
    playerCardsInOpponentZone: playerState.cardsInOpponentZone,
    currentDeck: playerState.currentDeck,
  };
};
