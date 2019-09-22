module.exports = function MoveCardCapability({
    card,
    matchController,
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return card.canMove() && !card.canAttackCardsInOtherZone();
    }

    function doIt() {
        matchController.emit('moveCard', card.id);
    }
};
