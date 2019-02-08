const {
    testCase,
    assert
} = require('bocha');
const BaseCard = require('../../../shared/card/BaseCard.js');
const NewHope = require('../../../shared/card/NewHope.js');

module.exports = testCase('Match', {
    'misc:': {
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
        },
        'when card cannot move same turn that was put down but has attack boost of 1': {
            async setUp() {
                this.card = new BaseCard({
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: {
                        getAttackBoostForCard: card => {
                            if (card.id === 'C1A') return 1;
                            return 0;
                        }
                    }
                });
            },
            'card should have attack of 2'() {
                assert.equals(this.card.attack, 2);
            }
        }
    },
    'New hope:': {
        'New Hope should be able to move on turn when put down': async function () {
            this.card = new NewHope({
                card: { id: 'C1A', attack: 1 },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: {
                    getMovesOnTurn: () => [],
                    getTurnWhenCardWasPutDown: () => 1
                },
                playerStateService: {
                    getPhase: () => 'attack'
                }
            });

            assert(this.card.canMove());
        }
    }
});
