/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const { createMatchController, BotId, PlayerId } = require('./botTestHelpers.js');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const ActionPhaseDecider = require('../../ai/ActionPhaseDecider.js');

test('When only card left is EVENT card should NOT put down card', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [{ id: 'C1A', cost: 0, type: 'event' }]
        }),
    });

    decider.decide();

    expect(matchController.emit).not.toBeCalledWith('putDownCard', { cardId: 'C1A', location: 'zone' });
});

test('When has 1 card that costs too much to play, should put down as station card in SOME station row', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [{ id: 'C1A', cost: 1, type: 'event' }],
            getActionPointsForPlayer: () => 0
        }),
        playerRuleService: {
            canPutDownMoreStationCardsThisTurn: () => true
        },
        decideRowForStationCard: () => 'action'
    });

    decider.decide();

    expect(matchController.emit).toBeCalledWith('putDownCard', { cardId: 'C1A', location: 'station-action' });
});

test('When has ALREADY placed station card and has 1 card that costs too much to play, should NOT place another station card', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [{ id: 'C1A', cost: 1, type: 'event' }],
            getActionPointsForPlayer: () => 0
        }),
        playerRuleService: {
            canPutDownMoreStationCardsThisTurn: () => false
        }
    });

    decider.decide();

    expect(matchController.emit).not.toBeCalledWith('putDownCard', expect.any(Object));
});

function createDecider(stubs = {}) {
    return ActionPhaseDecider({
        matchController: FakeMatchController({}, { stub: jest.fn() }),
        playerStateService: fakePlayerStateServiceFactory.withStubs(),
        playerRuleService: {
            canPutDownMoreStationCardsThisTurn() {}
        },
        decideRowForStationCard: () => '',
        ...stubs
    });
}
