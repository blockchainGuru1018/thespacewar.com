const bocha = require('bocha');
const assert = bocha.assert;
const createState = require('./fakeFactories/createState.js');
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const TestHelper = require('./fakeFactories/TestHelper.js');

module.exports = bocha.testCase('PlayerRequirementService', {
    'when player has 0 cards on hand and adds a discard card requirement it should NOT be added': function () {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: []
                }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addDiscardCardRequirement({ count: 1 });

        assertRequirementsEquals([], 'P1A', testHelper);
    },
    'when player has 2 cards on hand and adds 3 discard card requirements of count 1 should only add the first 2': function () {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })]
                }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });

        assertRequirementsEquals([
            { type: 'discardCard', count: 1 },
            { type: 'discardCard', count: 1 }
        ], 'P1A', testHelper);
    },
    'when player has 2 cards in deck and opponent has 1 card in deck and adds 3 draw card requirements of count 1 should only add the first 2': function () {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': { cardsInDeck: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })] },
                'P2A': { cardsInDeck: [createCard({ id: 'C3A' })] }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'drawCard', count: 1 });
        service.addCardRequirement({ type: 'drawCard', count: 1 });
        service.addCardRequirement({ type: 'drawCard', count: 1 });

        assertRequirementsEquals([
            { type: 'drawCard', count: 1 },
            { type: 'drawCard', count: 1 }
        ], 'P1A', testHelper);
    },
    'when player has 2 cards in deck and opponent has 2 cards in deck and adds 1 draw card requirements of count 3 should only add a requirement of count 2': function () {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P1A': { cardsInDeck: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })] },
                'P2A': { cardsInDeck: [createCard({ id: 'C3A' }), createCard({ id: 'C4A' })] }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'drawCard', count: 3 });

        assertRequirementsEquals([{ type: 'drawCard', count: 2 }], 'P1A', testHelper);
    },
    'when player has 2 station cards and adds 3 damage own station card requirements of count 1 should only add the first 2': function () {
        const testHelper = TestHelper(createState({
            playerStateById: {
                'P2A': {
                    stationCards: [{ id: 'S1A', place: 'draw' }, { id: 'S2A', place: 'draw' }]
                }
            }
        }));
        const service = testHelper.playerRequirementService('P1A');

        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });

        assertRequirementsEquals([
            { type: 'damageStationCard', count: 1 },
            { type: 'damageStationCard', count: 1 }
        ], 'P1A', testHelper);
    },
    'find card:': {
        'should create findCard requirement with only cardGroups that has any cards': function () {
            const testHelper = TestHelper(createState());
            const service = testHelper.playerRequirementService('P1A');

            service.addFindCardRequirement({
                count: 1,
                cardGroups: [
                    { source: 'deck', cards: [{}] },
                    { source: 'discardPile', cards: [] }
                ],
                cardCommonId: '1'
            });

            assertRequirementsEquals([{
                type: 'findCard', count: 1, cardGroups: [
                    { source: 'deck', cards: [{}] }
                ],
                cardCommonId: '1'
            }], 'P1A', testHelper);
        },
        'should count is 2 but has only 1 card should add requirement with count of 1': function () {
            const testHelper = TestHelper(createState());
            const service = testHelper.playerRequirementService('P1A');
            const queryPlayerRequirements = testHelper.queryPlayerRequirements('P1A');

            service.addFindCardRequirement({
                count: 2,
                cardGroups: [{ source: 'deck', cards: [{}] }],
                cardCommonId: '1'
            });

            const requirements = queryPlayerRequirements.all();
            assert.equals(requirements.length, 1);
            assert.match(requirements[0], {
                type: 'findCard',
                count: 1
            });
        }
    }
});

function assertRequirementsEquals(equalsThis, playerId, testHelper) {
    const queryPlayerRequirements = testHelper.queryPlayerRequirements(playerId);
    assert.equals(queryPlayerRequirements.all(), equalsThis);
}
