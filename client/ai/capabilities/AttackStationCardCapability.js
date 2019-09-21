module.exports = function AttackStationCardCapability({
    card,
    matchController,
    opponentStateService,
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return card.canAttackStationCards();
    }

    function doIt() {
        matchController.emit('attackStationCard', {
            attackerCardId: card.id,
            targetStationCardIds: getTargetStationCardIds()
        });
    }

    function getTargetStationCardIds() {
        return opponentStateService.getStationCards().map(s => s.id);
    }
};
