module.exports = function ({
    card,
    playerStateService,
    repairCardPriority,
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
        const cardToRepairId = repairCardPriority(repairableCards);
        repairCard(cardToRepairId);
    }

    function repairCard(cardToRepairId) {
        matchController.emit('repairCard', { repairerCardId: card.id, cardToRepairId });
    }

    function canRepairCard(otherCard) {
        return card.canRepairCard(otherCard);
    }
};
