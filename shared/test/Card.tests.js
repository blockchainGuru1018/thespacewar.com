const {
    testCase,
    assert,
    defaults,
    refute
} = require('bocha');
const MoveCardEvent = require('../event/MoveCardEvent.js');
const BaseCard = require('../card/BaseCard.js');
const NewHope = require('../card/NewHope.js');
const NuclearMissile = require('../card/NuclearMissile.js');
const canThePlayerFactory = require('./fakeFactories/canThePlayerFactory.js');
const playerStateServiceFactory = require('./fakeFactories/playerStateServiceFactory.js');
const {
    createCard
} = require('./shared.js');

module.exports = testCase('Match', {
    'misc:': {
        'when card has 1 attack but has attack boost of 1': {
            async setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getAttackBoostForCard: card => {
                            if (card.id === 'C1A') return 1;
                            return 0;
                        }
                    }),
                });
            },
            'card should have attack of 2'() {
                assert.equals(this.card.attack, 2);
            }
        },
        'when card was put down this turn': {
            async setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack',
                        cardCanMoveOnTurnWhenPutDown: () => false
                    }),
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
                this.card = createCard(BaseCard, {
                    card: { id: 'C1A', attack: 1 },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack',
                        cardCanMoveOnTurnWhenPutDown: card => card.id === 'C1A'
                    }),
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
            this.card = createCard(NewHope, {
                card: { id: 'C1A', attack: 1 },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: {
                    getMovesOnTurn: () => [],
                    getTurnWhenCardWasPutDown: () => 1
                },
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => 'attack'
                })
            });

            assert(this.card.canMove());
        }
    },
    'Pursuiter:': {
        'when has moved to opponent zone previous turn should be able to target a station card for sacrifice': async function () {
            const stationCard = createCard(BaseCard, {
                card: { id: 'C2A' },
                playerStateService: {
                    isCardStationCard: cardId => cardId === 'C2A'
                }
            });
            this.card = createCard(BaseCard, {
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
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => 'attack'
                })
            });

            assert(this.card.canTargetCardForSacrifice(stationCard));
        },
        'when has moved to opponent zone this turn should NOT be able to target a station card for sacrifice': async function () {
            const stationCard = createCard(BaseCard, {
                card: { id: 'C2A' },
                isStationCard: true,
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardStationCard: cardId => cardId === 'C2A'
                })
            });
            this.card = createCard(BaseCard, {
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
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => 'attack'
                })
            });

            refute(this.card.canTargetCardForSacrifice(stationCard));
        }
    },
    'Nuclear missile:': {
        'when card is NOT Nuclear Missile and has moved this turn should be able to attack': function () {
            this.card = createCard(BaseCard, {
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: {
                    getAttacksOnTurn: () => [],
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                },
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                })
            });

            assert(this.card.canAttack());
        },
        'when card has moved this turn should NOT be able to attack': function () {
            this.card = createCard(NuclearMissile, {
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: {
                    getAttacksOnTurn: () => [],
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                },
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                })
            });

            refute(this.card.canAttack());
        }
    },
    'Disturbing sensor:': {
        'when missile normally can both move and attack and opponent does NOT have Disturbing sensor in play': {
            setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: 'C1A', attack: 1, type: 'missile' },
                    playerId: 'P1A',
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: {
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => []
                    },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack'
                    }),
                    canThePlayer: canThePlayerFactory.withStubs({
                        moveThisCard: card => card.id === 'C1A',
                        attackWithThisCard: card => card.id === 'C1A'
                    })
                });
            },
            'should be able to move': function () {
                assert(this.card.canMove());
            },
            'should be able to attack': function () {
                assert(this.card.canAttack());
            }
        },
        'when missile normally can both move and attack but opponent has Disturbing sensor in play': {
            setUp() {
                this.card = createCard(BaseCard, {
                    card: { id: 'C1A', attack: 1, type: 'missile' },
                    playerId: 'P1A',
                    matchService: {
                        getTurn: () => 2,
                    },
                    queryEvents: {
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => []
                    },
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack'
                    }),
                    canThePlayer: canThePlayerFactory.withStubs({
                        moveThisCard: card => card.id !== 'C1A',
                        attackWithThisCard: card => card.id !== 'C1A'
                    })
                });
            },
            'should NOT be able to move': function () {
                refute(this.card.canMove());
            },
            'should NOT be able to attack': function () {
                refute(this.card.canAttack());
            }
        }
    }
});