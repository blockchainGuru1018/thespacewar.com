/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const { PHASES } = require("../../../shared/phases.js");
const { setupFromState } = require("./botTestHelpers.js");
const { unflippedStationCard } = require("../../testUtils/factories.js");
const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const Drone = require("../../../shared/card/Drone.js");
const DroneLeader = require("../../../shared/card/DroneLeader.js");
const ToxicGas = require("../../../shared/card/ToxicGas.js");
const RepairShip = require("../../../shared/card/RepairShip.js");
const Carrier = require("../../../shared/card/Carrier.js");
const Fusion = require("../../../shared/card/Fusion.js");
const DisturbingSignals = require("../../../shared/card/DisturbingSignals.js");
const ExtraDraw = require("../../../shared/card/ExtraDraw.js");
const Revive = require("../../../shared/card/Revive.js");
const TheParalyzer = require("../../../shared/card/TheParalyzer.js");
const Sacrifice = require("../../../shared/card/Sacrifice.js");
const DestroyDuration = require("../../../shared/card/DestroyDuration.js");
const CollisionSkill = require("../../../shared/card/CollisionSkill.js");
const Nitro = require("../../../shared/card/Fast.js");
const FreezingCold = require("../../../shared/card/FreezingCold.js");

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

test("when has drone card and can play it should always play it ", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "2" },
    { id: Drone.CommonId, price: "2" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({ id: "C1A", type: "spaceShip", commonId }),
        createCard({ id: "C2A", type: "spaceShip", commonId: Drone.CommonId }),
      ],
      stationCards: [stationCard("S1A", "action")],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("should always play toxic gas", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: ToxicGas.CommonId, price: "1" },
    { id: Drone.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "duration",
          commonId: ToxicGas.CommonId,
        }),
        createCard({
          id: "C3A",
          type: "duration",
          commonId,
        }),
      ],
      stationCards: [stationCard("S1A", "action")],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("When have more than 3 Drone on table play Drone Leader", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: DroneLeader.CommonId, price: "3" },
    { id: Drone.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: DroneLeader.CommonId,
          cost: 2,
        }),
        createCard({
          id: "C3A",
          type: "spaceShip",
          commonId,
          cost: 1,
        }),
      ],
      cardsInZone: [
        { id: "C4A", commonId: Drone.CommonId },
        { id: "C5A", commonId: Drone.CommonId },
        { id: "C6A", commonId: Drone.CommonId },
        { id: "C7A", commonId: Drone.CommonId },
      ],
      stationCards: [
        stationCard("S1A", "action"),
        stationCard("S1A", "action"),
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("When have more than 3 Drone on opponent zone play Drone Leader", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: DroneLeader.CommonId, price: "3" },
    { id: Drone.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: DroneLeader.CommonId,
          cost: 2,
        }),
        createCard({
          id: "C3A",
          type: "spaceShip",
          commonId,
          cost: 1,
        }),
      ],
      cardsInOpponentZone: [
        { id: "C4A", commonId: Drone.CommonId },
        { id: "C5A", commonId: Drone.CommonId },
        { id: "C6A", commonId: Drone.CommonId },
        { id: "C7A", commonId: Drone.CommonId },
      ],
      stationCards: [
        stationCard("S1A", "action"),
        stationCard("S1A", "action"),
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("When have less than  3 Drone on table not play Drone Leader", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: DroneLeader.CommonId, price: "3" },
    { id: Drone.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: DroneLeader.CommonId,
          cost: 2,
        }),
        createCard({
          id: "C3A",
          type: "spaceShip",
          commonId,
          cost: 1,
        }),
      ],
      cardsInZone: [
        { id: "C4A", commonId: Drone.CommonId },
        { id: "C5A", commonId: Drone.CommonId },
      ],
      stationCards: [
        stationCard("S1A", "action"),
        stationCard("S1A", "action"),
      ],
    },
    fakeRawCardData
  );
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C3A",
    location: "zone",
  });
});

