const BLACK_LIST_COMMON_IDS = [
    '16',
    '64',
    '31',
    '34',
    '66',
    '67'
];

const FILTER_BLACK_LISTED_CARDS = true; //Mainly used for game testing while the game is pre-alpha

module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    let deck = cardDataAssembler.createAll();
    if (FILTER_BLACK_LISTED_CARDS) {
        deck = deck.filter(c => !BLACK_LIST_COMMON_IDS.includes(c.commonId));
    }
    shuffle(deck);

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

function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}