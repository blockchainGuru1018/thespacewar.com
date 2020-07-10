function MoveStationCardEvent({ turn, cardId, fromLocation, toLocation }) {
  return {
    type: "moveStationCard",
    created: Date.now(),
    turn,
    cardId,
    fromLocation,
    toLocation,
  };
}

module.exports = MoveStationCardEvent;
