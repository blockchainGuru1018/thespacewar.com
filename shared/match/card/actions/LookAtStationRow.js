module.exports = function LookAtStationRow({
    playerPhase,
    cardsThatCanLookAtHandSizeStationRow,
    cardCanLookAtHandSizeStationRow,
    addRequirementFromSpec,
    canAddRequirementFromSpec
}) {

    return {
        canDoIt,
        cardCanDoIt,
        doIt
    };

    function canDoIt() {
        return canGenerallyLookAtStationRowNow()
            && cardsThatCanLookAtHandSizeStationRow().length > 0;
    }

    function cardCanDoIt(cardId) {
        return canGenerallyLookAtStationRowNow()
            && cardCanLookAtHandSizeStationRow(cardId);
    }

    function canGenerallyLookAtStationRowNow() {
        return playerPhase.isAction();
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
