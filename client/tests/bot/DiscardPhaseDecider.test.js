/**
 * @jest-environment node
 */
const { createMatchController, BotId, PlayerId } = require('./botTestHelpers.js');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const DiscardPhaseDecider = require('../../ai/DiscardPhaseDecider.js');

test('when must discard a card should use the "decideCardToDiscard" function', () => {
    const decideCardToDiscard = jest.fn();
    const decider = createDecider({
        playerDiscardPhase: { canLeavePhase: () => false },
        decideCardToDiscard
    });

    decider.decide();

    expect(decideCardToDiscard).toBeCalledTimes(1);
});

test('should shepard card decided to be discarded to a discardCard event through the matchController', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        playerDiscardPhase: { canLeavePhase: () => false },
        decideCardToDiscard: () => 'C1A',
        matchController
    });

    decider.decide();

    expect(matchController.emit).toBeCalledWith('discardCard', 'C1A');
});

function createDecider(stubs = {}) {
    return DiscardPhaseDecider({
        matchController: FakeMatchController({}, { stub: jest.fn() }),
        playerStateService: fakePlayerStateServiceFactory.withStubs(),
        ...stubs
    });
}
