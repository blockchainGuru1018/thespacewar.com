const LuckPlayer = require("../../../ai/cardPlayers/LuckPlayer.js");
const Luck = require("../../../../shared/card/Luck.js");

test("when card has common ID of Luck should accept card", () => {
  const player = LuckPlayer({});
  expect(player.forCard({ commonId: Luck.CommonId })).toBe(true);
});

test("should play Luck with action to draw cards", () => {
  const matchController = { emit: jest.fn() };
  const player = LuckPlayer({ matchController });
  player.play({ id: "C1A" });
  expect(matchController.emit).toBeCalledWith("putDownCard", {
    cardId: "C1A",
    location: "zone",
    choice: "draw",
  });
});
