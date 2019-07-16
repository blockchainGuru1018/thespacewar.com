module.exports = function (deck) {

    return {
        drawSingle,
        draw,
        getCardCount,
        getPossibleMillCount: () => Math.floor(getCardCount() / 2),
        getAll: () => [...deck],
        removeCard,
        _getDeck: () => [...deck],
        _restoreDeck: previousDeck => { deck = [...previousDeck] }
    };

    function drawSingle() {
        return draw(1)[0];
    }

    function draw(count = 1) {
        const countAvailableToDraw = Math.min(getCardCount(), count);

        let cards = [];
        for (let i = 0; i < countAvailableToDraw; i++) {
            let topCard = deck.pop();
            cards.push(topCard);
        }
        cards.reverse();
        return cards;
    }

    function getCardCount() {
        return deck.length;
    }

    function removeCard(cardId) {
        const cardIndex = deck.findIndex(c => c.id === cardId);
        if (cardIndex < 0) return null;

        const [removedCard] = deck.splice(cardIndex, 1);
        return removedCard;
    }
};
