const GoodKarma = require("../../shared/card/GoodKarma.js");

const PlayableTypes = [
    'spaceShip',
    'defense',
    'missile'
];

const PlayableCards = [
    GoodKarma.CommonId
];

module.exports = function DecideCardToPlay({
    playerStateService,
    matchController,
    playableTypes = PlayableTypes,
    playableCards = PlayableCards,
    cardRules = []
}) {
    return {
        canDoIt,
        doIt,
    };

    function canDoIt() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const playableCards = cardsOnHand.filter(canPlayCard);
        return playableCards.length > 0;
    }

    function doIt() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const playableCards = cardsOnHand
            .filter(canPlayCard)
            .sort((a, b) => a.cost - b.cost);
        const cardId = playableCards[0].id;
        matchController.emit('putDownCard', { cardId, location: 'zone' });
    }

    function canPlayCard(card) {
        const actionPoints = playerStateService.getActionPointsForPlayer();

        return card.cost <= actionPoints
            && canPlayCardTypeOrSpecificCard(card)
            && cardRules.every(rule => rule(card));
    }

    function canPlayCardTypeOrSpecificCard(card) {
        return playableTypes.includes(card.type)
            || playableCards.includes(card.commonId);
    }
};
