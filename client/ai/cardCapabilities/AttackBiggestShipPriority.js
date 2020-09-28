module.exports = function () {
  return function (cards) {
    const sortedByScore = cards
      .slice()
      .sort((a, b) => cardScore(b) - cardScore(a));
    const first = sortedByScore[0];
    return first.id;
  };

  function cardScore(card) {
    return card.defense + card.attack;
  }
};
