const DestroyDuration = require("../../../shared/card/DestroyDuration.js");

module.exports = ({ opponentStateService, matchController }) => {
  return {
    canResolve,
    resolve,
  };

  function canResolve(requirement) {
    return (
      requirement.type === "findCard" &&
      requirement.cardCommonId &&
      requirement.cardCommonId === DestroyDuration.CommonId
    );
  }

  function resolve(requirement) {
    const groupSelection = {
      source: requirement.cardGroups[0].source,
      cardIds: [],
    };
    const durationCards = requirement.cardGroups[0].cards
      .map((card) => opponentStateService.createBehaviourCardById(card.id))
      .sort((cardA, cardB) => cardB.costToPlay - cardA.costToPlay);

    groupSelection.cardIds.push(durationCards[0].id);

    matchController.emit("selectCardForFindCardRequirement", {
      cardGroups: [groupSelection],
    });
  }
};
