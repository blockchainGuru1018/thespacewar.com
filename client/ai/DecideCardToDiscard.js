const CardTypeComparer = require('./CardTypeComparer.js');
const CardCostComparer = require('./CardCostComparer.js');

const TypesInOrder = [
    'duration',
    'event',
    'spaceShip',
    'missile',
    'defense'
];

module.exports = function DecideCardToDiscard({ playerStateService, types = TypesInOrder }) {
    return () => {
        const cards = playerStateService.getCardsOnHand()
            .slice()
            .sort(CardCostComparer())
            .sort(CardTypeComparer(types));

        if (cards.length) return cards[0].id;
        throw new Error('No cards to discard');
    };
};
