/**
 * @jest-environment node
 */
const Capability = require('../../ai/PlayCardCapability.js');
const GoodKarma = require("../../../shared/card/GoodKarma.js");

test('when has event card and defense card and only defense card is a playableType, can play card', () => {
    const capability = Capability({
        playerStateService: {
            getCardsOnHand: () => [{ type: 'event', cost: 0 }, { type: 'defense', cost: 0 }],
            getActionPointsForPlayer: () => 0
        },
        playableTypes: ['defense']
    });

    expect(capability.canDoIt()).toBe(true);
});

test('when has playable card and can afford it, can play card', () => {
    const capability = Capability({
        playerStateService: {
            getCardsOnHand: () => [
                { id: 'C1A', type: 'duration', commonId: GoodKarma.CommonId, cost: 2 },
            ],
            getActionPointsForPlayer: () => 2
        },
        playableTypes: [],
        playableCards: [GoodKarma.CommonId]
    });

    expect(capability.canDoIt()).toBe(true);
});

test('when has playable card and can afford it but rule says NO, can NOT play card', () => {
    const capability = Capability({
        playerStateService: {
            getCardsOnHand: () => [
                { id: 'C1A', type: 'duration', commonId: GoodKarma.CommonId, cost: 2 },
            ],
            getActionPointsForPlayer: () => 2
        },
        playableTypes: [],
        playableCards: [GoodKarma.CommonId],
        cardRules: [c => c.commonId !== GoodKarma.CommonId]
    });

    expect(capability.canDoIt()).toBe(false);
});

test('when has spaceShip and defense card and both are a playableType, should play cheapest card', () => {
    const matchController = { emit: jest.fn() };
    const capability = Capability({
        playerStateService: {
            getCardsOnHand: () => [
                { id: 'C1A', type: 'spaceShip', cost: 2 },
                { id: 'C2A', type: 'defense', cost: 1 }
            ],
            getActionPointsForPlayer: () => 2
        },
        playableTypes: ['spaceShip', 'defense'],
        matchController
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith('putDownCard', { cardId: 'C2A', location: 'zone' });
});

test('when has playable duration card, should play card', () => {
    const matchController = { emit: jest.fn() };
    const capability = Capability({
        playerStateService: {
            getCardsOnHand: () => [
                { id: 'C1A', type: 'duration', commonId: 'C1B', cost: 2 },
            ],
            getActionPointsForPlayer: () => 2
        },
        playableTypes: [],
        playableCards: ['C1B'],
        matchController
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith('putDownCard', { cardId: 'C1A', location: 'zone' });
});
