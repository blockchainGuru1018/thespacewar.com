const _canMill = require("../mill/canMill.js");
const Commander = require("../commander/Commander.js");
const findMatchingRequirement = require("./findMatchingRequirements.js");

function QueryPlayerRequirements({
  playerStateService,
  opponentStateService,
  playerCommanders,
  moreCardsCanBeDrawnForDrawPhase,
}) {
  return {
    all,
    hasAnyRequirements,
    isWaitingOnOpponentFinishingRequirement,
    getFirstMatchingRequirement,
    firstRequirementIsOfType,
    canAddDiscardCardRequirementWithCountOrLess,
    getQueuedDamageStationCardCount,
    canMill,
  };

  function all() {
    return playerStateService.getPlayerState().requirements.slice();
  }

  function hasAnyRequirements() {
    return all().length > 0;
  }

  function isWaitingOnOpponentFinishingRequirement() {
    return all().some((r) => r.waiting);
  }

  function getFirstMatchingRequirement(matchingCondition) {
    const requirements = playerStateService
      .getPlayerState()
      .requirements.slice();
    return findMatchingRequirement(requirements, matchingCondition);
  }

  function firstRequirementIsOfType(type) {
    const requirements = all();
    const firstRequirement = requirements[0];
    return firstRequirement && firstRequirement.type === type;
  }

  function canAddDiscardCardRequirementWithCountOrLess(count) {
    return getCountOrMinimumAvailableForDiscardingCards(count) > 0;
  }

  function getCountOrMinimumAvailableForDiscardingCards(maxCount) {
    const cardsOnHandCount = playerStateService.getCardsOnHandCount();

    const currentDiscardCardRequirementsCount = all()
      .filter((r) => r.type === "discardCard")
      .reduce((total, requirement) => total + requirement.count, 0);

    const maxDiscardCount =
      cardsOnHandCount - currentDiscardCardRequirementsCount;
    return Math.min(maxDiscardCount, maxCount);
  }

  function getQueuedDamageStationCardCount() {
    return all()
      .filter((r) => r.type === "damageStationCard")
      .reduce((total, requirement) => total + requirement.count, 0);
  }

  function canMill() {
    return _canMill({
      isWaitingOnOpponentFinishingRequirement: isWaitingOnOpponentFinishingRequirement(),
      firstRequirementIsDrawCard: firstRequirementIsOfType("drawCard"),
      opponentDeckIsEmpty: opponentStateService.deckIsEmpty(),
      playerHasTheMiller: playerCommanders.has(Commander.TheMiller),
      moreCardsCanBeDrawnForDrawPhase: moreCardsCanBeDrawnForDrawPhase(),
    });
  }
}

module.exports = QueryPlayerRequirements;
