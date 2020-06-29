/**
 * @jest-environment node
 */
const ShouldPlayGoodKarma = require('../../../ai/cardRules/ShouldPlayGoodKarma.js');
const GoodKarma = require("../../../../shared/card/GoodKarma.js");

test('when has NO good karma in play should be TRUE', () => {
    const rule = ShouldPlayGoodKarma({
        playerStateService: {
            getMatchingBehaviourCards: () => []
        }
    });

    expect(rule({ commonId: GoodKarma.CommonId })).toBe(true);
});

test('when has good karma already in play should be FALSE', () => {
    const goodKarma = { commonId: GoodKarma.CommonId };
    const rule = ShouldPlayGoodKarma({
        playerStateService: {
            getMatchingBehaviourCards: matcher => matcher(goodKarma) ? [goodKarma] : []
        }
    });

    expect(rule({ commonId: GoodKarma.CommonId })).toBe(false);
});
