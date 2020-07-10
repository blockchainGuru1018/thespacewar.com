const { assert } = require("../testUtils/bocha-jest/bocha");
const createCard = require("../testUtils/FakeCardDataAssembler.js").createCard;
const TestHelper = require("../fakeFactories/TestHelper.js");
const createState = require("../fakeFactories/createState.js");
const TargetMissed = require("../../card/TargetMissed.js");
const AttackEvent = require("../../event/AttackEvent.js");
const TurnControlEvent = require("../../event/TurnControlEvent.js");

module.exports = {
  "can create counterAttack requirement": function () {
    const attackEventTime = Date.now();
    const testHelper = TestHelper(
      createState({
        currentPlayer: "P1A",
        playerStateById: {
          P1A: {
            cardsInZone: [
              createCard({ id: "C1A", commonId: TargetMissed.CommonId }),
              createCard({ id: "C2A" }),
            ],
            events: [
              TurnControlEvent.takeControlOfOpponentsTurn(attackEventTime),
            ],
          },
          P2A: {
            cardsInOpponentZone: [{ id: "C3A", type: "spaceShip" }],
            events: [AttackEvent.card("C3A", "C2A", attackEventTime)],
          },
        },
      })
    );
    const playerRequirementFactory = testHelper.playerRequirementFactory("P1A");
    const targetMissed = testHelper
      .playerStateService("P1A")
      .createBehaviourCardById("C1A");

    const requirement = playerRequirementFactory.createForCardAndSpec(
      targetMissed,
      { type: "counterAttack", count: 1 }
    );

    assert.match(requirement, {
      type: "counterAttack",
      count: 1,
      cardId: "C1A",
      cardCommonId: TargetMissed.CommonId,
    });
    assert.equals(requirement.attacks.length, 1);
    assert.match(requirement.attacks[0], {
      time: attackEventTime,
      attackerCardData: { id: "C3A" },
      defenderCardsData: [{ id: "C2A" }],
    });
  },
};
