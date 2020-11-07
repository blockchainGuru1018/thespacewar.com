module.exports = (commonIdsOrder) => {
  return (cardA, cardB) =>
    commonIdsOrder.indexOf(cardA.commonId) -
    commonIdsOrder.indexOf(cardB.commonId);
};
