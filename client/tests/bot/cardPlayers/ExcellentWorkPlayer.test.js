const ExcellentWorkPlayer = require("../../../ai/cardPlayers/ExcellentWorkPlayer.js");
const ExcellentWork = require("../../../../shared/card/ExcellentWork.js");

test("when card has common ID of Excellent Work should accept card", () => {
  const player = createPlayer({});
  expect(player.forCard({ commonId: ExcellentWork.CommonId })).toBe(true);
});

test("should play Excellent Work to station row decided by decider", () => {
  const matchController = { emit: jest.fn() };
  const player = createPlayer({
    matchController,
    decideRowForStationCard: () => "action",
  });

  player.play({ id: "C1A", cost: 2 });

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardCost: 2,
    cardId: "C1A",
    location: "station-action",
    choice: "putDownAsExtraStationCard",
  });
});

test('when can NOT put down station card should play Excellent Work with choice "draw"', () => {
  const matchController = { emit: jest.fn() };
  const player = createPlayer({
    matchController,
    decideRowForStationCard: () => "action",
    playerRuleService: {
      hasReachedMaximumStationCardCapacity: () => true,
    },
  });

  player.play({ id: "C1A", cost: 2 });

  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardCost: 2,
    cardId: "C1A",
    location: "zone",
    choice: "draw",
  });
});

function createPlayer(stubs) {
  return ExcellentWorkPlayer({
    playerRuleService: {
      hasReachedMaximumStationCardCapacity() {},
    },
    ...stubs,
  });
}
