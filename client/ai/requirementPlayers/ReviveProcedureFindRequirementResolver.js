const Drone = require("../../../shared/card/Drone.js");
const Revive = require("../../../shared/card/Revive.js");

module.exports = ({ matchController }) => {
  return {
    canResolve,
    resolve,
  };

  function canResolve(requirement) {
    return (
      requirement.cardCommonId && requirement.cardCommonId === Revive.CommonId
    );
  }

  function resolve(findRequirement) {
    const cardIds = findRequirement.cardGroups[0].cards
      .filter((card) => card.commonId === Drone.CommonId)
      .map((droneCard) => droneCard.id)
      .slice(0, 2);
    matchController.emit("selectCardForFindCardRequirement", {
      cardGroups: [{ source: "discardPile", cardIds }],
    });
  }
};
