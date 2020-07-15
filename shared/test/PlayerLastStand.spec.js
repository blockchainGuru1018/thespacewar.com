const PlayerLastStand = require("../match/PlayerLastStand.js");

describe("Can enter last stand", () => {
  it("When have a card that can be used to counter and all station cards are flipped", () => {
    const playerLastStand = createPLayerLastStand({
      playableCards: [{ canCounterAttacks: () => true }],
    });
    expect(playerLastStand.canStart()).toBe(true);
  });
  it("When have a card that can be used to counter and all station cards are flipped as a BOT", () => {
    const playerLastStand = createPLayerLastStand({
      isBot: () => true,
      playableCards: [{ canCounterAttacks: () => true }],
    });
    expect(playerLastStand.canStart()).toBe(true);
  });
});

describe("Can NOT enter last stand", () => {
  test("When player is a Bot and has not playable counter cards", () => {
    const playerLastStand = createPLayerLastStand({
      isBot: () => true,
    });
    expect(playerLastStand.canStart()).toBe(false);
  });
});

function createPLayerLastStand({
  isBot = () => false,
  playableCards = [],
} = {}) {
  return PlayerLastStand({
    playerId: "",
    matchService: {},
    playerTurnControl: {},
    opponentTurnControl: {},
    playerStateService: {
      getUnflippedStationCardsCount: () => 0,
      getMatchingPlayableBehaviourCards: () => [...playableCards],
      isBot,
    },

    queryPlayerRequirements: {
      getFirstMatchingRequirement: () => null,
    },
  });
}
