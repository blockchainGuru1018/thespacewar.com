const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const DrawCardEvent = require('../../../shared/event/DrawCardEvent.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');
const { unflippedStationCard } = require('../../testUtils/factories.js');
const {
    assert,
    refute,
} = require('../../testUtils/bocha-jest/bocha-jest.js');

describe('In Draw phase', () => {
    test('When can draw 1 more card should draw a card', async () => {
        const { matchController } = await setupFromState({
            phase: 'draw',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        assert.calledWith(matchController.emit, 'drawCard');
    });

    test('When is not draw phase should NOT draw card', async () => {
        const { matchController } = await setupFromState({
            phase: 'action',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ]
        });

        refute.calledWith(matchController.emit, 'drawCard');
    });

    test('When cannot draw card should NOT draw card', async () => {
        const { matchController } = await setupFromState({
            turn: 1,
            phase: 'draw',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C2A' })
            ],
            events: [
                DrawCardEvent({ turn: 1 })
            ]
        });

        refute.calledWith(matchController.emit, 'drawCard');
    });
});
