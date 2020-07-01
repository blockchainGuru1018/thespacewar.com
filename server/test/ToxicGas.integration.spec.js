const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const createState = require('../../shared/test/fakeFactories/createState.js');
const TestHelper = require('../../shared/test/fakeFactories/TestHelper.js');

describe("damageShieldsOrStationCard requirement", () => {
    it("Should be able to damage a Station Card if there is no Shield cards in opponent home zone", () => {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': { cardsInZone: [createCard({ id: 'C1A' })] },
                'P2A': { cardsInZone: [createCard({ id: 'C3A' })] }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'damageShieldsOrStationCard', count: 1, card: createCard({ id: 'C1A' }) });

        expectRequirementsEquals([
            { type: 'damageStationCard', count: 1 },
        ], 'P1A', testHelper);
    });
    it("Should be able to damage a Shield card instead Station Card if opponent has Shield cards in own home zone", () => {
        const shieldCardType = createCard({ id: 'C4A', stopsStationAttack: () => true } )
        // shieldCardType.stopsStationAttack = () => true;
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': { cardsInZone: [createCard({ id: 'C1A' })] },
                'P2A': { cardsInZone: [shieldCardType, createCard({ id: 'C5A' })] }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'damageShieldsOrStationCard', count: 1, card: createCard({ id: 'C1A' }) });
 
        expectRequirementsEquals([
            { type: 'damageShieldCard', count: 1, cardId: "C1A" },
        ], 'P1A', testHelper);
    });

});


function expectRequirementsEquals(equalsThis, playerId, testHelper) {
    const queryPlayerRequirements = testHelper.queryPlayerRequirements(playerId);
    expect(queryPlayerRequirements.all()).toStrictEqual(equalsThis);
}