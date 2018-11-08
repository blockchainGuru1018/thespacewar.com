const cardsJson = require('../server/card/cards.json');

module.exports = function () {

    return {
        createAll
    };

    function createAll() {
        let cards = [];
        for (let cardJson of cardsJson) {
            const copies = cardJson.number_copies ? parseInt(cardJson.number_copies) : 1;
            for (let i = 0; i < copies; i++) {
                const card = Card(cardJson);
                cards.push(card);
            }
        }
        return cards;
    }
};


function Card(cardJson) {
    return {
        id: cardJson.id,
        type: cardJson.type_card,
        name: cardJson.name,
        description: cardJson.detail,
        cost: parseInt(cardJson.price, 10),
        attack: parseInt(cardJson.attack, 10),
        defense: parseInt(cardJson.defense, 10)
    };
}
