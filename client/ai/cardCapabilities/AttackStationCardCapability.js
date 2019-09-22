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
            targetStationCardIds: getTargetStationCardIds(card.attack)
        });
    }

    function getTargetStationCardIds(count) {
        return opponentStateService.getUnflippedStationCards().slice(0, count).map(s => s.id);
    }
};
