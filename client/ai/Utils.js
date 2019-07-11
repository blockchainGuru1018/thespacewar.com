module.exports = function ({
    playerStateService,
    opponentStateService
}) {

    return {
        actionPoints,
        cheapestCardComparer,
        getBehaviourCardsInHomeZone,
        getOpponentBehaviourCardsInPlayerZone
    };

    function actionPoints() {
        return playerStateService.getActionPointsForPlayer()
    }

    function cheapestCardComparer(a, b) {
        return a.cost - b.cost;
    }

    function getBehaviourCardsInHomeZone() {
        return playerStateService.getCardsInZone().map(cardData => playerStateService.createBehaviourCard(cardData));
    }

    function getOpponentBehaviourCardsInPlayerZone() {
        return opponentStateService.getCardsInOpponentZone().map(cardData => opponentStateService.createBehaviourCard(cardData));
    }
};
