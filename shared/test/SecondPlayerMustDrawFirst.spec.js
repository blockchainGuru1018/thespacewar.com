const PlayerRuleService = require("../match/PlayerRuleService.js");
const MatchMode = require("../match/MatchMode.js");

describe("Second Player must draw first before put down station cards", () => {
  it("When are player 2 can NOT place station cards if not draw a card first", () => {
    const playerRuleService = new PlayerRuleService({
      matchService: {
        isGameOn: () => false,
      },
      playerStateService: {
        isFirstPlayer: () => false,
        getStationCardCount: () => 0,
        getCardsOnHandCount: () => 5,
      },
      gameConfig: {
        amountOfCardsInStartHand: () => 5,
      },
    });
    expect(playerRuleService.canPutDownStationCards()).toBe(false);
  });
  it("When are player 2 can place station cards because drew a card first", () => {
    const playerRuleService = new PlayerRuleService({
      matchService: {
        isGameOn: () => false,
        mode: () => MatchMode.selectStationCards,
      },
      playerStateService: {
        isFirstPlayer: () => false,
        getStationCardCount: () => 1,
        getCardsOnHandCount: () => 5,
        allowedStartingStationCardCount: () => 3,
        getUnflippedStationCardsCount: () => 1,
      },
      gameConfig: {
        amountOfCardsInStartHand: () => 5,
      },
      playerCommanders: { has: () => false },
    });
    expect(playerRuleService.canPutDownStationCards()).toBe(true);
  });
});
