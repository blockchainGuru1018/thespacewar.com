const Drone = require("../../../shared/card/Drone.js");
const Fusion = require("../../../shared/card/Fusion.js");
const Carrier = require("../../../shared/card/Carrier.js");

module.exports = ({ playerStateService, matchController }) => {
  return {
    canResolve,
    resolve,
  };

  function canResolve(requirement) {
    return (
      requirement.cardCommonId && requirement.cardCommonId === Fusion.CommonId
    );
  }

  function resolve(findRequirement) {
    if (findRequirement.target === "discardPile") {
      const groupSelection = {
        source: findRequirement.cardGroups[0].source,
        cardIds: [],
      };
      const currentCardsAtZone = findRequirement.cardGroups[0].cards
        .map((card) => playerStateService.createBehaviourCard(card))
        .sort((cardA, cardB) => {
          const cardAScore = scoreCard(cardA);
          const cardBScore = scoreCard(cardB);
          return cardAScore - cardBScore;
        });
      groupSelection.cardIds.push(
        currentCardsAtZone[0].id,
        currentCardsAtZone[1].id
      );

      matchController.emit("selectCardForFindCardRequirement", {
        cardGroups: [groupSelection],
      });
    } else if (findRequirement.target === "currentCardZone") {
      const cardsInDeck = findRequirement.cardGroups[0];
      const carrier = cardsInDeck.cards.find(
        (card) => card.commonId === Carrier.CommonId
      );
      const groupSelection = { source: cardsInDeck.source, cardIds: [] };
      if (carrier) {
        groupSelection.cardIds.push(carrier.id);
      } else {
        const cardNotDrone = cardsInDeck.cards.filter(
          (card) => card.commonId !== Drone.CommonId
        )[0];
        groupSelection.cardIds.push(cardNotDrone.id);
      }
      matchController.emit("selectCardForFindCardRequirement", {
        cardGroups: groupSelection,
      });
    }
  }

  function scoreCard(card) {
    return (
      (card.canAttack() ? 0 : 1) + (card.commonId !== Drone.CommonId ? 1 : 0)
    );
  }
};