test("When have 2 damage station cards should play Repair Ship", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: RepairShip.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C3A",
          type: "spaceShip",
          commonId,
          cost: 2,
        }),
        createCard({
          id: "C4A",
          type: "spaceShip",
          commonId,
          cost: 2,
        }),
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: RepairShip.CommonId,
          cost: 2,
        }),
      ],
      stationCards: [
        flippedStationCard("S1A", "action"),
        flippedStationCard("S1A", "action"),
        stationCard("S1A", "action"),
      ],
    },
    fakeRawCardData
  );
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("Should play Carrier", async () => {
  const commonId = "1";
  const fakeRawCardData = [
    { id: commonId, price: "1" },
    { id: Carrier.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 1,
      phase: "action",
      events: [{ turn: 1, type: "putDownCard", location: "station-action" }],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: Carrier.CommonId,
          cost: 4,
        }),
      ],
      stationCards: [
        flippedStationCard("S1A", "action"),
        flippedStationCard("S1A", "action"),
        stationCard("S1A", "action"),
      ],
    },
    fakeRawCardData
  );
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C2A",
    location: "zone",
  });
});

test("Should play Fusion", async () => {
  const fakeRawCardData = [
    { id: Drone.CommonId, price: "1" },
    { id: Fusion.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-draw" },
      ],
      cardsOnHand: [
        createCard({
          id: "C1A",
          type: "spaceShip",
          commonId: Fusion.CommonId,
          cost: 1,
          attack: 1,
        }),
      ],
      cardsInZone: [
        {
          id: "C2A",
          type: "spaceShip",
          commonId: Drone.CommonId,
          cost: 1,
        },
        {
          id: "C3A",
          type: "spaceShip",
          commonId: Drone.CommonId,
          cost: 1,
        },
      ],
      stationCards: [stationCard("S1A", "action")],
    },
    fakeRawCardData
  );
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C1A",
    location: "zone",
  });
});

test("Should resolve find card requirement", async () => {
  const { matchController } = await setupFromState({
    turn: 1,
    phase: "attack",
    stationCards: [stationCard("S1A", "action")],
    requirements: [
      {
        cancelable: false,
        cardGroups: [
          {
            cards: [{ id: "R1A" }, { id: "R2A" }, { id: "R3A" }],
            source: "deck",
          },
        ],
        count: 3,
        target: "currentCardZone",
        type: "findCard",
      },
    ],
  });
  expect(matchController.emit).toBeCalledWith(
    "selectCardForFindCardRequirement",
    {
      cardGroups: [
        {
          source: "deck",
          cardIds: ["R1A", "R2A", "R3A"],
        },
      ],
    }
  );
});

function stationCard(cardId, stationRow) {
  return {
    flipped: false,
    id: cardId,
    place: stationRow,
  };
}

