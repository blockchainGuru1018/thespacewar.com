const DestroyDuration = require("../../../shared/card/DestroyDuration.js");

module.exports = function ({ opponentStateService, matchController }) {
  return {
    forCard,
    play,
  };

  function forCard({ commonId }) {
    return commonId === DestroyDuration.CommonId;
  }

  function play(card) {
    const opponentDurationCards = opponentStateService
      .getDurationCards()
      .filter((card) => card.type === "duration").length;
    const choice = opponentDurationCards >= 1 ? "destroy" : "draw";
    matchController.emit("putDownCard", {
      cardId: card.id,
      location: "zone",
      choice,
    });
  }
};
