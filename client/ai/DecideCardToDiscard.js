const TypesInOrder = [
    'event',
    'duration',
    'spaceShip'
];

module.exports = function DecideCardToDiscard({ playerStateService }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();

        for (let type of TypesInOrder) {
            const eventCardToDiscard = chooseCheapestCardOfType(cards, type);
            if (eventCardToDiscard) return eventCardToDiscard.id;
        }
    };
};

function chooseCheapestCardOfType(cards, type) {
    return cards
        .filter(c => c.type === type)
        .slice()
        .sort((a, b) => a.cost - b.cost)
        [0];
}
