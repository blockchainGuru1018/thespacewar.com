module.exports = function DecideCardToDiscard({ playerStateService }) {
    return () => {
        const cards = playerStateService.getCardsOnHand();
        const eventCardToDiscard = cards.find(c => c.type === 'event');
        if (eventCardToDiscard) return eventCardToDiscard.id;
        const spaceShipToDiscard = cards.find(c => c.type === 'spaceShip');
        return spaceShipToDiscard.id;
    };
};
