const {
    testCase,
    assert,
    stub,
    sinon,
    defaults
} = require('bocha');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');
const PutDownMissilesLaunchedTests = require('../../match/card/putDown/PutDownMissilesLaunched.js');

module.exports = testCase('//PutDownMissilesLaunched', {
    'should add find card requirement with all missile cards from the draw pile and discard pile respectively': function () {
        const playerRequirementService = {
            addFindCardRequirement: stub()
        };
        const playerStateService = fakePlayerStateServiceFactory.withStubs({
            getCardsInDeck: () => [
                { id: 'C1A', type: 'missile' },
                { id: 'C2A', type: 'spaceShip' },
                { id: 'C3A', type: 'defense' },
                { id: 'C4A', type: 'duration' },
                { id: 'C5A', type: 'event' }
            ],
            getDiscardedCards: () => [
                { id: 'C6A', type: 'event' },
                { id: 'C8A', type: 'defense' },
                { id: 'C9A', type: 'duration' },
                { id: 'C7A', type: 'spaceShip' },
                { id: 'C10A', type: 'missile' }
            ]
        });
        const putDownMissilesLaunched = PutDownMissilesLaunchedTests({
            playerServiceProvider: FakePlayerServiceProvider({
                playerRequirementService,
                playerStateService
            })
        });
        putDownMissilesLaunched.forPlayer('P1A', { commonId: '17' });

        assert.calledWith(playerRequirementService.addFindCardRequirement, {
            count: 2,
            cardCommonId: '17',
            cardGroups: [
                { source: 'deck', cards: [sinon.match({ id: 'C1A' })] },
                { source: 'discardPile', cards: [sinon.match({ id: 'C10A' })] }
            ]
        });
    },
    'should put card in home zone as event card': function () {
        const playerStateService = fakePlayerStateServiceFactory.withStubs({
            putDownEventCardInZone: stub()
        });
        const putDownMissilesLaunched = PutDownMissilesLaunchedTests({
            playerServiceProvider: FakePlayerServiceProvider({
                playerStateService
            })
        });
        putDownMissilesLaunched.forPlayer('P1A', { commonId: '17' });

        assert.calledWith(playerStateService.putDownEventCardInZone, sinon.match({ commonId: '17' }));
    }
});

function FakePlayerServiceProvider(options) {
    const { playerId, playerRequirementService, playerStateService } = defaults(options, {
        playerId: 'P1A',
        playerStateService: fakePlayerStateServiceFactory.withStubs(),
        playerRequirementService: { addFindCardRequirement: () => {} }
    });
    return {
        getRequirementServiceById: id => id === playerId ? playerRequirementService : null,
        getStateServiceById: id => id === playerId ? playerStateService : null
    }
}