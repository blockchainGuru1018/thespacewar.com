/**
 * @jest-environment node
 */
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
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

    it('should proceed to next phase', async () => {
        const { matchController } = await setupFromState({ turn: 1, phase: 'attack' });
        expect(matchController.emit).toBeCalledWith('nextPhase', { currentPhase: PHASES.attack });
    });
});
