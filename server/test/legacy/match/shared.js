const {
  stub,
  sinon,
  assert,
  refute,
  defaults,
} = require("../../testUtils/bocha-jest/bocha");
const createState = require("../../../../shared/test/fakeFactories/createState.js");
const FakeDeck = require("../../testUtils/FakeDeck.js");
const FakeDeckFactory = require("../../testUtils/FakeDeckFactory.js");
const FakeCardDataAssembler = require("../../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const createDeckFromCards = FakeDeckFactory.createDeckFromCards;
const CardDataAssembler = require("../../../../shared");
const CardInfoRepository = require("../../../../shared/CardInfoRepository.js");
const GameConfig = require("../../../../shared/match/GameConfig.js");
const Match = require("../../../match/Match.js");
const playerStateFactory = require("../../../../shared/match/playerStateFactory.js");

module.exports = {
  bocha: {
    stub,
    sinon,
    assert,
    refute,
    defaults,
  },
  ...{
    FakeDeck,
    FakeDeckFactory,
    FakeCardDataAssembler,
    createCard,
    createDeckFromCards,
    CardInfoRepository,
    Match,
  },
  ...{
    createPlayers,
    Player,
    createPlayer,
    createMatchAndGoToFirstActionPhase,
    createMatchAndGoToSecondActionPhase,
    createMatchAndGoToFirstAttackPhase,
    createMatchAndGoToSecondAttackPhase,
    createMatchAndGoToFirstDiscardPhase,
    discardCardsAsPlayer,
    createMatch,
    FakeConnection,
    FakeConnection2,
    catchError,
    repeat,
    createState,
    createPlayerState,
  },
};

function createPlayers(playerOptions) {
  return [
    createPlayer(playerOptions[0] || {}),
    createPlayer(playerOptions[1] || {}),
  ];
}

function Player(id = "007", connection = FakeConnection2()) {
  return createPlayer({ id, connection });
}

function createPlayer(options = {}) {
  // TODO Make "Player" be createPlayer and this be something else
  return defaults(options, {
    id: "007",
    name: "James",
    connection: FakeConnection2(),
  });
}

function createMatchAndGoToFirstActionPhase(deps = {}) {
  const match = createMatch(deps);
  match.start();
  match.start();
  match.nextPhase(match.players[0].id);
  match.drawCard(match.players[0].id);
  match.nextPhase(match.players[0].id);
  return match;
}

function createMatchAndGoToFirstDiscardPhase(deps = {}) {
  const match = createMatchAndGoToFirstActionPhase(deps);
  match.nextPhase(match.players[0].id);
  return match;
}

function createMatchAndGoToFirstAttackPhase(deps = {}) {
  const match = createMatch(deps);
  match.start();
  match.start();

  const [firstPlayer, _] = match.players;
  match.nextPhase(firstPlayer.id);
  match.nextPhase(firstPlayer.id);
  match.nextPhase(firstPlayer.id);

  let firstPlayerCards = null;
  firstPlayer.connection.on("stateChanged", (state) => {
    firstPlayerCards = state.cardsOnHand;
  });
  match.start();
  const cardsToDiscard = firstPlayerCards.slice(0, 5).map((card) => card.id);
  discardCardsAsPlayer(cardsToDiscard, firstPlayer.id, match);

  match.nextPhase(firstPlayer.id);

  return match;
}

function createMatchAndGoToSecondActionPhase(deps = {}) {
  const match = createMatchAndGoToFirstAttackPhase(deps);
  match.nextPhase(match.players[0].id);

  match.nextPhase(match.players[1].id);
  return match;
}

function createMatchAndGoToSecondAttackPhase(deps = {}) {
  const match = createMatchAndGoToSecondActionPhase(deps);
  match.nextPhase(match.players[1].id);

  const [_, secondPlayer] = match.players;
  let secondPlayerCards = null;
  secondPlayer.connection.on("stateChanged", (state) => {
    secondPlayerCards = state.cardsOnHand;
  });
  match.start();
  const cardsToDiscard = secondPlayerCards.slice(0, 5).map((card) => card.id);
  discardCardsAsPlayer(cardsToDiscard, secondPlayer.id, match);

  match.nextPhase(match.players[1].id);

  return match;
}

function discardCardsAsPlayer(cardIds, playerId, match) {
  for (let i = 0; i < cardIds.length; i++) {
    match.discardCard(playerId, cardIds[i]);
  }
}

function createMatch(deps = {}, testCardData = []) {
  if (deps.players && deps.players.length === 1) {
    deps.players.push(Player("P2A"));
  }
  const rawCardDataRepository = { get: () => testCardData };
  const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
  defaults(deps, {
    gameConfig: GameConfig({ amountOfCardsInStartHand: 7 }),
    cardInfoRepository: CardInfoRepository({ cardDataAssembler }),
    rawCardDataRepository,
    players: [createPlayer("P1A"), createPlayer("P2A")],
    logger: {
      log: (...args) => {
        console.log(
          ...args.map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 4) : a
          )
        );
      },
    },
    registerLogGame: () => Promise.resolve(),
  });
  return Match(deps);
}

function FakeConnection(listenerByActionName) {
  // TODO Migrate this to the new and then rename the new one to this name
  return {
    emit(_, { action, value }) {
      if (listenerByActionName[action]) {
        listenerByActionName[action](value);
      }
    },
  };
}

function FakeConnection2(namesOfActionsToStub = []) {
  const stubMap = {};
  for (const name of namesOfActionsToStub) {
    stubMap[name] = stub();
  }
  const listenersByActionName = {};

  return {
    emit(_, { action, value }) {
      if (stubMap[action]) {
        stubMap[action](value);
      }
      if (listenersByActionName[action]) {
        listenersByActionName[action].forEach((listener) => listener(value));
      }
    },
    on(action, callback) {
      listenersByActionName[action] = listenersByActionName[action] || [];
      listenersByActionName[action].push(callback);
    },
    ...stubMap,
  };
}

function catchError(callback) {
  try {
    callback();
  } catch (error) {
    return error;
  }
}

function repeat(count, callback) {
  for (let i = 0; i < count; i++) {
    callback();
  }
}

function createPlayerState(options = {}) {
  return defaults(options, playerStateFactory.empty());
}
