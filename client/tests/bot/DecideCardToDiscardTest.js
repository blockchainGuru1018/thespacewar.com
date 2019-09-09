/**
 * @jest-environment node
 */
const { createMatchController, BotId, PlayerId } = require('./botTestHelpers.js');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const DecideCardToDiscard = require('../../ai/DecideCardToDiscard.js');

test('should chose event card over spaceShip', () => {
    const decider = createDecider({
        playerStateService: {
            getCardsOnHand: () => [{ id: 'C1A', type: 'spaceShip', cost: 0 }, { id: 'C2A', type: 'event', cost: 0 }]
        }
    });

    const cardToDiscard = decider();

    expect(cardToDiscard).toBe('C2A');
});

test('should chose spaceShip if it is the only card left', () => {
    const decider = createDecider({
        playerStateService: {
            getCardsOnHand: () => [{ id: 'C1A', type: 'spaceShip', cost: 0 }]
        }
    });

    const cardToDiscard = decider();

    expect(cardToDiscard).toBe('C1A');
});

test('if only has spaceShips, should chose cheapest spaceShip', () => {
    const decider = createDecider({
        playerStateService: {
            getCardsOnHand: () => [{ id: 'C1A', type: 'spaceShip', cost: 2 }, { id: 'C2A', type: 'spaceShip', cost: 1 }]
        }
    });

    const cardToDiscard = decider();

    expect(cardToDiscard).toBe('C2A');
});

test('if only has event cards, should chose cheapest event card ', () => {
    const decider = createDecider({
        playerStateService: {
            getCardsOnHand: () => [{ id: 'C1A', type: 'event', cost: 2 }, { id: 'C2A', type: 'event', cost: 1 }]
        }
    });

    const cardToDiscard = decider();

    expect(cardToDiscard).toBe('C2A');
});

test('if has a duration card and a spaceShip should discard duration card', () => {
    const decider = createDecider({
        playerStateService: {
            getCardsOnHand: () => [{ id: 'C1A', type: 'spaceShip', cost: 0 }, { id: 'C2A', type: 'duration', cost: 0 }]
        }
    });

    const cardToDiscard = decider();

    expect(cardToDiscard).toBe('C2A');
});

function createDecider(stubs = {}) {
    return DecideCardToDiscard({ ...stubs });
}
