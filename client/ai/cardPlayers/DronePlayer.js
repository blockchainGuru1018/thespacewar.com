const Drone = require("../../../shared/card/Drone.js");

module.exports = function ({ matchController }) {
  return {
    forCard,
    play,
  };

  function forCard({ commonId }) {
    return commonId === Drone.CommonId;
  }

  function play(card) {
    matchController.emit("putDownCard", {
      cardId: card.id,
      location: "zone",
    });
  }
};
