module.exports = (commonIdsOrder) => {
  return (cardA, cardB) => {
    const cardAScore =
      commonIdsOrder.indexOf(cardA.commonId) !== -1
        ? commonIdsOrder.indexOf(cardA.commonId)
        : 99;
    const cardBScore =
      commonIdsOrder.indexOf(cardB.commonId) !== -1
        ? commonIdsOrder.indexOf(cardB.commonId)
        : 99;
    return cardAScore - cardBScore;
  };
};
