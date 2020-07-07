const bocha = require("../testUtils/bocha-jest/bocha");
const assert = bocha.assert;
const refute = bocha.refute;
const defaults = bocha.defaults;
const createState = require("../fakeFactories/createState.js");
const FakeCardDataAssembler = require("../testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const CardFactory = require("../../card/CardFactory.js");
const PlayerStateService = require("../../match/PlayerStateService.js");
const PlayerRuleService = require("../../match/PlayerRuleService.js");
const MatchService = require("../../match/MatchService.js");
const PlayerServiceProvider = require("../../match/PlayerServiceProvider.js");
const TestHelper = require("../fakeFactories/TestHelper.js");
const PutDownCardEvent = require("../../PutDownCardEvent.js");
const GameConfig = require("../../match/GameConfig.js");
const DestinyDecided = require("../../card/DestinyDecided.js");
const fakePlayerServiceFactory = require("../fakeFactories/fakePlayerServiceFactory.js");

module.exports = {
  "draw cards:": {
    "when deck is empty and opponent deck is not empty can draw cards"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "draw",
              cardsInDeck: [],
            },
            P2A: {
              cardsInDeck: [{}],
            },
          },
        })
      );

      const service = testHelper.playerRuleService("P1A");

      refute(service.canDrawCards());
    },
  },
  "when max number of station cards is 1 and has 1 station card": {
    setUp() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          turn: 1,
          playerStateById: {
            P1A: {
              phase: "action",
              stationCards: [stationCard("S1A", "draw")],
              events: [
                PutDownCardEvent({
                  location: "station-draw",
                  cardId: "S1A",
                  turn: 1,
                }),
              ],
            },
          },
        }),
        {
          gameConfig: GameConfig({ maxStationCards: 1 }),
        }
      );
      this.playerRuleService = testHelper.playerRuleService("P1A");
    },
    "should NOT be able to put down more station cards"() {
      refute(this.playerRuleService.canPutDownMoreStationCardsThisTurn());
    },
  },
  "max hand size:": {
    "when player has card that grants unlimited hand size should return Infinity": async function () {
      const cardFactory = {
        createCardForPlayer: (cardData) => {
          if (cardData.id === "C1A")
            return {
              id: "C1A",
              type: "duration",
              grantsUnlimitedHandSize: true,
            };
        },
      };
      const playerState = createPlayerState({
        cardsInZone: [createCard({ id: "C1A" })],
      });
      const matchService = createMatchService({
        getPlayerState: () => playerState,
      });
      const playerStateService = new PlayerStateService({
        matchService,
        cardFactory,
      });
      const canThePlayer = {
        useThisDurationCard: (cardId) => cardId === "C1A",
      };
      const service = new PlayerRuleService({
        playerStateService,
        canThePlayer,
      });

      const result = service.getMaximumHandSize();

      assert.equals(result, Infinity);
    },
    "when can NOT use duration cards player has DURATION card that grants unlimited hand size should NOT return Infinity": async function () {
      const cardFactory = {
        createCardForPlayer: (cardData) => {
          if (cardData.id === "C1A")
            return {
              id: "C1A",
              type: "duration",
              grantsUnlimitedHandSize: true,
            };
        },
      };
      const playerState = createPlayerState({
        cardsInZone: [createCard({ id: "C1A" })],
        stationCards: [],
      });
      const matchService = createMatchService({
        getPlayerState: () => playerState,
      });
      const playerStateService = new PlayerStateService({
        matchService,
        cardFactory,
      });
      const canThePlayer = {
        useThisDurationCard: (cardId) => cardId !== "C1A",
      };
      const service = new PlayerRuleService({
        playerStateService,
        canThePlayer,
      });

      const result = service.getMaximumHandSize();

      assert.equals(result, 0);
    },
    "when player has 1 station card in hand size position should return 3": async function () {
      const service = createServiceForPlayer(
        "P1A",
        createState({
          playerStateById: {
            P1A: {
              stationCards: [{ place: "handSize" }],
            },
          },
        })
      );

      const result = service.getMaximumHandSize();

      assert.equals(result, 3);
    },
    "when player has 2 station card in hand size position should return 6": async function () {
      const service = createServiceForPlayer(
        "P1A",
        createState({
          playerStateById: {
            P1A: {
              stationCards: [{ place: "handSize" }, { place: "handSize" }],
            },
          },
        })
      );

      const result = service.getMaximumHandSize();

      assert.equals(result, 6);
    },
  },
  "can put down event cards": {
    "when nothing to stop it"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "draw",
              cardsInDeck: [],
            },
            P2A: {
              cardsInDeck: [{}],
            },
          },
        })
      );

      const playerRuleService = testHelper.playerRuleService("P1A");

      assert.equals(playerRuleService.canPutDownEventCards(), true);
    },
  },
  "can NOT put down event cards": {
    "when opponent has destiny decided in play"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "draw",
            },
            P2A: {
              cardsInZone: [{ commonId: DestinyDecided.CommonId }],
            },
          },
        })
      );

      const playerRuleService = testHelper.playerRuleService("P1A");

      assert.equals(playerRuleService.canPutDownEventCards(), false);
    },
  },
  "Should be able to replace a card when starts a new game": {
    "and RECYCLE_AT_START_OF_GAME = true"() {
      const service = new PlayerRuleService({
        gameConfig: GameConfig({
          recycleAtStartOfGame: true,
          maxReplaces: 3,
        }),
        matchService: new MatchService(),
        playerCommanders: { has: () => false },
        queryEvents: { countReplaces: () => 2 },
      });

      assert.equals(service.canReplaceCards(), true);
    },
    "and RECYCLE_AT_START_OF_GAME = false"() {
      const service = new PlayerRuleService({
        gameConfig: GameConfig({
          recycleAtStartOfGame: false,
          maxReplaces: 3,
        }),
        matchService: new MatchService(),
        playerCommanders: { has: () => false },
        queryEvents: { countReplaces: () => 2 },
      });

      assert.equals(service.canReplaceCards(), false);
    },
  },
};

function createMatchService(stubs = {}) {
  return {
    getPlayerState: () => createPlayerState(),
    ...stubs,
  };
}

function createServiceForPlayer(playerId, state) {
  const matchService = new MatchService();
  matchService.setState(state);
  const playerServiceProvider = PlayerServiceProvider();
  const cardFactory = new CardFactory({
    matchService,
    playerServiceProvider,
    playerServiceFactory: fakePlayerServiceFactory.withStubs(),
  });
  const playerStateService = new PlayerStateService({
    playerId,
    matchService,
    cardFactory,
  });
  playerServiceProvider.registerService(
    PlayerServiceProvider.TYPE.state,
    playerId,
    playerServiceProvider
  );
  const canThePlayer = { useThisDurationCard() {} };
  return new PlayerRuleService({ playerStateService, canThePlayer });
}

function createPlayerState(options = {}) {
  return defaults(options, {
    phase: "wait",
    cardsOnHand: [],
    cardsInZone: [],
    cardsInOpponentZone: [],
    stationCards: [],
    discardedCards: [],
    events: [],
    requirements: [],
  });
}

function stationCard(id, place) {
  return {
    place,
    flipped: false,
    card: { id },
  };
}
