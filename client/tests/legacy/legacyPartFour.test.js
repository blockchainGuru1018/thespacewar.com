const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../../shared/event/MoveCardEvent.js");
const AttackEvent = require("../../../shared/event/AttackEvent.js");
const getCardImageUrl = require("../../utils/getCardImageUrl.js");
const FakeState = require("../../testUtils/FakeState.js");
const FakeMatchController = require("../../testUtils/FakeMatchController.js");
const { createController: createTestController } = require("../../testUtils");
const {
  assert,
  sinon,
  timeout,
  stub,
  dom: { click },
} = require("../../testUtils/bocha-jest/bocha-jest.js");

const DeadlySniperCommonId = "39";
const PursuiterCommonId = "19";
const TheShadeCommonId = "27";
const EnergyShieldCommonId = "21";

let controller;
let matchController;

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
  getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

  controller && controller.tearDown();

  controller = null;
  matchController = null;
});

describe.skip("Deadly sniper", () => {
  describe("when card was placed this turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 1,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [
            {
              id: "C1A",
              attack: 1,
              type: "spaceShip",
              commonId: DeadlySniperCommonId,
            },
          ],
          opponentCardsInZone: [{ id: "C2A" }],
          opponentCardsInPlayerZone: [{ id: "C3A" }],
          opponentStationCards: [{ place: "draw", id: "C4A" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInZone .card .readyToAttack");
    });
    test("should NOT be able to attack opponent card in opponent zone", () => {
      assert.elementCount(".opponentCardsInZone .attackable", 0);
    });
    test("should NOT be able to attack station card", () => {
      assert.elementCount(".field-opponentStation .attackable", 0);
    });
    test("should be able to attack opponent card in home zone", () => {
      assert.elementCount(".opponentCardsInPlayerZone .attackable", 1);
    });
  });
  describe("when was placed last turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [
            {
              id: "C1A",
              attack: 1,
              type: "spaceShip",
              commonId: DeadlySniperCommonId,
            },
          ],
          opponentCardsInZone: [{ id: "C2A" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInZone .card .readyToAttack");
    });
    test("should be able to attack opponent card in opponent zone ", () => {
      assert.elementCount(".opponentCardsInZone .attackable", 1);
    });
    test("should be able to attack opponent station card", () => {
      assert.elementCount(".field-opponentStation .attackable", 1);
    });
  });
});
describe.skip("Pursuiter:", () => {
  describe("when has card and an opponent card in home zone", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentCardsInPlayerZone: [{ id: "C2A" }],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
        })
      );
      await timeout();
    });
    test("should be able to sacrifice own card", () => {
      assert.elementCount(".playerCardsInZone .sacrifice", 1);
    });
  });
  describe("when has card THAT IS NOT PURSUITER and an opponent card in home zone", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [{ id: "C1A", type: "spaceShip" }],
          opponentCardsInPlayerZone: [{ id: "C2A" }],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
        })
      );
      await timeout();
    });
    test("should NOT be able to sacrifice own card", () => {
      assert.elementCount(".playerCardsInZone .sacrifice", 0);
    });
  });
  describe("when select card to sacrifice and selects other card", () => {
    beforeEach(async () => {
      matchController = FakeMatchController({ emit: stub() });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentCardsInPlayerZone: [{ id: "C2A" }],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
        })
      );
      await timeout();

      await click(".playerCardsInZone .sacrifice");
      await click(".opponentCardsInPlayerZone .selectable");
    });
    test("should emit sacrifice with target card id", () => {
      assert.calledWith(matchController.emit, "sacrifice", {
        cardId: "C1A",
        targetCardId: "C2A",
      });
    });
  });
  describe("when select card in home zone to sacrifice", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
            { id: "C2A" },
          ],
          opponentCardsInPlayerZone: [{ id: "C2A" }],
          opponentCardsInZone: [{ id: "C3A" }],
          opponentStationCards: [{ id: "C4A", place: "draw" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C2A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInZone .sacrifice");
    });
    test("should NOT be able to select opponent card in opponent home zone", () => {
      assert.elementCount(".opponentCardsInZone .selectable", 0);
    });
    test("should be able to select opponent card in player home zone", () => {
      assert.elementCount(".opponentCardsInPlayerZone .selectable", 1);
    });
    test("should NOT be able to select opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 0);
    });
    test("should NOT be able to select player card to target for sacrifice", () => {
      assert.elementCount(".playerCardsInZone .selectable", 0);
    });
    test("should NOT be able to any card for attack", () => {
      assert.elementCount(".readyToAttack", 0);
    });
    test("should NOT show extra transient card in home zone", () => {
      assert.elementCount(".playerCardsInZone .card:not(.card-placeholder)", 2);
    });
  });
  describe("when select card in opponent zone to sacrifice", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentCardsInPlayerZone: [{ id: "C2A" }],
          opponentCardsInZone: [{ id: "C3A" }],
          opponentStationCards: [
            { id: "C4A", place: "draw" },
            {
              id: "C5A",
              flipped: true,
              place: "draw",
              card: createCard({ id: "C5A" }),
            },
          ],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C2A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
    });
    test("should be able to select opponent card in opponent home zone", () => {
      assert.elementCount(".opponentCardsInZone .selectable", 1);
    });
    test("should NOT be able to select opponent card in player home zone", () => {
      assert.elementCount(".opponentCardsInPlayerZone .selectable", 0);
    });
    test("should be able to select opponent station card", () => {
      assert.elementCount(".opponentStationCards .card:eq(0) .selectable", 1);
    });
    test("should NOT be able to select flipped opponent station card", () => {
      assert.elementCount(".opponentStationCards .card:eq(1) .selectable", 0);
    });
  });
  describe("when select card in opponent zone to sacrifice and opponent has energy shield", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentCardsInZone: [{ id: "C2A", commonId: EnergyShieldCommonId }],
          opponentStationCards: [{ id: "C3A", place: "draw" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C2A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
    });
    test("should be able to select opponent card in opponent home zone", () => {
      assert.elementCount(".opponentCardsInZone .selectable", 1);
    });
    test("should NOT be able to select opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 0);
    });
  });
  describe("when select card to sacrifice and select a station card", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentCardsInZone: [{ id: "C3A" }],
          opponentStationCards: [
            { id: "C4A", place: "draw" },
            { id: "C5A", place: "draw" },
          ],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
      await click(".opponentStationCards .card:eq(0) .selectable");
    });
    test("should NOT be able to select opponent card in opponent home zone", () => {
      assert.elementCount(".opponentCardsInZone .selectable", 0);
    });
    test("should be able to select second opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 1);
    });
  });
  describe("when select card to sacrifice and select a 4 station cards", () => {
    beforeEach(async () => {
      matchController = FakeMatchController({ emit: stub() });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentStationCards: [
            { id: "C2A", place: "draw" },
            { id: "C3A", place: "draw" },
            { id: "C4A", place: "draw" },
            { id: "C5A", place: "draw" },
            { id: "C6A", place: "draw" },
          ],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
      await click(".opponentStationCards .card:eq(0) .selectable");
      await click(".opponentStationCards .card:eq(1) .selectable");
      await click(".opponentStationCards .card:eq(2) .selectable");
      await click(".opponentStationCards .card:eq(3) .selectable");
    });
    test("should emit sacrifice with station card ids", () => {
      assert.calledWith(matchController.emit, "sacrifice", {
        cardId: "C1A",
        targetCardIds: ["C2A", "C3A", "C4A", "C5A"],
      });
    });
    test("should NOT be able to select another opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 0);
    });
  });
  describe("when select card to sacrifice and opponent has 3 unflipped station cards and select all 3", () => {
    beforeEach(async () => {
      matchController = FakeMatchController({ emit: stub() });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentStationCards: [
            { id: "C2A", place: "draw" },
            { id: "C3A", place: "draw" },
            { id: "C4A", place: "draw" },
            {
              id: "C5A",
              flipped: true,
              place: "draw",
              card: createCard({ id: "C5A" }),
            },
          ],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
      await click(".opponentStationCards .card:eq(0) .selectable");
      await click(".opponentStationCards .card:eq(1) .selectable");
      await click(".opponentStationCards .card:eq(2) .selectable");
    });
    test("should emit sacrifice with station card ids", () => {
      assert.calledWith(matchController.emit, "sacrifice", {
        cardId: "C1A",
        targetCardIds: ["C2A", "C3A", "C4A"],
      });
    });
    test("should NOT be able to select another opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 0);
    });
  });
  describe("when opponent has 1 station card and player has card in opponent zone with the ability to sacrifice itself", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 3,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentStationCards: [{ id: "C2A", place: "draw" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
            MoveCardEvent({ turn: 2, cardId: "C1A" }),
          ],
        })
      );
      await timeout();
    });
    test("should be able to select card for sacrifice", () => {
      assert.elementCount(".playerCardsInOpponentZone .sacrifice", 1);
    });
  });
  describe("when select card to sacrifice and opponent has 1 station card and select that card", () => {
    beforeEach(async () => {
      matchController = FakeMatchController({ emit: stub() });
      const { dispatch } = createController({
        matchController: matchController,
      });
      controller.showPage();
      dispatch(
        "stateChanged",
        FakeState({
          turn: 3,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInOpponentZone: [
            { id: "C1A", type: "spaceShip", commonId: PursuiterCommonId },
          ],
          opponentStationCards: [{ id: "C2A", place: "draw" }],
          events: [
            PutDownCardEvent({ turn: 1, location: "zone", cardId: "C1A" }),
            MoveCardEvent({ turn: 2, cardId: "C1A" }),
          ],
        })
      );
      await timeout();

      await click(".playerCardsInOpponentZone .sacrifice");
      await click(".opponentStationCards .card .selectable");
    });
    test("should emit sacrifice with station card ids", () => {
      assert.calledWith(matchController.emit, "sacrifice", {
        cardId: "C1A",
        targetCardIds: ["C2A"],
      });
    });
    test("should NOT be able to select another opponent station card", () => {
      assert.elementCount(".opponentStationCards .selectable", 0);
    });
  });
});
describe.skip("The Shade:", () => {
  describe("when opponent card is The Shade and it has NOT attacked this turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();

      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          cardsInZone: [{ id: "C1A", attack: 1 }],
          opponentCardsInPlayerZone: [
            { id: "C2A", commonId: TheShadeCommonId },
          ],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
          opponentEvents: [],
        })
      );
      await timeout();
    });
    test("player card should NOT be able to attack", () => {
      assert.elementCount(".playerCardsInZone .readyToAttack", 0);
    });
  });
  describe("when PLAYER IS THE FIRST PLAYER and opponent card is The Shade and it has attacked last turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();

      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          playerOrder: ["P1A", "P2A"],
          cardsInZone: [{ id: "C1A", attack: 1 }],
          opponentCardsInPlayerZone: [
            { id: "C2A", commonId: TheShadeCommonId },
          ],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
          opponentEvents: [
            AttackEvent({
              turn: 1,
              attackerCardId: "C2A",
              cardCommonId: TheShadeCommonId,
            }),
          ],
        })
      );
      await timeout();
    });
    test("player card should be able to attack", () => {
      assert.elementCount(".playerCardsInZone .readyToAttack", 1);
    });
  });
  describe("when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked this turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();

      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          playerOrder: ["P2A", "P1A"],
          cardsInZone: [{ id: "C1A", attack: 1 }],
          opponentCardsInPlayerZone: [
            { id: "C2A", commonId: TheShadeCommonId },
          ],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
          opponentEvents: [
            AttackEvent({
              turn: 2,
              attackerCardId: "C2A",
              cardCommonId: TheShadeCommonId,
            }),
          ],
        })
      );
      await timeout();
    });
    test("player card should be able to attack", () => {
      assert.elementCount(".playerCardsInZone .readyToAttack", 1);
    });
  });
  describe("when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked last turn", () => {
    beforeEach(async () => {
      const { dispatch } = createController();
      controller.showPage();

      dispatch(
        "stateChanged",
        FakeState({
          turn: 2,
          currentPlayer: "P1A",
          phase: "attack",
          playerOrder: ["P2A", "P1A"],
          cardsInZone: [{ id: "C1A", attack: 1 }],
          opponentCardsInPlayerZone: [
            { id: "C2A", commonId: TheShadeCommonId },
          ],
          events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
          opponentEvents: [
            AttackEvent({
              turn: 1,
              attackerCardId: "C2A",
              cardCommonId: TheShadeCommonId,
            }),
          ],
        })
      );
      await timeout();
    });
    test("player card should NOT be able to attack", () => {
      assert.elementCount(".playerCardsInZone .readyToAttack", 0);
    });
  });
});
