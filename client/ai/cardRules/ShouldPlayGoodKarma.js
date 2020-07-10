const GoodKarma = require("../../../shared/card/GoodKarma.js");

module.exports = function ({ playerStateService }) {
  return (card) => {
    if (card.commonId !== GoodKarma.CommonId) return true;

    return hasNoGoodKarmaInPlay();
  };

  function hasNoGoodKarmaInPlay() {
    const goodKarmas = playerStateService.getMatchingBehaviourCards(
      (card) => card.commonId === GoodKarma.CommonId
    );
    return goodKarmas.length === 0;
  }
};
