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
    // can NOT target space ship for sacrifice
    // should NOT be able to be sacrificed at the same turn as played
    // should be able to be sacrificed the turn after being played
    // should NOT be able to be sacrificed if has already attacked this turn
    // should ONLY be able to be sacrificed in the attack phase
});
