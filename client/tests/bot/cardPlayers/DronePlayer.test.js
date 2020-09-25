const DronePlayer = require("../../../ai/cardPlayers/DronePlayer.js");
const Drone = require("../../../../shared/card/Drone.js");

test("When has Drone should always play it", () => {
  const player = createPlayer({});
  expect(player.forCard({ commonId: Drone.CommonId })).toBe(true);
});

function createPlayer(stubs) {
  return DronePlayer({
    ...stubs,
  });
}
