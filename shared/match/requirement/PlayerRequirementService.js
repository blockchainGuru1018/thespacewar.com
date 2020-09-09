const findMatchingRequirement = require("./findMatchingRequirements.js");

//TODO Separate querying for requirements and adding requirements
// A lot more information is required to add a requirement than to query once that are added.
// This leads to circular dependencies or to duplicated business logic, as objects needs this service to query
// and this service needs those objects to add requirements.
function PlayerRequirementService({
  playerStateService,
  opponentStateService,

  //TODO REMOVE THESE
  playerCommanders,
  moreCardsCanBeDrawnForDrawPhase,

  queryPlayerRequirements,
}) {
  return {
    getFirstMatchingRequirement:
      queryPlayerRequirements.getFirstMatchingRequirement,
    firstRequirementIsOfType: queryPlayerRequirements.firstRequirementIsOfType,

    addCardRequirement,
    addDrawCardRequirement,
    addDiscardCardRequirement,
    addDamageStationCardRequirement,
    addFindCardRequirement,
    addCounterCardRequirement,
    addCounterAttackRequirement,

    canAddDiscardCardRequirementWithCountOrLess,
    getQueuedDamageStationCardCount:
      queryPlayerRequirements.getQueuedDamageStationCardCount,
    canMill: queryPlayerRequirements.canMill,
    addEmptyCommonWaitingRequirement,

    updateFirstMatchingRequirement,
    removeFirstMatchingRequirement,
  };

  function addCardRequirement(requirement) {
    const type = requirement.type;
    if (type === "drawCard") {
      return addDrawCardRequirement(requirement);
    } else if (type === "discardCard") {
      return addDiscardCardRequirement(requirement);
    } else if (type === "damageShieldsOrStationCard") {
      return addDamageShieldsOrStationCardRequirement(requirement);
    } else if (type === "damageStationCard") {
      return addDamageStationCardRequirement(requirement);
    } else if (type === "findCard") {
      return addFindCardRequirement(requirement);
    } else if (type === "sacrifice") {
      return addSacrificeCardForRequirement(requirement);
    } else if (type === "counterCard") {
      return addCounterCardRequirement(requirement);
    } else if (type === "counterAttack") {
      return addCounterAttackRequirement(requirement);
    }
  }

  function addDiscardCardRequirement({
    count,
    common = false,
    cardCommonId = null,
  }) {
    const countToDiscard = getCountOrMinimumAvailableForDiscardingCards(count);
    if (countToDiscard > 0) {
      const requirement = {
        type: "discardCard",
        count: countToDiscard,
      };
      if (common) {
        requirement.common = true;
      }
      if (cardCommonId) {
        requirement.cardCommonId = cardCommonId;
      }
      addRequirement(requirement);

      return requirement;
    }

    return null;
  }

  function addDrawCardRequirement({
    count,
    common = false,
    cardCommonId = null,
    whenResolvedAddAlso = [],
    cancelable = false,
  }) {
    const countToDraw = getCountOrMinimumAvailableForDrawingCards(count);
    if (countToDraw > 0) {
      const requirement = { type: "drawCard", count: countToDraw };
      if (common) {
        requirement.common = true;
      }
      if (cardCommonId) {
        requirement.cardCommonId = cardCommonId;
      }
      if (whenResolvedAddAlso.length) {
        requirement.whenResolvedAddAlso = whenResolvedAddAlso;
      }
      if (cancelable) {
        requirement.cancelable = true;
      }
      addRequirement(requirement);

      return requirement;
    }

    return null;
  }

  function addDamageShieldsOrStationCardRequirement({
    count,
    common = false,
    cardCommonId = null,
    reason = "",
    card = null,
  }) {
    const hasOpponentShields = opponentStateService.hasMatchingCardInHomeZone(
      (c) => c.stopsStationAttack()
    );
    if (hasOpponentShields) {
      return addDamageShieldCardRequirement({
        count,
        common,
        cardCommonId,
        reason,
        card,
      });
    } else {
      return addDamageStationCardRequirement({
        count,
        common,
        cardCommonId,
        reason,
      });
    }
  }

  function addDamageShieldCardRequirement({
    count,
    common = false,
    cardCommonId = null,
    reason = "",
    card = null,
  }) {
    const requirement = { type: "damageShieldCard", count };
    if (reason) {
      requirement.reason = reason;
    }
    if (common) {
      requirement.common = true;
    }
    if (cardCommonId) {
      requirement.cardCommonId = cardCommonId;
    }
    if (card) {
      requirement.cardId = card.id;
    }
    addRequirement(requirement);
    return requirement;
  }

  function addSacrificeCardForRequirement(requirement) {
    addRequirement(requirement);
    return requirement;
  }

  function addDamageStationCardRequirement({
    count,
    common = false,
    cardCommonId = null,
    reason = "",
  }) {
    const stationCardCount = opponentStateService.getUnflippedStationCardsCount();

    const currentDamageStationCardRequirementsCount = queryPlayerRequirements
      .all()
      .filter((r) => r.type === "damageStationCard")
      .reduce((total, requirement) => total + requirement.count, 0);

    const maxStationCardCount =
      stationCardCount - currentDamageStationCardRequirementsCount;
    const countToDraw = Math.min(maxStationCardCount, count);
    if (countToDraw > 0) {
      const requirement = { type: "damageStationCard", count: countToDraw };
      if (reason) {
        requirement.reason = reason;
      }
      if (common) {
        requirement.common = true;
      }
      if (cardCommonId) {
        requirement.cardCommonId = cardCommonId;
      }
      addRequirement(requirement);

      return requirement;
    }

    return null;
  }

  function addFindCardRequirement({
    count,
    cardGroups,
    ...uncheckedProperties
  }) {
    const totalCardCount = cardGroups.reduce(
      (acc, group) => acc + group.cards.length,
      0
    );
    const requirement = {
      ...uncheckedProperties,
      type: "findCard",
      count: Math.min(totalCardCount, count),
      cardGroups: cardGroups.filter((g) => g.cards.length),
    };
    addRequirement(requirement);

    return requirement;
  }

  function addCounterCardRequirement({
    count,
    cardGroups,
    ...uncheckedProperties
  }) {
    const totalCardCount = cardGroups.reduce(
      (acc, group) => acc + group.cards.length,
      0
    );
    const requirement = {
      ...uncheckedProperties,
      type: "counterCard",
      count: Math.min(totalCardCount, count),
      cardGroups: cardGroups.filter((g) => g.cards.length),
    };
    addRequirement(requirement);

    return requirement;
  }

  function addCounterAttackRequirement({
    count,
    attacks,
    ...uncheckedProperties
  }) {
    const requirement = {
      ...uncheckedProperties,
      type: "counterAttack",
      count: Math.min(attacks.length, count),
      attacks,
    };
    addRequirement(requirement);

    return requirement;
  }

  function canAddDiscardCardRequirementWithCountOrLess(count) {
    return getCountOrMinimumAvailableForDiscardingCards(count) > 0;
  }

  function getCountOrMinimumAvailableForDiscardingCards(maxCount) {
    const cardsOnHandCount = playerStateService.getCardsOnHandCount();

    const currentDiscardCardRequirementsCount = queryPlayerRequirements
      .all()
      .filter((r) => r.type === "discardCard")
      .reduce((total, requirement) => total + requirement.count, 0);

    const maxDiscardCount =
      cardsOnHandCount - currentDiscardCardRequirementsCount;
    return Math.min(maxDiscardCount, maxCount);
  }

  function getCountOrMinimumAvailableForDrawingCards(maxCount) {
    const deckCardCount = playerStateService.getDeck().getCardCount();
    const availableDrawsAndMills =
      deckCardCount + opponentDeckPossibleMillsCount();
    const maxDrawCount =
      availableDrawsAndMills - currentDrawCardRequirementsCount();
    return Math.min(maxDrawCount, maxCount);
  }

  function currentDrawCardRequirementsCount() {
    return queryPlayerRequirements
      .all()
      .filter((r) => r.type === "drawCard")
      .reduce((total, requirement) => total + requirement.count, 0);
  }

  function opponentDeckPossibleMillsCount() {
    if (!queryPlayerRequirements.canMill()) return 0;

    return opponentStateService.getDeck().getPossibleMillCount();
  }

  function addRequirement(requirement) {
    playerStateService.update((playerState) => {
      playerState.requirements.push(requirement);
    });
  }

  function addEmptyCommonWaitingRequirement(requirement) {
    const addedRequirement = {
      ...requirement,
      count: 0,
      common: true,
      waiting: true,
    };
    addRequirement(addedRequirement);

    return addedRequirement;
  }

  function updateFirstMatchingRequirement(
    { type, common = null, waiting = null },
    updateFn
  ) {
    playerStateService.update((playerState) => {
      const requirements = playerState.requirements.slice();
      const requirement = findMatchingRequirement(requirements, {
        type,
        common,
        waiting,
      });
      return updateFn(requirement);
    });

    const updatedRequirements = queryPlayerRequirements.all();
    return findMatchingRequirement(updatedRequirements, {
      type,
      common,
      waiting,
    });
  }

  function removeFirstMatchingRequirement({
    type,
    common = null,
    waiting = null,
  }) {
    playerStateService.update((playerState) => {
      const requirements = playerState.requirements.slice();
      const requirement = findMatchingRequirement(requirements, {
        type,
        common,
        waiting,
      });
      const reverseIndexOfRequirement = requirements.indexOf(requirement);
      playerState.requirements.splice(reverseIndexOfRequirement, 1);
    });
  }
}

module.exports = PlayerRequirementService;
