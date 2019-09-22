module.exports = function ({
    canThePlayer,
    playerStateService
}) {
    return {
        forCardType
    };

    function forCardType(type) {
        if (type !== 'spaceShip') return 0;

        return sum(attackBoostForEachDurationCard());
    }

    function attackBoostForEachDurationCard() {
        return usableDurationCards()
            .filter(c => c.friendlySpaceShipAttackBonus)
            .map(c => c.friendlySpaceShipAttackBonus);
    }

    function usableDurationCards() {
        return playerStateService
            .getDurationBehaviourCards()
            .filter(c => canThePlayer.useThisDurationCard(c.id));
    }

    function sum(list) {
        return list.reduce((acc, v) => acc + v, 0);
    }
};
