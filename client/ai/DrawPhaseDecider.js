const { PHASES } = require("../../shared/phases.js");

module.exports = function ({ matchController, playerDrawPhase }) {
  return {
    decide,
  };

  function decide() {
    if (playerDrawPhase.moreCardsCanBeDrawn()) {
      matchController.emit("drawCard");
    } else {
      matchController.emit("nextPhase", { currentPhase: PHASES.draw });
    }
  }
};
