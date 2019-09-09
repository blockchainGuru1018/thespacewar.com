const TypesInOrder = [
    'event',
    'duration',
    'spaceShip'
];

module.exports = function DecideCardToDiscard({ playerStateService, types = TypesInOrder }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();

        for (let type of types) {
            const eventCardToDiscard = chooseCheapestCardOfType(cards, type);
            if (eventCardToDiscard) return eventCardToDiscard.id;
        }

        throw new Error('No cards to discard');
    };
};

function chooseCheapestCardOfType(cards, type) {
    return cards
        .filter(c => c.type === type)
        .slice()
        .sort((a, b) => a.cost - b.cost)
        [0];
}
