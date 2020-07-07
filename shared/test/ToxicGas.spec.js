const ToxicGas = require("../card/ToxicGas.js");
const { createCard } = require("./testUtils/shared.js");
const FakeCardDataAssembler = require("./testUtils/FakeCardDataAssembler.js");

describe("Toxic gas behavior", () => {
    const toxicGas = new createCard(ToxicGas);
    it("should be able to attack shields", () => {
        const someShieldCard = FakeCardDataAssembler.createCard({
            commonId: "21",
            stopsStationAttack: () => true,
        }); // Energy Shield
        expect(toxicGas.canAttackCard(someShieldCard)).toBe(true);
    });
    it("should NOT be able to attack no-shield cards", () => {
        const someCard = FakeCardDataAssembler.createCard({
            commonId: "C1",
            stopsStationAttack: () => false,
        });
        expect(toxicGas.canAttackCard(someCard)).toBe(false);
    });
});
