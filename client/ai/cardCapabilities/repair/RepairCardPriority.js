module.exports = function () {
    return function (cards) {
        const sortedByScore = cards.slice().sort((a, b) => cardScore(b) - cardScore(a));
        const first = sortedByScore[0];
        return first.id;
    };

    function cardScore(card) {
        if (card.paralyzed) return 2;
        if (card.damage > 0) return 1;
        return 0;
    }
};
