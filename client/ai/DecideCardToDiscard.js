module.exports = function DecideCardToDiscard({ playerStateService }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();
        const eventCardToDiscard = chooseCheapestCardOfType(cards, 'event');
        if (eventCardToDiscard) return eventCardToDiscard.id;

        const spaceShipToDiscard = chooseCheapestCardOfType(cards, 'spaceShip');
        return spaceShipToDiscard.id;
    };
};

function chooseCheapestCardOfType(cards, type) {
    return cards
        .filter(c => c.type === type)
        .slice()
        .sort((a, b) => a.cost - b.cost)
        [0];
}
