const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../../shared/event/MoveCardEvent.js");
const RepairCardEvent = require("../../../shared/event/RepairCardEvent.js");
const AttackEvent = require("../../../shared/event/AttackEvent.js");
const getCardImageUrl = require("../../utils/getCardImageUrl.js");
const FakeState = require("../../testUtils/FakeState.js");
const FakeMatchController = require("../../testUtils/FakeMatchController.js");
const Commander = require("../../../shared/match/commander/Commander.js");
const { createController: createTestController } = require("../../testUtils");
const {
  assert,
  refute,
  sinon,
  timeout,
  stub,
  fakeClock,
  dom: { click },
} = require("../../testUtils/bocha-jest/bocha-jest.js");

const DiscoveryCommonId = "42";
const CommonShipId = "25";
const FastMissileId = "6";
const FatalErrorCommonId = "38";
const TriggerHappyJoeCommonId = "24";
const DeadlySniperCommonId = "39";
const PursuiterCommonId = "19";
const TheShadeCommonId = "27";
const EnergyShieldCommonId = "21";
const SmallRepairShopId = "29";

let controller;
let matchController;
let clock;

function createController({ matchController = FakeMatchController() } = {}) {
  //Has side effects to afford a convenient tear down
  controller = createTestController({ matchController });
  return controller;
}

beforeEach(async () => {
  sinon.stub(getCardImageUrl, "byCommonId").returns("/#");

  controller = createController();
});

afterEach(() => {
  clock && clock.restore();
  getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

  controller && controller.tearDown();

  controller = null;
  clock = null;
  matchController = null;
});

