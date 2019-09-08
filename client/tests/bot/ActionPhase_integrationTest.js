/**
 * @jest-environment node
 */
const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const { PHASES } = require('../../../shared/phases.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');
const { unflippedStationCard } = require('../../testUtils/factories.js');

describe('Being in the action phase', () => {
    it('playing a card', async () => {
        const { matchController } = await setupFromState({
            turn: 1,
            phase: 'action',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C1A', cost: 0, type: 'spaceShip' }),
            ]
        });

        expect(matchController.emit).toBeCalledWith('putDownCard', { location: 'zone', cardId: 'C1A' });
    });

    it('cannot play a card, should NOT try to play a card', async () => {
        const { matchController } = await setupFromState({
            turn: 1,
            phase: 'action',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C1A', cost: 1 }),
            ]
        });

        expect(matchController.emit).not.toBeCalledWith('putDownCard');
    });

    it('cannot play a card, should proceed to next phase', async () => {
        const { matchController } = await setupFromState({
            turn: 1,
            phase: 'action',
            stationCards: [
                unflippedStationCard('S1A', 'draw')
            ],
            cardsOnHand: [
                createCard({ id: 'C1A', cost: 1 }),
            ]
        });

        expect(matchController.emit).toBeCalledWith('nextPhase', { currentPhase: PHASES.action });
    });
});
