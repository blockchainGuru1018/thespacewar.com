const TheParalyzer = require("../../../shared/card/TheParalyzer.js");

module.exports = function ({ opponentStateService }) {
  return (card) => {
    if (card.commonId !== TheParalyzer.CommonId) return true;
    return thereAreCardsCostingMoreThanFive();
  };

  function thereAreCardsCostingMoreThanFive() {
    const cardsCostingMoreThanFive = opponentStateService
      .getCardsInOpponentZone()
      .map((card) => opponentStateService.createBehaviourCard(card))
      .filter((cardData) => cardData.costToPlay > 5);

    return cardsCostingMoreThanFive.length >= 1;
  }
};
