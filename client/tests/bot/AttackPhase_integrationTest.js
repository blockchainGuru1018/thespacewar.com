/**
 * @jest-environment node
 */
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const { PHASES } = require('../../../shared/phases.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');

describe('Being in the attack phase', () => {
    it('when has spaceShip that has been in play for 1 turn should move it', async () => {
        const { matchController } = await setupFromState({
            turn: 2,
            phase: 'attack',
            cardsInZone: [{ id: 'C1A', type: 'spaceShip' }],
            events: [PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' })]
        });

        expect(matchController.emit).toBeCalledWith('moveCard', 'C1A');
    });

    describe('when has spaceShip in enemy zone that has been there for 1 turn', () => {
        let matchController;

        beforeEach(async () => {
            const stubs = await setupFromState({
                turn: 3,
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', attack: 1 }],
                opponentStationCards: [
                    unflippedStationCard('S1A')
                ],
                events: [
                    PutDownCardEvent({ cardId: 'C1A', turn: 1, location: 'zone' }),
                    MoveCardEvent({ cardId: 'C1A', turn: 2 })
                ]
            });
            matchController = stubs.matchController;
        });

        it('should attack enemy station', () => {
            expect(matchController.emit).toBeCalledWith('attackStationCard', {
                attackerCardId: 'C1A',
                targetStationCardIds: ['S1A']
            });
        });

        it('should NOT move card', () => {
            expect(matchController.emit).not.toBeCalledWith('moveCard', 'C1A');
        });
    });

    it('should proceed to next phase', async () => {
        const { matchController } = await setupFromState({ turn: 1, phase: 'attack' });
        expect(matchController.emit).toBeCalledWith('nextPhase', { currentPhase: PHASES.attack });
    });
});

function unflippedStationCard(id, place = 'draw') {
    return {
        id,
        place,
        card: { id }
    }
}
