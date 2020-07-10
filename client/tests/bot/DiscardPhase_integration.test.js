/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const { PHASES } = require("../../../shared/phases.js");
const {
  setupFromState,
  setupFromStateWithStubs,
  BotId,
  PlayerId,
} = require("./botTestHelpers.js");
const { unflippedStationCard } = require("../../testUtils/factories.js");

describe("Being in the discard phase", () => {
  it("and does not need to discard any cards, should proceed to the next phase", async () => {
    const { matchController } = await setupFromState({
      turn: 1,
      phase: "discard",
      stationCards: [unflippedStationCard("S1A", "handSize")],
      cardsOnHand: [createCard({ id: "C1A" }), createCard({ id: "C2A" })],
    });

    expect(matchController.emit).toBeCalledWith("nextPhase", {
      currentPhase: PHASES.discard,
    });
  });

  it("when in discard phase, should delegate to DiscardPhaseDecider", async () => {
    const discardPhaseDecider = { decide: jest.fn() };
    await setupFromStateWithStubs(
      {
        turn: 1,
        phase: "discard",
      },
      {
        discardPhaseDecider,
      }
    );

    expect(discardPhaseDecider.decide).toBeCalledTimes(1);
  });
});
