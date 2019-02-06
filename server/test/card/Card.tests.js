const {
    testCase,
    assert
} = require('bocha');
const BaseCard = require('../../../shared/card/BaseCard.js');

module.exports = testCase('Match', {
    'when card has 1 attack but has attack boost of 1': {
        async setUp() {
            this.card = new BaseCard({
                card: { id: 'C1A', attack: 1 },
                playerStateService: {
                    getAttackBoostForCard: card => {
                        if (card.id === 'C1A') return 1;
                        return 0;
                    }
                },

            });
        },
        'card should have attack of 2'() {
            assert.equals(this.card.attack, 2);
        }
    }
});
