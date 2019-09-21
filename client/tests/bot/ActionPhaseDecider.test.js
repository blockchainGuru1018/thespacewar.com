/**
 * @jest-environment node
 */
const { createCard } = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const { createMatchController, BotId, PlayerId } = require('./botTestHelpers.js');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const ActionPhaseDecider = require('../../ai/ActionPhaseDecider.js');

test('When only card left is EVENT card should NOT put down card', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [createCard({ id: 'C1A', cost: 0, type: 'event' })]
        }),
    });

    decider.decide();

    expect(matchController.emit).not.toBeCalledWith('putDownCard', { cardId: 'C1A', location: 'zone' });
});

test('When can NOT place station card, should NOT place station card', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [createCard({ id: 'C1A', cost: 1, type: 'event' })],
            getActionPointsForPlayer: () => 0
        }),
        playerRuleService: {
            canPutDownStationCards: () => true,
            canPutDownMoreStationCardsThisTurn: () => false
        }
    });

    decider.decide();

    expect(matchController.emit).not.toBeCalledWith('putDownCard', expect.any(Object));
});

test('When can place station cards, should place _certain_ card in _some_ place', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [createCard()]
        }),
        playerRuleService: {
            canPutDownStationCards: () => true,
            canPutDownMoreStationCardsThisTurn: () => true
        },
        decideRowForStationCard: () => '_some_place_',
        decideCardToPlaceAsStationCard: () => '_certain_card_'
    });

    decider.decide();

    expect(matchController.emit).toBeCalledWith('putDownCard', {
        cardId: '_certain_card_',
        location: 'station-_some_place_'
    });
});

test('When can NOT place station cards in general but can place station cards this turn, should NOT place any station card', () => {
    const matchController = createMatchController();
    const decider = createDecider({
        matchController,
        playerStateService: fakePlayerStateServiceFactory.withStubs({
            getCardsOnHand: () => [createCard()]
        }),
        playerRuleService: {
            canPutDownStationCards: () => false,
            canPutDownMoreStationCardsThisTurn: () => true
        },
        decideRowForStationCard: () => '_some_place_',
        decideCardToPlaceAsStationCard: () => '_certain_card_'
    });

    decider.decide();

    expect(matchController.emit).not.toBeCalledWith('putDownCard', expect.any(Object));
});

function createDecider(stubs = {}) {
    return ActionPhaseDecider({
        matchController: FakeMatchController({}, { stub: jest.fn() }),
        playerStateService: fakePlayerStateServiceFactory.withStubs(),
        playerRuleService: {
            canPutDownMoreStationCardsThisTurn() {},
            canPutDownStationCards() {}
        },
        decideRowForStationCard: () => '',
        decideCardToPlaceAsStationCard: () => '',
        ...stubs
    });
}