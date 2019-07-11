//Simple card = Missile or Space ships

module.exports = function ({
    playerStateService,
    matchController,
    utils
}) {

    return {
        onActionPhase
    };

    function onActionPhase() {
        if (canAffordToPlaySomeSimpleShip() > 0) {
            playCheapestSpaceShip();
        }
        else {
            matchController.emit('nextPhase');
        }
    }

    function canAffordToPlaySomeSimpleShip() {
        const actionPoints = utils.actionPoints();
        return getSimpleCardsOnHand()
            .some(c => c.cost <= actionPoints);
    }

    function playCheapestSpaceShip() {
        return getSimpleCardsOnHand()
            .sort(utils.cheapestCardComparer)[0];
    }

    function getSimpleCardsOnHand() {
        return playerStateService
            .getCardsOnHand()
            .filter(c => {
                return c.type === 'spaceShip'
                    || c.type === 'missile'
            });
    }
};
