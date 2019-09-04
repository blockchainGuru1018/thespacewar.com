module.exports = function ({
    utils,
    matchController
}) {
    return {
        canAttackSomeCardInHomeZone,
        attackFirstAvailableTargetInHomeZone,
    };

    function canAttackSomeCardInHomeZone() {
        return !!getFirstCardThatCanAttackAndItsTarget();
    }

    function attackFirstAvailableTargetInHomeZone() {
        const { card, target } = getFirstCardThatCanAttackAndItsTarget();
        matchController.emit('attackCard', {
            attackerCardId: card.id,
            defenderCardId: target.id
        });
    }

    function getFirstCardThatCanAttackAndItsTarget() {
        for (const card of utils.getBehaviourCardsInHomeZone()) {
            for (const target of utils.getOpponentBehaviourCardsInPlayerZone()) {
                if (card.canAttackCard(target)) return { card, target };
            }
        }

        return null;
    }
};
