/**
 * @jest-environment node
 */
const { PHASES } = require('../../../shared/phases.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');

describe('Being in the attack phase', () => {
    it('should proceed to next phase', async () => {
        const { matchController } = await setupFromState({ turn: 1, phase: 'attack' });
        expect(matchController.emit).toBeCalledWith('nextPhase', { currentPhase: PHASES.attack });
    });
});
