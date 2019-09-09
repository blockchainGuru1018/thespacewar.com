module.exports = function DecideCardToDiscard({ playerStateService }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();
        const eventCardToDiscard = cards
            .filter(c => c.type === 'event')
            .slice()
            .sort((a, b) => a.cost - b.cost)
            [0];
        if (eventCardToDiscard) return eventCardToDiscard.id;

        const spaceShipToDiscard = cards
            .filter(c => c.type === 'spaceShip')
            .slice()
            .sort((a, b) => a.cost - b.cost)
            [0];
        return spaceShipToDiscard.id;
    };
};
