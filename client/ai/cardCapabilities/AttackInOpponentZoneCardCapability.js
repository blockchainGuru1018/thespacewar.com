module.exports = function ({
    card,
    opponentStateService,
    matchController
}) {
    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return !card.inHomeZone()
            && targets().length > 0;
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
        return opponentStateService.getMatchingBehaviourCards(opponentCard => card.canAttackCard(opponentCard));
    }
};
