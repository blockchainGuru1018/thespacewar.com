const RepairCardEvent = require('../event/RepairCardEvent.js');

module.exports = function ({
    matchService,
    playerStateService,
    opponentActionLog
}) {

    return {
        cardOrStationCard
    };

    function cardOrStationCard(repairerCardId, cardToRepairId) {
        const cardToRepair = playerStateService.createBehaviourCardById(cardToRepairId);
        const repairerCard = playerStateService.createBehaviourCardById(repairerCardId);
        repairerCard.repairCard(cardToRepair);

        if (cardToRepair.isStationCard()) {
            playerStateService.unflipStationCard(cardToRepairId);
            opponentActionLog.opponentRepairedStationCard();
        }
        else {
            playerStateService.updateCardById(cardToRepairId, card => {
                Object.assign(card, cardToRepair.getCardData());
            });
            opponentActionLog.opponentRepairedCard({
                repairedCardId: cardToRepairId,
                repairedCardCommonId: cardToRepair.commonId
            })
        }

        registerEvent(repairerCard, cardToRepair);
    }

    function registerEvent(repairerCard, cardToRepair) {
        let currentTurn = matchService.getTurn();
        playerStateService.storeEvent(RepairCardEvent({
            turn: currentTurn,
            cardId: repairerCard.id,
            cardCommonId: repairerCard.commonId,
            repairedCardId: cardToRepair.id,
            repairedCardCommonId: cardToRepair.commonId
        }));
    }
};
