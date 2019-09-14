module.exports = function ({
    playerStateService
}) {
    return () => {
        return playerStateService.getCardsOnHand()[0].id;
    };
};
