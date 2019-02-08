const {
    testCase,
    assert,
    refute
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
        'when card was put down this turn': {
            async setUp() {
                this.card = new BaseCard({
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: {
                        getPhase: () => 'attack',
                        cardCanMoveOnTurnWhenPutDown: () => false
                    },
                    matchService: {
                        getTurn: () => 1
                    },
                    queryEvents: {
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1
                    }
                });
            },
            'should NOT be able to move'() {
                refute(this.card.canMove());
            }
        },
        'when card was put down this turn and player state service says it can move on turn when put down': {
            async setUp() {
                this.card = new BaseCard({
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: {
                        getPhase: () => 'attack',
                        cardCanMoveOnTurnWhenPutDown: () => true
                    },
                    matchService: {
                        getTurn: () => 1
                    },
                    queryEvents: {
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1
                    }
                });
            },
            'should be able to move'() {
                assert(this.card.canMove());
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
