const PlayableTypes = [
    'spaceShip',
    'defense',
    'missile'
];

module.exports = function DecideCardToPlay({
    playerStateService,
    matchController,
    playableTypes = PlayableTypes
}) {
    return {
        canDoIt,
        doIt,
    };

    function canDoIt() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const actionPoints = playerStateService.getActionPointsForPlayer();
        const affordableCard = cardsOnHand.find(c => c.cost <= actionPoints && playableTypes.includes(c.type));
        return !!affordableCard;
    }

    function doIt() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const actionPoints = playerStateService.getActionPointsForPlayer();
        const affordableCard = cardsOnHand.filter(c => c.cost <= actionPoints && playableTypes.includes(c.type)).sort((a, b) => a.cost - b.cost)[0];
        const cardId = affordableCard.id;
        matchController.emit('putDownCard', { cardId, location: 'zone' });
    }
};
