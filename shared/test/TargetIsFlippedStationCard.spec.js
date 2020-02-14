const TargetIsFlippedStationCard = require('../match/requirement/conditions/TargetIsFlippedStationCard.js');

test('when target is flipped station card should return true', () => {
    const condition = createCondition();
    const targetOpponentCard = { isFlippedStationCard: () => true };

    const result = condition.check({ targetOpponentCard });

    expect(result).toBe(true);
});

test('when target is NOT flipped station card should return false', () => {
    const condition = createCondition();
    const targetOpponentCard = { isFlippedStationCard: () => false };

    const result = condition.check({ targetOpponentCard });

    expect(result).toBe(false);
});

function createCondition(options = {}) {
    return TargetIsFlippedStationCard({
        opponentCardFactory: {
            fromId: () => ({})
        },
        ...options
    });
}
