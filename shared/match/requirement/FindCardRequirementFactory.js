FindCardRequirementFactory.type = "findCard";

function FindCardRequirementFactory({ sourceFetcher, requirementSpec, card }) {
  return {
    create,
  };

  function create() {
    const requirement = {
      type: requirementSpec.type,
      cardGroups: cardGroupsFromSpec(),
      cardCommonId: card.commonId,
      count: requirementSpec.count,
      target: requirementSpec.target,
      common: !!requirementSpec.common,
      waiting: requirementSpec.count === 0 && requirementSpec.common,
      cancelable: !!requirementSpec.cancelable,
      submitOnEverySelect: !!requirementSpec.submitOnEverySelect,
      cardId: card.id,
    };
    if (requirementSpec.dormantEffect) {
      requirement.usedDormantEffect = {
        cardId: card.id,
        destroyCard: requirementSpec.dormantEffect.destroyTriggerCard,
      };
    }
    if (requirementSpec.actionPointsLimit) {
      requirement.actionPointsLimit = {
        actionPointsLeft: requirementSpec.actionPointsLimit.actionPointsLeft
          ? requirementSpec.actionPointsLimit.actionPointsLeft
          : requirementSpec.actionPointsLimit,
      };
    }

    return requirement;
  }

  function cardGroupsFromSpec() {
    if (requirementSpec.count > 0) {
      return requirementSpec.sources.map(cardGroupFromSource);
    } else {
      return [];
    }
  }

  function cardGroupFromSource(source) {
    const filters = { ...requirementSpec.filter, excludeCardIds: [card.id] };
    if (requirementSpec.actionPointsLimit) {
      filters.actionPointsLeft = requirementSpec.actionPointsLimit;
    }
    return {
      source,
      cards:
        source === "currentCardZone"
          ? sourceFetcher[source](filters, card.id)
          : sourceFetcher[source](filters),
    };
  }
}

module.exports = FindCardRequirementFactory;
