const GoodKarma = require("../../../shared/card/GoodKarma.js");

const PlayableTypes = [
    'spaceShip',
    'defense',
    'missile'
];

const PlayableCards = [
    GoodKarma.CommonId
];

module.exports = function PlayerCardCapability({
    playerStateService,
    matchController,
    playableTypes = PlayableTypes,
    playableCards = PlayableCards,
    cardPlayers,
    cardRules
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

        const card = playableCards[0];
        playCard(card);
    }

    function playCard(card) {
        const hasSpecificPlayer = cardPlayers.find(player => player.forCard(card));
        if (hasSpecificPlayer) {
            hasSpecificPlayer.play(card);
        }
        else {
            matchController.emit('putDownCard', { cardId: card.id, location: 'zone' });
        }
    }

    function canPlayCard(card) {
        const actionPoints = playerStateService.getActionPointsForPlayer();

        return card.cost <= actionPoints
            && canPlayCardTypeOrSpecificCard(card)
            && cardRules.every(rule => rule(card));
    }

    function canPlayCardTypeOrSpecificCard(card) {
        return playableTypes.includes(card.type)
            || playableCards.includes(card.commonId)
            || cardPlayers.some(player => player.forCard(card));
    }
};
