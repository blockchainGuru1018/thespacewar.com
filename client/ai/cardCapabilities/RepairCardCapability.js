module.exports = function ({
    card,
    playerStateService,
    matchController
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return card.canRepair();
    }

    function doIt() {
        const repairableCards = playerStateService.getMatchingBehaviourCardsFromZoneOrStation(canRepairCard);
        matchController.emit('repairCard', {
            repairerCardId: card.id,
            cardToRepairId: repairableCards[0].id
        });
    }

    function canRepairCard(otherCard) {
        return card.canRepairCard(otherCard);
    }
};
