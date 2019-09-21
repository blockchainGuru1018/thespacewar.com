module.exports = function AttackInHomeZoneCardCapability({
    card,
    matchController,
    opponentStateService,
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return !card.canAttackStationCards()
            && hasAvailableTargets();
    }

    function doIt() {
        matchController.emit('attack', {
            attackerCardId: card.id,
            defenderCardId: firstTarget().id
        });
    }

    function hasAvailableTargets() {
        return targets(card).length > 0;
    }

    function firstTarget() {
        return targets(card)[0];
    }

    function targets(playerCard) {
        return opponentStateService.getMatchingBehaviourCards(opponentCard => playerCard.canAttackCard(opponentCard));
    }
};
