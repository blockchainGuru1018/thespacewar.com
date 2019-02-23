const CARD_COLOR_TO_TYPE = {
    'blue': 'spaceShip',
    'violet': 'duration',
    'orange': 'event',
    'red': 'missile',
    'green': 'defense'
};

module.exports = function ({
    rawCardDataRepository
}) {

    return {
        createAll,
        createFromCommonId
    };

    function createAll() {
        let rawCardData = rawCardDataRepository.get();

        let cards = [];
        for (let cardJson of rawCardData) {
            const copies = cardJson.number_copies ? parseInt(cardJson.number_copies) : 1;
            for (let i = 0; i < copies; i++) {
                const card = CardData(cardJson);
                cards.push(card);
            }
        }
        return cards;
    }

    function createFromCommonId(commonId) {
        let unmappedCardData = rawCardDataRepository.get();
        const cardJson = unmappedCardData.find(c => c.id === commonId.toString());
        return CardData(cardJson);
    }
};


function CardData(cardJson) {
    const color = cardJson.type_card;
    return {
        id: createUniqueCardId(cardJson.id),
        commonId: cardJson.id,
        color,
        type: CARD_COLOR_TO_TYPE[color],
        name: cardJson.name,
        description: cardJson.detail,
        cost: parseInt(cardJson.price, 10),
        attack: parseInt(cardJson.attack, 10),
        defense: parseInt(cardJson.defense, 10),
        paralyzed: false
    };
}

function createUniqueCardId(cardCommonId) {
    let uniqueId = Math.round(Date.now() * .1 * Math.random()).toString().substr(0, 5).padStart(5, '0');
    return `${cardCommonId}:${uniqueId}`;
}
