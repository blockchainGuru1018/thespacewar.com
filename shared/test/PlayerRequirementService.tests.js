const bocha = require('bocha');
const assert = bocha.assert;
const createState = require('./fakeFactories/createState.js');
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const CardFactory = require('../card/CardFactory.js');
const PlayerStateService = require('../match/PlayerStateService.js');
const MatchService = require('../match/MatchService.js');
const PlayerServiceProvider = require('../match/PlayerServiceProvider.js');
const PlayerRequirementService = require('../match/requirement/PlayerRequirementService.js');
const FakeDeck = require("../../server/test/testUtils/FakeDeck.js");
const TestHelper = require('./fakeFactories/TestHelper.js');

module.exports = bocha.testCase('PlayerRequirementService', {
    'when player has 0 cards on hand and adds a discard card requirement it should NOT be added': function () {
        const state = createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: []
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A');

        service.addDiscardCardRequirement({ count: 1 });

        assert.equals(service.getRequirements(), []);
    },
    'when player has 2 cards on hand and adds 3 discard card requirements of count 1 should only add the first 2': function () {
        const state = createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })]
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A');

        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });

        assert.equals(service.getRequirements(), [
            { type: 'discardCard', count: 1 },
            { type: 'discardCard', count: 1 }
        ]);
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

        assert.equals(service.getRequirements(), [
            { type: 'drawCard', count: 1 },
            { type: 'drawCard', count: 1 }
        ]);
    },
    'when player has 2 station cards and adds 3 damage own station card requirements of count 1 should only add the first 2': function () {
        const state = createState({
            playerStateById: {
                'P2A': {
                    stationCards: [{ id: 'S1A', place: 'draw' }, { id: 'S2A', place: 'draw' }]
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A', 'P2A');

        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });

        assert.equals(service.getRequirements(), [
            { type: 'damageStationCard', count: 1 },
            { type: 'damageStationCard', count: 1 }
        ]);
    },
    'find card:': {
        'should create findCard requirement with only cardGroups that has any cards': function () {
            const service = createServiceForPlayer(createState(), 'P1A', 'P2A');

            service.addFindCardRequirement({
                count: 1,
                cardGroups: [
                    { source: 'deck', cards: [{}] },
                    { source: 'discardPile', cards: [] }
                ],
                cardCommonId: '1'
            });

            assert.equals(service.getRequirements(), [{
                type: 'findCard', count: 1, cardGroups: [
                    { source: 'deck', cards: [{}] }
                ],
                cardCommonId: '1'
            }]);
        },
        'should count is 2 but has only 1 card should add requirement with count of 1': function () {
            const service = createServiceForPlayer(createState(), 'P1A', 'P2A');

            service.addFindCardRequirement({
                count: 2,
                cardGroups: [{ source: 'deck', cards: [{}] }],
                cardCommonId: '1'
            });

            let requirements = service.getRequirements();
            assert.equals(requirements.length, 1);
            assert.match(requirements[0], {
                type: 'findCard',
                count: 1
            });
        }
    }
});

function createServiceForPlayer(state, playerId = 'P1A', opponentId = 'P2A') {
    const matchService = new MatchService();
    matchService.setState(state);
    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new CardFactory({ matchService, playerServiceProvider });
    const playerStateService = new PlayerStateService({ playerId, matchService, cardFactory });
    const opponentStateService = new PlayerStateService({ playerId: opponentId, matchService, cardFactory });
    const playerRequirementService = new PlayerRequirementService({ playerStateService, opponentStateService });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerStateService);
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.requirement, playerId, playerRequirementService);

    return playerRequirementService;
}
