const OverCapacity = require('../card/OverCapacity.js');

describe('can only look at handSize station row cards in action phase', () => {
    it('is action phase', () => {
        const card = new OverCapacity({
            playerPhase: {
                isAction: () => true
            }
        });
        expect(card.canLookAtHandSizeStationRow()).toBe(true);
    });
    it('is NOT action phase', () => {
        const card = new OverCapacity({
            playerPhase: {
                isAction: () => false
            }
        });
        expect(card.canLookAtHandSizeStationRow()).toBe(false);
    });
});
