SacrificeCardForRequirementFactory.type = "sacrifice";

function SacrificeCardForRequirementFactory({ requirementSpec, card,playerStateService }) {
  return {
    create,
  };

  function create() {
    const requirement = {
      type: requirementSpec.type,
      cardCommonId: card.commonId,
      count: requirementSpec.count,
      common: !!requirementSpec.common,
      waiting: requirementSpec.count === 0 && requirementSpec.common,
      cardId: card.id,
    };
    if (playerStateService.getCardsInPlay().length === 0) {
      requirement.count = 0;
      requirement.waiting = true;
    }
    return requirement;
  }
}

module.exports = SacrificeCardForRequirementFactory;
