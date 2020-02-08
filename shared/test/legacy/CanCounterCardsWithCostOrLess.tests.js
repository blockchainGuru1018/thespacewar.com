const {
    assert,
    refute
} = require('../testUtils/bocha-jest/bocha');
const BaseCard = require('../../card/BaseCard.js');
const CanCounterCardsWithCostOrLess = require('../../card/mixins/CanCounterCardsWithCostOrLess.js');
const {
    createCard
} = require('../testUtils/shared.js');

module.exports = {
    'when card can counter target based on cost but target was drawn AFTER card'() {
        const card = createCard(CanCounterCardsWithCostOrLess(0, BaseCard), {
            card: { id: 'C1A' },
            queryEvents: {
                playerCardWasInHandAfterOpponentCardWasPlayed: (card, target) => card.id === 'C1A' && target.id === 'C2A'
            },
        });
        refute(card.canCounterCard({ id: 'C2A', cost: 0 }));
    },
    'when card can counter target based on cost and target was NOT drawn after card'() {
        const card = createCard(CanCounterCardsWithCostOrLess(0, BaseCard), {
            card: { id: 'C1A' },
            queryEvents: {
                playerCardWasInHandAfterOpponentCardWasPlayed: () => false
            },
        });
        assert(card.canCounterCard({ id: 'C2A', cost: 0 }));
    },
    'can counter cards costing 2 or less': {
        'can counter card costing 2'() {
            const card = createCard(CanCounterCardsWithCostOrLess(2, BaseCard), {});
            assert(card.canCounterCard({ cost: 2 }));
        },
        'can NOT counter card costing 3'() {
            const card = createCard(CanCounterCardsWithCostOrLess(2, BaseCard), {});
            refute(card.canCounterCard({ cost: 3 }));
        },
        'can counter card costing 0'() {
            const card = createCard(CanCounterCardsWithCostOrLess(2, BaseCard), {});
            assert(card.canCounterCard({ cost: 0 }));
        }
    },
};
