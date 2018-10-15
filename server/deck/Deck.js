const cards = require('../card/cards.json');
const SIZE = 60;

module.exports = function () {

    let deck = [];
    for (let cardJson of cards) {
        const copies = cardJson.number_copies ? parseInt(cardJson.number_copies) : 1;
        for (let i = 0; i < copies; i++) {
            const card = Card(cardJson);
            deck.push(card);
        }
    }
    shuffle(deck);

    return {
        drawSingle,
        draw
    };

    function drawSingle() {
        return draw(1)[0];
    }

    function draw(count) {
        let cards = [];
        for (let i = 0; i < count; i++) {
            let topCard = deck.pop();
            cards.push(topCard);
        }
        cards.reverse();
        return cards;
    }
};

function Card(cardJson) {
    return {
        id: cardJson.id,
        type: cardJson.type_card,
        name: cardJson.name,
        description: cardJson.detail,
        cost: cardJson.price,
        attack: cardJson.attack,
        defense: cardJson.defense
    };
}

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