describe("Discovery:", () => {
  describe('when place down card "Discovery"', () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 1,
          currentPlayer: "P1A",
          phase: "action",
          cardsOnHand: [
            {
              id: "C1A",
              type: "event",
              commonId: DiscoveryCommonId,
            },
          ],
        })
      );
      await timeout();

      await click(".playerCardsOnHand .cardOnHand");
      await click(".playerEventCardGhost");
    });
    test("should put down card in zone", () => {
      assert.elementCount(
        ".field-playerZoneCards .card:not(.card-placeholder)",
        1
      );
    });
    test("should NOT have card on hand", () => {
      assert.elementCount(".playerCardsOnHand .cardOnHand", 0);
    });
    test("should NOT discard card", () => {
      assert.elementCount(".field-discardPile .card-faceDown", 0);
    });
    test("should show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 1);
    });
  });
  describe('when move card "Discovery" from station to zone', () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "action",
          stationCards: [
            {
              place: "draw",
              id: "C1A",
              card: createCard({
                id: "C1A",
                type: "event",
                commonId: DiscoveryCommonId,
              }),
              flipped: true,
            },
            { place: "draw", id: "C2A" },
          ],
          events: [
            PutDownCardEvent({
              cardId: "C1A",
              cardCommonId: DiscoveryCommonId,
              location: "zone",
              turn: 1,
            }),
          ],
        })
      );
      await timeout();

      await click(".stationCard .moveToZone");
    });
    test("should show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 1);
    });
    test("should have card in zone", () => {
      assert.elementCount(
        ".field-playerZoneCards .card:not(.card-placeholder)",
        1
      );
    });
    test("should NOT have card among station cards", () => {
      assert.elementCount(".field-player .stationCard", 1);
    });
    test("should NOT have discarded card", () => {
      assert.elementCount(".field-discardPile .card-faceDown", 0);
    });
  });
  describe('when move card "Discovery" from station to zone and cancels', () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "action",
          stationCards: [
            {
              place: "draw",
              id: "C1A",
              card: createCard({
                id: "C1A",
                type: "event",
                commonId: DiscoveryCommonId,
              }),
              flipped: true,
            },
            { place: "draw", id: "C2A" },
          ],
          events: [
            PutDownCardEvent({
              cardId: "C1A",
              cardCommonId: DiscoveryCommonId,
              location: "zone",
              turn: 1,
            }),
          ],
        })
      );
      await timeout();

      await click(".stationCard .moveToZone");
      await click(".cardChoiceDialog-overlay");
    });
    test("should NOT show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 0);
    });
    test("should NOT have card in zone", () => {
      assert.elementCount(
        ".field-playerZoneCards .card:not(.card-placeholder)",
        0
      );
    });
    test("should have card among station cards", () => {
      assert.elementCount(".field-player .stationCard", 2);
    });
    test("should NOT have discarded card", () => {
      assert.elementCount(".field-discardPile .card-faceDown", 0);
    });
  });
  describe('when place down card "Discovery" and choose draw options', () => {
    beforeEach(async () => {
      matchController = FakeMatchController();
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 1,
          currentPlayer: "P1A",
          phase: "action",
          cardsOnHand: [
            {
              id: "C1A",
              type: "event",
              commonId: DiscoveryCommonId,
            },
          ],
        })
      );
      await timeout();
      await click(".playerCardsOnHand .cardOnHand");
      await click(".playerEventCardGhost");

      await click('.cardChoiceDialog-choice:contains("draw")');
    });
    test('should emit "putDownCard"', () => {
      assert.calledOnceWith(matchController.emit, "putDownCard", {
        location: "zone",
        cardId: "C1A",
        choice: "draw",
      });
    });
    test("should NOT show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 0);
    });
    test("should NOT show card in zone", () => {
      assert.elementCount(
        ".field-playerZoneCards .card:not(.card-placeholder)",
        0
      );
    });
    test("should NOT show card on hand", () => {
      assert.elementCount(".playerCardsOnHand .cardOnHand", 0);
    });
    test("should show card in discard pile", () => {
      assert.elementCount(
        '.field-player .field-discardPile .card[data-cardId="C1A"]',
        1
      );
    });
  });
  describe('when place down card "Discovery" and choose discard option', () => {
    beforeEach(async () => {
      matchController = FakeMatchController({
        emit: stub().returns(new Promise(() => {})),
      });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 1,
          currentPlayer: "P1A",
          phase: "action",
          cardsOnHand: [
            {
              id: "C1A",
              type: "event",
              commonId: DiscoveryCommonId,
            },
          ],
        })
      );
      await timeout();
      await click(".playerCardsOnHand .cardOnHand");
      await click(".playerEventCardGhost");

      await click('.cardChoiceDialog-choice:contains("discard")');
    });
    test('should emit "putDownCard"', () => {
      assert.calledOnceWith(matchController.emit, "putDownCard", {
        location: "zone",
        cardId: "C1A",
        choice: "discard",
      });
    });
    test("should NOT show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 0);
    });
  });
  describe('when place down card "Discovery" and cancels', () => {
    beforeEach(async () => {
      matchController = FakeMatchController({ emit: stub() });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 1,
          currentPlayer: "P1A",
          phase: "action",
          cardsOnHand: [
            {
              id: "C1A",
              type: "event",
              commonId: DiscoveryCommonId,
            },
          ],
        })
      );
      await timeout();
      await click(".playerCardsOnHand .cardOnHand");
      await click(".playerEventCardGhost");

      await click(".cardChoiceDialog-overlay");
    });
    test('should NOT emit "putDownCard"', () => {
      refute.calledWith(matchController.emit, "putDownCard");
    });
    test("should NOT show choice dialog", () => {
      assert.elementCount(".cardChoiceDialog", 0);
    });
    test("should NOT have card in zone", () => {
      assert.elementCount(
        ".field-playerZoneCards .card:not(.card-placeholder)",
        0
      );
    });
    test("should show card on hand", () => {
      assert.elementCount(".playerCardsOnHand .cardOnHand", 1);
    });
    test("should NOT have discarded card", () => {
      assert.elementCount(".field-discardPile .card-faceDown", 0);
    });
  });
});
