//Simple card = Missile or Space ships

module.exports = function ({
    playerStateService,
    playerDiscardPhase,
    matchController,
    utils
}) {

    return {
        onDiscardPhase
    };

    function onDiscardPhase() {
        if (playerDiscardPhase.canLeavePhase()) {
            matchController.emit('nextPhase');
        }
        else {
            discardCheapestCardOnHand();
        }
    }

    function discardCheapestCardOnHand() {
        return playerStateService
            .getCardsOnHand()
            .sort(utils.cheapestCardComparer)[0];
    }
};
