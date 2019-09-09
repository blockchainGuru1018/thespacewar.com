module.exports = function DecideCardToDiscard({ playerStateService }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();
        const eventCardToDiscard = cards.find(c => c.type === 'event');
        if (eventCardToDiscard) return eventCardToDiscard.id;

        const spaceShipToDiscard = cards
            .filter(c => c.type === 'spaceShip')
            .slice()
            .sort((a, b) => a.cost - b.cost)
            [0];
        return spaceShipToDiscard.id;
    };
};
