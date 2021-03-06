const canThePlayerFactory = require("../fakeFactories/canThePlayerFactory.js");
const queryEventsFactory = require("../fakeFactories/queryEventsFactory.js");
const playerStateServiceFactory = require("../fakeFactories/playerStateServiceFactory.js");
const playerRuleServiceFactory = require("../fakeFactories/playerRuleServiceFactory.js");

const { defaults } = require("./bocha-jest/bocha");

module.exports = {
  createCard,
};

function createCard(Constructor, options = {}) {
  defaults(options, {
    canThePlayer: canThePlayerFactory.withStubs(),
    queryEvents: queryEventsFactory.withStubs(),
    playerStateService: playerStateServiceFactory.withStubs(),
    cardEffect: {
      attackBoostForCardType: () => 0,
      cardTypeCanMoveOnTurnPutDown: () => false,
      costCardIncrement: () => 0,
      attackBoostForCollision: () => 0,
      ...(options.cardEffect || {}),
    },
    playerRuleService: playerRuleServiceFactory.withStubs(),
    turnControl: { playerHasControlOfOpponentsTurn: () => false },
    opponentStateService: { getMatchingBehaviourCards: (matcher) => [] },
  });
  return new Constructor(options);
}
