const Drone = require("../../../shared/card/Drone.js");
const Fusion = require("../../../shared/card/Fusion.js");
const Carrier = require("../../../shared/card/Carrier.js");

module.exports = ({ matchController }) => {
  return {
    canResolve,
    resolve,
  };

  function canResolve(requirement) {
    return requirement.type === "findCard";
  }

  function resolve(requirement) {
    matchController.emit("selectCardForFindCardRequirement", {
      cardGroups: getCardGroup(requirement),
    });
  }
  function getCardGroup(requirement) {
    let cardsLeft = requirement.count;
    const result = [];
    requirement.cardGroups.forEach((group) => {
      if (group.cards.length > 0) {
        const groupSelection = { source: group.source, cardIds: [] };
        group.cards.forEach((card) => {
          if (cardsLeft !== 0) {
            groupSelection.cardIds.push(card.id);
            cardsLeft--;
          }
        });
        result.push(groupSelection);
      }
    });

    return result;
  }
  function scoreCard(card) {
    return (
      (card.canAttack() ? 0 : 1) + (card.commonId !== Drone.CommonId ? 1 : 0)
    );
  }
};
