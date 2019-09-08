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

function createDecider(stubs = {}) {
    return ActionPhaseDecider({
        matchController: FakeMatchController({}, { stub: jest.fn() }),
        playerStateService: fakePlayerStateServiceFactory.withStubs(),
        ...stubs
    });
}
