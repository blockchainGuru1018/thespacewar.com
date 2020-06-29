module.exports = function ({
    card,
    attackerSelected,
    canThePlayer,
    opponentStateService
}) {

    return {
        canMove,
        canAttack,
        canBeSacrificed,
        canRepair
    };

    function canMove(alternativeConditions = {}) {
        if (!canThePlayer.moveCards()) return false;
        if (shouldNotShowMoveOption()) return false;

        return card.canMove(alternativeConditions);
    }

    function shouldNotShowMoveOption() {
        //NOTE: Since June 2019 "Move" is not shown as an option for missile cards that can attack and move on the same turn.
        // The player should never move them but instead just attack from home zone directly.
        return card.type === 'missile'
            && card.canMoveAndAttackOnSameTurn();
    }

    function canAttack() {
        if (attackerSelected) return false;
        if (!canThePlayer.attackCards()) return false;

        if (!card.canAttack()) return false;

        for (const opponentCard of getOpponentCards()) {
            if (card.canAttackCard(opponentCard)) return true;
        }
        return card.canAttackStationCards();
    }

    function canBeSacrificed() {
        if (!canThePlayer.sacrificeCards()) return false;

        return card.canBeSacrificed()
            && (card.canTargetStationCardsForSacrifice() || canTargetCardInZoneForSacrifice());
    }

    function canTargetCardInZoneForSacrifice() {
        for (const opponentCard of getOpponentCards()) {
            if (card.canTargetCardForSacrifice(opponentCard)) return true;
        }
    }

    function canRepair() {
        if (!canThePlayer.repairCards()) return false;

        return card.canRepair();
    }

    function getOpponentCards() {
        const opponentCardDatas = [
            ...opponentStateService.getCardsInZone(),
            ...opponentStateService.getCardsInOpponentZone()
        ];
        return opponentCardDatas.map(cardData => opponentStateService.createBehaviourCard(cardData));
    }
};
