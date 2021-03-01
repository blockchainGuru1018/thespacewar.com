FindCardRequirementFactory.type = "findCard";

function FindCardRequirementFactory({
  sourceFetcher,
  requirementSpec,
  playerStateService,
  card,
}) {
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
      id: Date.now(),
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
    let auxSource = source;
    const filters = { ...requirementSpec.filter, excludeCardIds: [card.id] };
    if (requirementSpec.actionPointsLimit) {
      filters.actionPointsLeft = requirementSpec.actionPointsLimit;
    }
    if (source === "currentCardZone") {
      const zone = playerStateService.nameOfCardSource(card.id);
      if (zone === "zone") {
        auxSource = "cardsInZone";
      } else if (zone === "opponentZone") {
        auxSource = "cardsInOpponentZone";
      }
    }

    return {
      source: auxSource,
      cards: sourceFetcher[auxSource](filters),
    };
  }
}

module.exports = FindCardRequirementFactory;
