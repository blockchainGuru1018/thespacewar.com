const CardTypeComparer = require('./CardTypeComparer.js');
const CardCostComparer = require('./CardCostComparer.js');

const TypesInOrder = [
    'duration',
    'event',
    'spaceShip',
    'missile'
];

module.exports = function DecideCardToDiscard({ playerStateService, types = TypesInOrder }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();

        const cardsSorted = cards.slice()
            .sort(CardCostComparer())
            .sort(CardTypeComparer(types));

        const topHit = cardsSorted[0];
        if (topHit) return topHit.id;

        throw new Error('No cards to discard');
    };
};
