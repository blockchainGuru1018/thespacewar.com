const {
    testCase,
    assert,
    defaults,
    refute
} = require('bocha');
const MoveCardEvent = require('../event/MoveCardEvent.js');
const BaseCard = require('../card/BaseCard.js');
const SmallRepairShop = require('../card/SmallRepairShop.js');
const NuclearMissile = require('../card/NuclearMissile.js');
const EmpMissile = require('../card/EmpMissile.js');
const EnergyShield = require('../card/EnergyShield.js');
const Pursuiter = require('../card/Pursuiter.js');
const canThePlayerFactory = require('./fakeFactories/canThePlayerFactory.js');
const playerStateServiceFactory = require('./fakeFactories/playerStateServiceFactory.js');
const queryEventsFactory = require('./fakeFactories/queryEventsFactory.js');
const {
    createCard
} = require('./shared.js');

module.exports = testCase('Cards', {
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
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1
                    })
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
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1
                    })
                });
            },
            'should be able to move'() {
                assert(this.card.canMove());
            }
        }
    },
    'Small Repair Shop:': {
        'Small Repair Shop should be able to move on turn when put down'() {
            this.card = createCard(SmallRepairShop, {
                card: { id: 'C1A', attack: 1 },
                matchService: {
                    getTurn: () => 1,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getMovesOnTurn: () => [],
                    getTurnWhenCardWasPutDown: () => 1
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getPhase: () => 'attack'
                })
            });

            assert(this.card.canMove());
        },
        'when repair other ship with 1 damage and that is paralyzed': {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: 'C1A', attack: 1 },
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack'
                    })
                });
                this.otherCard = createCard(BaseCard, { card: { paralyzed: true, damage: 1 } });

                this.card.repairCard(this.otherCard);
            },
            'should make it NOT paralyzed'() {
                refute(this.otherCard.paralyzed);
            },
            'should NOT repair any damage'() {
                assert.equals(this.otherCard.damage, 1);
            }
        },
        'when has attacked this turn should NOT be able to repair': {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: 'C1A', attack: 1 },
                    matchService: {
                        getTurn: () => 1,
                    },
                    queryEvents: queryEventsFactory.withStubs({
                        getMovesOnTurn: () => [],
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 1 ? [{}] : []
                    }),
                    playerStateService: playerStateServiceFactory.withStubs({
                        getPhase: () => 'attack',
                        hasMatchingCardInSomeZone: matcher => matcher({ canBeRepaired: () => true })
                    })
                });
            },
            'should NOT be able to repair'() {
                refute(this.card.canRepair());
            }
        },
        'when is paralyzed should NOT be able to repair': {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: 'C1A', paralyzed: true },
                    queryEvents: queryEventsFactory.withStubs(),
                    playerStateService: playerStateServiceFactory.withStubs()
                });
            },
            'should NOT be able to repair'() {
                refute(this.card.canRepair());
            }
        },
        'when other card belongs to the opponent should NOT be able to repair that card': {
            setUp() {
                this.card = createCard(SmallRepairShop, {
                    card: { id: 'C1A', paralyzed: true },
                    queryEvents: queryEventsFactory.withStubs(),
                    playerStateService: playerStateServiceFactory.withStubs()
                });
            },
            'should NOT be able to repair'() {
                refute(this.card.canRepair());
            }
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
            this.card = createCard(Pursuiter, {
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                    cardsAreInSameZone: (card, otherCard) => card.id === 'C1A' && otherCard.id === 'C2A'
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    hasMovedOnPreviousTurn: () => true,
                    getTurnWhenCardWasPutDown: () => 1
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardInHomeZone: () => false,
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
                    cardsAreInSameZone: (card, otherCard) => card.id === 'C1A' && otherCard.id === 'C2A'
                },
                queryEvents: queryEventsFactory.withStubs({
                    hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 2,
                    getTurnWhenCardWasPutDown: () => 1
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    isCardInHomeZone: () => false,
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
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                }),
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
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 2,
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                }),
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
                    queryEvents: queryEventsFactory.withStubs({
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => []
                    }),
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
                    queryEvents: queryEventsFactory.withStubs({
                        getTurnWhenCardWasPutDown: () => 1,
                        getAttacksOnTurn: () => [],
                        getMovesOnTurn: () => []
                    }),
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
    },
    'when EmpMissile attacks spaceShip': {
        setUp() {
            this.card = createCard(EmpMissile, {
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 2,
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                })
            });
            this.otherCard = createCard(BaseCard, { card: { type: 'spaceShip', damage: 0 } });

            this.card.attackCard(this.otherCard);
        },
        'should paralyze ship': function () {
            assert(this.otherCard.paralyzed);
        },
        'should NOT damage ship': function () {
            assert.equals(this.otherCard.damage, 0);
        },
        'should have destroyed self': function () {
            assert(this.card.destroyed);
        }
    },
    'when EmpMissile attacks Energy Shield': {
        setUp() {
            this.card = createCard(EmpMissile, {
                card: { id: 'C1A', attack: 1 },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 2,
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                })
            });
            this.otherCard = createCard(
                EnergyShield,
                { card: { commonId: EnergyShield.CommonId, type: 'defense', damage: 0 } }
            );

            this.card.attackCard(this.otherCard);
        },
        'should destroy ship': function () {
            assert(this.otherCard.destroyed);
        },
        'should NOT paralyze ship': function () {
            refute(this.otherCard.paralyzed);
        },
        'should have destroyed self': function () {
            assert(this.card.destroyed);
        }
    },
    'when EmpMissile attacks basic defense card': {
        setUp() {
            this.card = createCard(EmpMissile, {
                card: { id: 'C1A' },
                playerId: 'P1A',
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: queryEventsFactory.withStubs({
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 2,
                    getMovesOnTurn: () => [MoveCardEvent({ turn: 2, cardId: 'C1A' })]
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                })
            });
            this.otherCard = createCard(BaseCard, { card: { type: 'defense', damage: 0 } });

            this.error = catchError(() => this.card.attackCard(this.otherCard));
        },
        'should NOT destroy ship': function () {
            refute(this.otherCard.destroyed);
        },
        'should NOT damage ship': function () {
            assert.equals(this.otherCard.damage, 0);
        },
        'should NOT paralyze ship': function () {
            refute(this.otherCard.paralyzed);
        },
        'should have destroyed self': function () {
            assert(this.card.destroyed);
        }
    },
    'when EmpMissile should NOT be able to attack station cards'() {
        this.card = createCard(EmpMissile, {
            card: { id: 'C1A', type: 'missile' },
            playerId: 'P1A',
            matchService: {
                getTurn: () => 1,
            },
            queryEvents: queryEventsFactory.withStubs({
                getAttacksOnTurn: () => [],
                hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 1,
                getMovesOnTurn: () => [MoveCardEvent({ turn: 1, cardId: 'C1A' })]
            }),
            playerStateService: playerStateServiceFactory.withStubs({
                getAttackBoostForCard: () => 0,
                getPhase: () => 'attack',
                isCardInHomeZone: () => false
            })
        });

        refute(this.card.canAttackStationCards());
    },
    'when EmpMissile should NOT be able to attack paralyzed cards'() {
        this.card = createCard(EmpMissile, {
            card: { id: 'C1A', type: 'missile' },
            playerId: 'P1A',
            matchService: {
                getTurn: () => 1,
            },
            queryEvents: queryEventsFactory.withStubs({
                getAttacksOnTurn: () => [],
                hasMovedOnTurn: (cardId, turn) => cardId === 'C1A' && turn === 1,
                getMovesOnTurn: () => [MoveCardEvent({ turn: 1, cardId: 'C1A' })]
            }),
            playerStateService: playerStateServiceFactory.withStubs({
                getAttackBoostForCard: () => 0,
                getPhase: () => 'attack',
                isCardInHomeZone: () => false
            })
        });

        refute(this.card.canAttackCard({ canBeTargeted: () => true, paralyzed: true }));
    },
    'when card is paralyzed': {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { id: 'C1A', attack: 1, paralyzed: true },
                canThePlayer: canThePlayerFactory.withStubs({
                    attackWithThisCard: () => true,
                    moveThisCard: () => true
                }),
                playerStateService: playerStateServiceFactory.withStubs({
                    getAttackBoostForCard: () => 0,
                    getPhase: () => 'attack'
                }),
                matchService: {
                    getTurn: () => 2,
                },
                queryEvents: {
                    getAttacksOnTurn: () => [],
                    hasMovedOnTurn: () => false,
                    getTurnWhenCardWasPutDown: () => 1
                }
            });
        },
        'should be able to target for attack'() {
            assert(this.card.canBeTargeted());
        },
        'should NOT be able to attack'() {
            refute(this.card.canAttack());
        },
        'should NOT be able to move'() {
            refute(this.card.canMove());
        },
        'can be repaired'() {
            assert(this.card.canBeRepaired());
        }
    }
});

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}