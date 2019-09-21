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
        const targets = attackableOpponentCardsInHomeZone(card);
        return targets.length > 0;
    }

    function doIt() {
        const targets = attackableOpponentCardsInHomeZone(card);

        matchController.emit('attack', {
            attackerCardId: card.id,
            defenderCardId: targets[0].id
        });
    }

    function attackableOpponentCardsInHomeZone(playerCard) {
        return opponentStateService
            .getCardsInOpponentZone()
            .map(opponentCardData => opponentStateService.createBehaviourCard(opponentCardData))
            .filter(opponentCard => playerCard.canAttackCard(opponentCard));
    }
};
