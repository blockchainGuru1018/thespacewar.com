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
                        cardCanMoveOnTurnWhenPutDown: card => card.id === 'C1A'
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
    },
    'Pursuiter:': {
        'when has moved to opponent zone previous turn should be able to target a station card for sacrifice': async function () {
            const stationCard = new BaseCard({
                card: { id: 'C2A' },
                playerStateService: {
                    isCardStationCard: cardId => cardId === 'C2A'
                }
            });
            this.card = new BaseCard({
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                    isPlayerCardInHomeZone: () => false,
                    cardsAreInSameZone: (card, otherCard) => card.id === 'C1A' && otherCard.id === 'C2A'
                },
                queryEvents: {
                    hasMovedOnPreviousTurn: () => true,
                    getTurnWhenCardWasPutDown: () => 1
                },
                playerStateService: {
                    getPhase: () => 'attack'
                }
            });

            assert(this.card.canTargetCardForSacrifice(stationCard));
        },
        'when has moved to opponent zone this turn should NOT be able to target a station card for sacrifice': async function () {
            const stationCard = new BaseCard({
                card: { id: 'C2A' },
                isStationCard: true,
                playerStateService: {
                    isCardStationCard: cardId => cardId === 'C2A'
                }
            });
            this.card = new BaseCard({
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                    isPlayerCardInHomeZone: () => false,
                    cardsAreInSameZone: (card, otherCard) => card.id === 'C1A' && otherCard.id === 'C2A'
                },
                queryEvents: {
                    hasMovedOnPreviousTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1
                },
                playerStateService: {
                    getPhase: () => 'attack'
                }
            });

            refute(this.card.canTargetCardForSacrifice(stationCard));
        }
    }
});