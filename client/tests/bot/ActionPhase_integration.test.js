/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const { PHASES } = require("../../../shared/phases.js");
const { setupFromState, BotId, PlayerId } = require("./botTestHelpers.js");
const { unflippedStationCard } = require("../../testUtils/factories.js");
const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");

test("playing a card", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "action",
    events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
    stationCards: [unflippedStationCard("S1A", "draw")],
    cardsOnHand: [createCard({ id: "C1A", cost: 0, type: "spaceShip" })],
  });

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

test("cannot play a card, should NOT try to play a card", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "action",
    stationCards: [unflippedStationCard("S1A", "draw")],
    cardsOnHand: [createCard({ id: "C1A", cost: 1 })],
  });

  expect(matchController.emit).not.toBeCalledWith("putDownCard");
});

test("when has NO card to play, should proceed to next phase", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "action",
    stationCards: [unflippedStationCard("S1A", "draw")],
    cardsOnHand: [],
  });

  expect(matchController.emit).toBeCalledWith("nextPhase", {
    currentPhase: PHASES.action,
  });
});

test("when has card too expensive to play, should place as station card", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "action",
    cardsOnHand: [createCard({ id: "C1A", cost: 1 })],
  });

  const location = expect.stringContaining("station-");
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C1A",
    location,
  });
});

test("when has already played station card, has 2 action point and has a space ship that cost 3, should NOT play that card", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "action",
    cardsOnHand: [createCard({ id: "C1A", type: "spaceShip", cost: 3 })],
    stationCards: [stationCard("S1A", "action")],
    events: [
      PutDownCardEvent.forTest({
        turn: 1,
        cardId: "S1A",
        location: "station-action",
      }),
    ],
  });

  expect(matchController.emit).not.toBeCalledWith("putDownCard", {
    cardId: "C1A",
    location: expect.any(String),
  });
});

test("when has 2 action point and has a space ship that cost 2, should play that card", async () => {
  const commonId = "1";
  const fakeRawCardData = [{ id: commonId, price: "2" }];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [createCard({ id: "C1A", type: "spaceShip", commonId })],
      stationCards: [stationCard("S1A", "action")],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C1A",
    location: "zone",
  });
});

function stationCard(cardId, stationRow) {
  return {
    flipped: false,
    id: cardId,
    place: stationRow,
  };
}
