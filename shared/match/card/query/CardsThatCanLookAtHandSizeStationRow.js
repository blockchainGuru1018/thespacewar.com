module.exports = function ({
    playerStateService
}) {
    return () => {
        return playerStateService
            .getMatchingBehaviourCards(card => {
                return card.grantsAbilityToLookAtHandSizeStationRow
                    && card.canLookAtHandSizeStationRow();
            });
    };
};
