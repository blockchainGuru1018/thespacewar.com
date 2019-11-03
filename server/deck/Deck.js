module.exports = function (originalDeck) {

    let deck = originalDeck.slice();

    return {
        draw,
        getCardCount,
        getPossibleMillCount,
        getAll: () => [...deck],
        removeFirstCardOfType,
        removeCard,
        _getDeck: () => [...deck],
        _restoreDeck: previousDeck => { deck = [...previousDeck] }
    };

    function draw(count = 1) {
        const countAvailableToDraw = Math.min(getCardCount(), count);

        const cards = [];
        for (let i = 0; i < countAvailableToDraw; i++) {
            const topCard = deck.pop();
            cards.push(topCard);
        }
        cards.reverse();
        return cards;
    }

    function getCardCount() {
        return deck.length;
    }

    function getPossibleMillCount() {
        return Math.round(getCardCount() / 2);
    }

    function removeCard(cardId) {
        const cardIndex = deck.findIndex(c => c.id === cardId);
        if (cardIndex < 0) return null;

        const [removedCard] = deck.splice(cardIndex, 1);
        return removedCard;
    }

    function removeFirstCardOfType(cardCommonId) {
        const cardIndex = deck.findIndex(c => c.commonId === cardCommonId);
        if (cardIndex < 0) return null;

        const [removedCard] = deck.splice(cardIndex, 1);
        return removedCard;
    }
};
