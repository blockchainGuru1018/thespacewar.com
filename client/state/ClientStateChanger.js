const storeItemNameByServerItemName = {
  cardsInZone: "playerCardsInZone",
  cardsInOpponentZone: "playerCardsInOpponentZone",
  discardedCards: "playerDiscardedCards",
  cardsOnHand: "playerCardsOnHand",
};

module.exports = function StateChanger({ state, preMergeHook = () => {} }) {
  return {
    stateChanged,
  };

  function stateChanged(data) {
    for (const key of Object.keys(data)) {
      const datum = data[key];
      preMergeHook(key, datum);

      if (key === "stationCards") {
        setPlayerStationCards(datum);
      } else if (key === "opponentStationCards") {
        setOpponentStationCards(datum);
      } else {
        const localKey = storeItemNameByServerItemName[key] || key;
        state[localKey] = datum;
      }
    }
  }

  function setPlayerStationCards(stationCards) {
    state.playerStation.drawCards = stationCards
      .filter((s) => s.place === "draw")
      .sort(stationCardsByIsFlippedComparer);
    state.playerStation.actionCards = stationCards
      .filter((s) => s.place === "action")
      .sort(stationCardsByIsFlippedComparer);
    state.playerStation.handSizeCards = stationCards
      .filter((s) => s.place === "handSize")
      .sort(stationCardsByIsFlippedComparer);
  }

  function setOpponentStationCards(stationCards) {
    state.opponentStation.drawCards = stationCards
      .filter((s) => s.place === "draw")
      .sort(stationCardsByIsFlippedComparer);
    state.opponentStation.actionCards = stationCards
      .filter((s) => s.place === "action")
      .sort(stationCardsByIsFlippedComparer);
    state.opponentStation.handSizeCards = stationCards
      .filter((s) => s.place === "handSize")
      .sort(stationCardsByIsFlippedComparer);
  }
};

function stationCardsByIsFlippedComparer(a, b) {
  return (a.flipped ? 1 : 0) - (b.flipped ? 1 : 0);
}
