module.exports = function ({ cardDataAssembler }) {
  let cards = null;

  return {
    getCost,
    getName,
    getImageUrl,
    getType,
    getCard,
  };

  function getCost(cardCommonId) {
    const card = getCard(cardCommonId);
    const costTextOrZero = card.cost || "0";
    return parseInt(costTextOrZero, 10) || 0;
  }

  function getName(cardCommonId) {
    const card = getCard(cardCommonId);
    return card.name;
  }

  function getType(cardCommonId) {
    return getCard(cardCommonId).type;
  }

  function getImageUrl(cardCommonId) {
    return `/card/${cardCommonId}/image`;
  }

  function getCard(cardCommonId) {
    const card = getCards().find((c) => c.commonId === cardCommonId);
    if (!card) {
      if (clientIsBrowser()) {
        console.error(`Could not find card with ID ${cardCommonId}`);
      }
      return {};
    } else {
      return card;
    }
  }

  function getCards() {
    if (!cards) {
      cards = cardDataAssembler.createLibrary();
    }

    return cards;
  }
};

function clientIsBrowser() {
  return !(typeof window === "undefined");
}
