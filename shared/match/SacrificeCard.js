module.exports = function ({
    playerStateService,
    opponentStateService,
    opponentActionLog
}) {

    return {
        collideWithCard,
        collideWithStation
    };

    function collideWithCard(sacrificedCardId, targetCardId) {
        sacrificeCard(sacrificedCardId);

        const targetCardData = opponentStateService.findCard(targetCardId);
        const targetCard = opponentStateService.createBehaviourCard(targetCardData);
        const targetCardDamageBefore = targetCard.damage;
        const targetCardDamageAfter = targetCard.damage + 4;
        const targetDefense = targetCard.defense || 0;
        if (targetCardDamageAfter >= targetDefense) {
            opponentStateService.removeCard(targetCardId);
            opponentStateService.discardCard(targetCardData);

            opponentActionLog.cardDestroyed({ cardCommonId: targetCardData.commonId });
        }
        else {
            opponentStateService.updateCardById(targetCardId, card => {
                card.damage = targetCardDamageAfter;
            });

            opponentActionLog.damagedInAttack({
                defenderCardId: targetCardId,
                defenderCardCommonId: targetCardData.commonId,
                damageInflictedByDefender: targetCardDamageAfter - targetCardDamageBefore
            });
        }
    }

    function collideWithStation(sacrificedCardId, targetCardIds) {
        sacrificeCard(sacrificedCardId);

        for (const targetCardId of targetCardIds) {
            opponentStateService.flipStationCard(targetCardId);

            opponentActionLog.stationCardsWereDamaged({ targetCount: targetCardIds.length });
        }
    }

    function sacrificeCard(sacrificedCardId) {
        const sacrificedCardData = playerStateService.removeCard(sacrificedCardId);
        playerStateService.discardCard(sacrificedCardData);
    }
};
