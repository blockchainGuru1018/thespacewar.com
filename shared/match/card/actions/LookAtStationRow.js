module.exports = function LookAtStationRow({
  cardsThatCanLookAtHandSizeStationRow,
  cardCanLookAtHandSizeStationRow,
  addRequirementFromSpec,
  canAddRequirementFromSpec,
}) {
  return {
    canDoIt,
    cardCanDoIt,
    doIt,
  };

  function canDoIt() {
    return cardsThatCanLookAtHandSizeStationRow().length > 0;
  }

  function cardCanDoIt(cardId) {
    return cardCanLookAtHandSizeStationRow(cardId);
  }

  function doIt(card, stationRow) {
    if (stationRow === "handSize") {
      const spec = card.info.requirementSpecsWhenLookAtHandSizeStationRow;
      if (canAddRequirementFromSpec.forCardWithSpecAndTarget(card, spec)) {
        addRequirementFromSpec.forCardAndSpec(card, spec);
      }
    }
  }
};
