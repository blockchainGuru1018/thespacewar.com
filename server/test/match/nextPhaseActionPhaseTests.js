const {
    bocha: {
        sinon,
        assert,
        refute,
    },
    FakeDeckFactory,
    createCard,
    Player,
    createPlayer,
    createMatchAndGoToFirstActionPhase,
    createMatchAndGoToSecondActionPhase,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const GoodKarma = require('../../../shared/card/GoodKarma.js');
const FakeDeck = require('../testUtils/FakeDeck.js');
const EnergyShieldId = '21';
const GoodKarmaCommonId = '11';
const { COMMON_PHASE_ORDER } = require('../../../shared/phases.js');
const LastPhase = COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.length - 1];

module.exports = {
    'when put down a station card in action row and then put down card in zone': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [
                            createCard({ id: 'C1A', cost: 1 }),
                            createCard({ id: 'C2A', cost: 1 })
                        ],
                        stationCards: []
                    }
                }
            }));

            this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C1A' });
            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should throw error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot afford card');
        },
        'when restore state should NOT have card in zone': function () {
            this.match.start();
            let { cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsInZone.length, 0);
        }
    },
    'when has Energy shield in home zone and put down another Energy shield': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [
                            createCard({ id: 'C2A', cost: 1, commonId: EnergyShieldId })
                        ],
                        cardsInZone: [
                            createCard({ id: 'C1A', cost: 1, commonId: EnergyShieldId })
                        ],
                        stationCards: [{ card: createCard({ id: 'C3A' }), place: 'action' }]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should throw'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot put down card');
        },
    },
    'when has Energy shield in home zone and put down another Energy shield as station card': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C2A', commonId: EnergyShieldId })],
                        cardsInZone: [createCard({ id: 'C1A', commonId: EnergyShieldId })]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C2A' }));
        },
        'should NOT throw'() {
            refute(this.error);
        }
    },
    'when does NOT have Energy shield in home zone and put down an Energy shield in zone': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C2A', commonId: EnergyShieldId })]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should NOT throw'() {
            refute(this.error);
        }
    },
    'when has card "Good karma" in play and enters draw phase': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                turn: 1,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration', commonId: GoodKarmaCommonId })]
                    },
                    'P2A': {
                        phase: LastPhase
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.realDeckFromCards([
                        createCard({ id: 'C4A' }),
                        createCard({ id: 'C5A' }),
                        createCard({ id: 'C6A' }),
                        createCard({ id: 'C6A' })
                    ])
                }
            }));

            this.match.nextPhase('P1A');
        },
        'should emit state changed with draw card requirement'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [sinon.match({ type: 'drawCard', count: GoodKarmaDrawCardRequirementCount() })]
            }));
        },
        'when restore state should have requirement'() {
            this.match.start();
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                requirements: [sinon.match({ type: 'drawCard', count: GoodKarmaDrawCardRequirementCount() })]
            }));
        }
    },
    'when has card "Good karma" in play and leaves draw phase': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                turn: 1,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration', commonId: GoodKarmaCommonId })],
                        cardsOnHand: [
                            createCard({ id: 'C2A' }),
                            createCard({ id: 'C3A' })
                        ]
                    }
                }
            }));

            this.match.nextPhase('P1A');
        },
        'should emit state changed with discard card requirement'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [sinon.match({ type: 'discardCard', count: GoodKarmaDiscardCardRequirementCount() })]
            }));
        },
        'when restore state should have requirement'() {
            this.match.start();
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                requirements: [sinon.match({ type: 'discardCard', count: GoodKarmaDiscardCardRequirementCount() })]
            }));
        }
    }
};

function GoodKarmaDrawCardRequirementCount() {
    return getCount(GoodKarma, 'requirementsWhenEnterDrawPhase', 'forPlayer', 'drawCard');
}

function GoodKarmaDiscardCardRequirementCount() {
    return getCount(GoodKarma, 'requirementsWhenLeavingDrawPhase', 'forPlayer', 'discardCard');
}

function getCount(CardConstructor, keyInCard, keyInRequirement, type) {
    let card = new CardConstructor({ card: {} });
    return card[keyInCard][keyInRequirement].find(r => r.type === type).count;
}