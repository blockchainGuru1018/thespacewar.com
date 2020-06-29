const DestroyDuration = require('../card/DestroyDuration.js');

describe('Destroy Duration', () => {
    it('can target duration card for sacrifice', () => {
        const card = new DestroyDuration({
            playerId: 'P1A'
        });
        const otherCard = {
            canBeTargeted: () => true,
            type: 'duration',
            playerId: 'P2A'
        };
        expect(card.canTargetCardForSacrifice(otherCard)).toBe(true);
    });
});
