const CheatError = require("../../../shared/match/card/CheatError.js");

module.exports = function LookAtStationRowCommand({
  lookAtStationRow,
  playerCardFactory,
}) {
  return ({ cardId, stationRow }) => {
    if (!validStationRow(stationRow)) {
      throw new CheatError("Can currently only look at handSize station row");
    }
    if (!lookAtStationRow.cardCanDoIt(cardId)) {
      throw new CheatError("Cannot look at station row");
    }

    const card = playerCardFactory.fromId(cardId);
    lookAtStationRow.doIt(card, stationRow);
  };
};

function validStationRow(stationRow) {
  return stationRow === "handSize";
}
