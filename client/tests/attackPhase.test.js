const PlayerCardInPlay = require('../match/card/PlayerCardInPlay.js');
const createState = require('../../shared/test/fakeFactories/createState.js');
const TestHelper = require('../../shared/test/fakeFactories/TestHelper.js');
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');

describe('when have had missile in home zone for 1 turn', () => {
    let playerCardInPlay;

    beforeEach(async () => {
        playerCardInPlay = createPlayerCardInPlay('P1A', 'C1A', createClientState(), createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'missile', attack: 1 }],
                    events: [PutDownCardEvent.forTest({ location: 'zone', turn: 1, cardId: 'C1A' })]
                }
            }
        }));
    });

    test('should be able to attack', async () => {
        expect(playerCardInPlay.canAttack()).toBeTruthy();
    });
});

describe('when card cannot attack', () => {
    let playerCardInPlay;

    beforeEach(async () => {
        playerCardInPlay = PlayerCardInPlay({
            card: {
                canAttack: () => false,
            },
            attackerSelected: false,
            canThePlayer: {
                attackCards: () => true
            }
        });
    });

    test('should NOT be able to attack', async () => {
        expect(playerCardInPlay.canAttack()).toBeFalsy();
    });
});

function createClientState(clientState = {}) {
    return Object.assign({
        attackerCardId: null
    }, clientState);
}

function createPlayerCardInPlay(playerId, cardId, clientState, state) {
    const testHelper = TestHelper(state);
    const playerStateService = testHelper.playerStateService(playerId);
    const cardData = playerStateService.findCardFromAnySource(cardId);
    const card = playerStateService.createBehaviourCard(cardData);
    const opponentId = testHelper.matchService().getOpponentId(playerId);
    return PlayerCardInPlay({
        card,
        attackerSelected: !!clientState.attackerCardId,
        canThePlayer: testHelper.canThePlayer(playerId),
        opponentStateService: testHelper.playerStateService(opponentId)
    });
}
