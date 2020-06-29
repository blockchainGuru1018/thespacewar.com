module.exports = function AttackEnergyShieldCardCapability({
    card,
    matchController,
    opponentStateService,
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return targets().length > 0;
    }

    function doIt() {
        matchController.emit('attack', {
            attackerCardId: card.id,
            defenderCardId: firstTarget().id
        });
    }

    function firstTarget() {
        return targets()[0];
    }

    function targets() {
        return opponentStateService.getMatchingBehaviourCards(opponentCard => {
            return opponentCard.stopsStationAttack()
                && card.canAttackCard(opponentCard);
        });
    }
};
