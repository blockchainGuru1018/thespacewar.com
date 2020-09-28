const Priority = require("../../../../ai/cardCapabilities/AttackBiggestShipPriority.js");

test("should prioritize most powerfull card first", () => {
  const cards = [
    { id: "C1A", attack: 2, defense: 10 },
    { id: "C2A", attack: 3, defense: 2 },
  ];

  const priority = Priority();

  expect(priority(cards)).toBe("C1A");
});
