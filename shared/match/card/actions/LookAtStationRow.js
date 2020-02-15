module.exports = function LookAtStationRow({
    playerPhase,
    cardsThatCanLookAtHandSizeStationRow,
    addRequirementFromSpec,
    canAddRequirementFromSpec
}) {

    return {
        canDoIt,
        doIt
    };

    function canDoIt() {
        return playerPhase.isAction() && cardsThatCanLookAtHandSizeStationRow().length > 0;
    }

    function doIt(card, stationRow) {
        if (stationRow === 'handSize') {
            const spec = card.info.requirementSpecsWhenLookAtHandSizeStationRow;
            if (canAddRequirementFromSpec.forCardWithSpecAndTarget(card, spec)) {
                addRequirementFromSpec.forCardAndSpec(card, spec);
            }
        }
    }
};
