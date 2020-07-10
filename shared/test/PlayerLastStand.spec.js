const PlayerLastStand = require("../match/PlayerLastStand.js");

describe("Can enter last stand", () => {
  test("When have a card that can be used to counter and all station cards are flipped", () => {
    const playerLastStand = createPLayerLastStand();
    expect(playerLastStand.canStart()).toBe(true);
  });
});

describe("Can NOT enter last stand", () => {
  test("When player is a Bot", () => {
    const playerLastStand = createPLayerLastStand({ isBot: () => true });
    expect(playerLastStand.canStart()).toBe(false);
  });
});

function createPLayerLastStand({ isBot = () => false } = {}) {
  return PlayerLastStand({
    playerId: "",
    matchService: {},
    playerTurnControl: {},
    opponentTurnControl: {},
    playerStateService: {
      getUnflippedStationCardsCount: () => 0,
      getMatchingPlayableBehaviourCards: () => [{}],
      isBot,
    },

    queryPlayerRequirements: {
      getFirstMatchingRequirement: () => null,
    },
  });
}
