const Priority = require("../../../../ai/cardCapabilities/repair/RepairCardPriority.js");

test("should prioritize paralyzed cards over damaged cards", () => {
    const cards = [
        { id: "C1A", damage: 1, paralyzed: false },
        { id: "C2A", damage: 0, paralyzed: true },
    ];

    const priority = Priority();

    expect(priority(cards)).toBe("C2A");
});
