/**
 * @jest-environment node
 */
const ShouldPlayParalizer = require("../../../ai/cardRules/ShouldPlayParalizer.js");
const TheParalyzer = require("../../../../shared/card/TheParalyzer.js");

test("when there is a enemy spaceShip card costing 5 in the home zone should be TRUE", () => {
  const rule = ShouldPlayParalizer({
    opponentStateService: {
      getCardsInOpponentZone: () => [{ id: "C1A" }],
      createBehaviourCard: (card) => ({ id: "C1A", costToPlay: 6 }),
    },
  });

  expect(rule({ commonId: TheParalyzer.CommonId })).toBe(true);
});
