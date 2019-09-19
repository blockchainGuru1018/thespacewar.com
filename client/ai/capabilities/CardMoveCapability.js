module.exports = function CardAttackStationCardCapability({
    card,
    matchController,
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return card.canMove();
    }

    function doIt() {
        matchController.emit('moveCard', card.id);
    }
};
