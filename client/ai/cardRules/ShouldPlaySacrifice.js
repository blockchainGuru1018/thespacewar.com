const Sacrifice = require("../../../shared/card/Sacrifice.js");

module.exports = function ({ playerStateService, opponentStateService }) {
  return (card) => {
    if (card.commonId !== Sacrifice.CommonId) return true;

    return haveZeroCardsButOpponentHave();
  };

  function haveZeroCardsButOpponentHave() {
    const playerCards = [
      ...playerStateService.getCardsInZone(),
      ...playerStateService.getCardsInOpponentZone(),
    ];
    const opponentCards = [
      ...opponentStateService.getCardsInZone(),
      ...opponentStateService.getCardsInOpponentZone(),
    ];
    return opponentCards.length >= 1 && playerCards.length === 0;
  }
};