test("When can play DisturbingSignals should play it", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: DisturbingSignals.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [{ turn: 2, type: "putDownCard", location: "station-action" }],
      stationCards: [unflippedStationCard("S1A", "draw")],
      cardsOnHand: [
        createCard({ id: "C1A", commonId: DisturbingSignals.CommonId }),
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});
test("When can play ExtraDraw should play it", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: ExtraDraw.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [{ turn: 2, type: "putDownCard", location: "station-action" }],
      stationCards: [unflippedStationCard("S1A", "draw")],
      cardsOnHand: [createCard({ id: "C1A", commonId: ExtraDraw.CommonId })],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

test("When have more than 1 Drone in discard pile should play Revive Procedure and pick 2 Drones", async () => {
  const fakeRawCardData = [
    { id: Drone.CommonId, price: "1" },
    { id: Revive.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [{ turn: 2, type: "putDownCard", location: "station-action" }],
      stationCards: [unflippedStationCard("S1A", "draw")],
      cardsOnHand: [createCard({ id: "C1A", commonId: Revive.CommonId })],
      discardedCards: [
        { id: "C2A", commonId: Drone.CommonId },
        { id: "C3A", commonId: Drone.CommonId },
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

test("Play sacrifice only when have 0 cards in play but enemy have", async () => {
  const fakeRawCardData = [
    { id: Drone.CommonId, price: "1" },
    { id: Revive.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-action" },
      ],
      stationCards: [
        unflippedStationCard("S1A", "action"),
        unflippedStationCard("S2A", "action"),
        unflippedStationCard("S3A", "action"),
      ],
      cardsOnHand: [createCard({ id: "C1A", commonId: Sacrifice.CommonId })],
      opponentCardsInZone: [
        createCard({ id: "C2A", commonId: Drone.CommonId }),
      ],
      actionStationCardsCount: 3,
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

test("Play not sacrifice only when have  cards in play but enemy have", async () => {
  const fakeRawCardData = [
    { id: Drone.CommonId, price: "1" },
    { id: Revive.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-action" },
      ],
      stationCards: [
        unflippedStationCard("S1A", "action"),
        unflippedStationCard("S2A", "action"),
        unflippedStationCard("S3A", "action"),
      ],
      cardsInZone: [createCard({ id: "C3A", commonId: Drone.CommonId })],
      cardsOnHand: [createCard({ id: "C1A", commonId: Sacrifice.CommonId })],
      opponentCardsInZone: [
        createCard({ id: "C2A", commonId: Drone.CommonId }),
      ],
      actionStationCardsCount: 3,
    },
    fakeRawCardData
  );

  expect(matchController.emit).not.toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

test("Destroy duration should be played as destroy", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: DestroyDuration.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-action" },
      ],
      stationCards: [
        unflippedStationCard("S1A", "action"),
        unflippedStationCard("S3A", "action"),
      ],
      cardsOnHand: [
        createCard({ id: "C1A", commonId: DestroyDuration.CommonId }),
      ],
      opponentCardsInZone: [
        createCard({ id: "C2A", type: "duration", commonId: "1" }),
      ],
      actionStationCardsCount: 3,
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
    choice: "destroy",
  });
});

test("Destroy duration should be played as draw", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: DestroyDuration.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-action" },
      ],
      stationCards: [
        unflippedStationCard("S1A", "action"),
        unflippedStationCard("S3A", "action"),
      ],
      cardsOnHand: [
        createCard({ id: "C1A", commonId: DestroyDuration.CommonId }),
      ],
      actionStationCardsCount: 3,
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
    choice: "draw",
  });
});

test("Should play by commonId cards", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: Nitro.CommonId, price: "1" },
    { id: CollisionSkill.CommonId, price: "1" },
    { id: FreezingCold.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [],
      stationCards: [unflippedStationCard("S1A", "draw")],
      cardsOnHand: [
        createCard({ id: "C1A", commonId: FreezingCold.CommonId }),
        createCard({ id: "C2A", commonId: CollisionSkill.CommonId }),
        createCard({ id: "C3A", commonId: Nitro.CommonId }),
        createCard({ id: "C4A", commonId: Drone.CommonId }),
      ],
    },
    fakeRawCardData
  );
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "station-action",
    cardId: "C3A",
  });
});

test("Should not play paralizer", async () => {
  const fakeRawCardData = [
    { id: "1", price: "1" },
    { id: DisturbingSignals.CommonId, price: 8 },
    { id: TheParalyzer.CommonId, price: 7 },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "action",
      events: [
        { turn: 1, type: "putDownCard", location: "station-action" },
        { turn: 2, type: "putDownCard", location: "station-action" },
      ],
      stationCards: [
        unflippedStationCard("S1A", "action"),
        unflippedStationCard("S3A", "action"),
        unflippedStationCard("S4A", "action"),
        unflippedStationCard("S5A", "action"),
        unflippedStationCard("S6A", "action"),
        unflippedStationCard("S7A", "action"),
      ],
      cardsOnHand: [
        createCard({
          id: "C2A",
          type: "spaceShip",
          commonId: TheParalyzer.CommonId,
          cost: 2,
        }),
        createCard({
          id: "C1A",
          type: "event",
          commonId: DisturbingSignals.CommonId,
          cost: 3,
        }),
      ],
      opponentCardsInPlayerZone: [
        createCard({
          id: "C3A",
          type: "spaceShip",
          defense: "10",
          commonId: "1",
          cost: "8",
        }),
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    location: "zone",
    cardId: "C1A",
  });
});

function flippedStationCard(cardId, stationRow) {
  return {
    flipped: true,
    id: cardId,
    card: {
      commonId: "1",
    },
    place: stationRow,
  };
}
