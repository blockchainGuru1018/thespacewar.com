const {
    bocha: {
        stub,
        assert,
        refute,
        sinon
    },
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const StateAsserter = require('../testUtils/StateAsserter.js');
const Luck = require('../../../shared/card/Luck.js');
const FatalError = require('../../../shared/card/FatalError.js');
const TargetMissed = require('../../../shared/card/TargetMissed.js');
const MoveCardEvent = require("../../../shared/event/MoveCardEvent.js");

module.exports = {
    'counter:': {
        async setUp() {
            const firstPlayerConnection = FakeConnection2(['stateChanged']);
            const secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
            this.match = createMatch({ players });
            this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
            this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
        },
        'when put down Luck and choose counter': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: Luck.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', cost: 2 })
                            ],
                            stationCards: [
                                { id: 'S1A', card: createCard({ id: 'S1A' }), place: 'action' },
                            ],
                            events: [
                                { type: 'putDownCard', turn: 1, location: 'station-action', cardId: 'S1A' }
                            ]
                        }
                    }
                }));
                this.match.putDownCard('P2A', { cardId: 'C1A', location: 'zone' });
                this.match.toggleControlOfTurn('P1A');

                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone', choice: 'counter' });
            },
            'should include legible cards in requirement "counterCard"'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasRequirement({
                    type: 'counterCard',
                    cardId: 'C2A',
                    count: 1,
                    cardGroups: [
                        { source: 'opponentAny', cards: [sinon.match({ id: 'C1A' })] }
                    ]
                });
            }
        },
        'when put down Luck and choose counter and then select card to counter': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: Luck.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', cost: 2 })
                            ],
                            stationCards: [
                                { id: 'S1A', card: createCard({ id: 'S1A' }), place: 'action' },
                            ],
                            events: [
                                { type: 'putDownCard', turn: 1, location: 'station-action', cardId: 'S1A' }
                            ]
                        }
                    }
                }));
                this.match.putDownCard('P2A', { cardId: 'C1A', location: 'zone' });
                this.match.toggleControlOfTurn('P1A');
                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone', choice: 'counter' });

                this.match.counterCard('P1A', { cardId: 'C2A', targetCardId: 'C1A' });
            },
            'first player should have moved card used to counter into the discard pile'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasDiscardedCard('C2A');
            },
            'second player should have countered card in discard pile'() {
                this.secondPlayerAsserter.send('P2A');
                this.secondPlayerAsserter.hasDiscardedCard('C1A');
            }
        },
        'when players luck counter opponents fatal error and opponents luck then counter players luck': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P1A',
                    turn: 1,
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'spaceShip', cost: 0 }),
                                createCard({ id: 'C2A', type: 'event', commonId: Luck.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'wait',
                            cardsOnHand: [
                                createCard({ id: 'C3A', cost: 0, commonId: FatalError.CommonId }),
                                createCard({ id: 'C4A', cost: 0, commonId: Luck.CommonId })
                            ]
                        }
                    }
                }));
                this.match.putDownCard('P1A', { cardId: 'C1A', location: 'zone' });

                this.match.toggleControlOfTurn('P2A');
                this.match.putDownCard('P2A', { cardId: 'C3A', location: 'zone', choice: 'C1A' });

                this.match.drawCard('P1A');
                this.match.drawCard('P1A');
                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone', choice: 'counter' });
                this.match.counterCard('P1A', { cardId: 'C2A', targetCardId: 'C3A' });

                this.match.toggleControlOfTurn('P2A');
                this.match.putDownCard('P2A', { cardId: 'C4A', location: 'zone', choice: 'counter' });
                this.match.counterCard('P2A', { cardId: 'C4A', targetCardId: 'C2A' });
            },
            'first player should have moved card used to counter into the discard pile'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasDiscardedCard('C1A');
                this.firstPlayerAsserter.hasDiscardedCard('C2A');
            },
            'second player should have countered card in discard pile'() {
                this.secondPlayerAsserter.send('P2A');
                this.secondPlayerAsserter.hasDiscardedCard('C3A');
                this.secondPlayerAsserter.hasDiscardedCard('C4A');
            }
        },
        'when put down Target Missed': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            cardsInZone: [
                                createCard({ id: 'C1A', type: 'event', cost: 0 })
                            ],
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: TargetMissed.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'attack',
                            cardsInOpponentZone: [
                                createCard({ id: 'C3A', type: 'spaceShip', attack: 1 })
                            ]
                        }
                    }
                }));
                this.match.attack('P2A', { attackerCardId: 'C3A', defenderCardId: 'C1A' });
                this.match.toggleControlOfTurn('P1A');

                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone' });
            },
            'should include legible attacks in requirement "counterAttack"'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasRequirement({
                    type: 'counterAttack',
                    cardId: 'C2A',
                    count: 1,
                    attacks: [{
                        attackerCardData: sinon.match({ id: 'C3A' }),
                        defenderCardsData: [sinon.match({ id: 'C1A' })],
                        time: sinon.match.any
                    }]
                });
            }
        },
        'when put down Target Missed and select attack to counter': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            cardsInZone: [
                                createCard({ id: 'C1A', type: 'spaceShip', cost: 0 })
                            ],
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: TargetMissed.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'attack',
                            cardsInOpponentZone: [
                                createCard({ id: 'C3A', type: 'spaceShip', attack: 1 })
                            ]
                        }
                    }
                }));
                this.match.attack('P2A', { attackerCardId: 'C3A', defenderCardId: 'C1A' });
                this.match.toggleControlOfTurn('P1A');
                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone' });

                this.match.counterAttack('P1A', { attackIndex: 0 });
            },
            'should have moved card used to counter into the discard pile'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasDiscardedCard('C2A');
            },
            'should have attacked card back in zone'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasCardInZone('C1A');
            },
            'should have countered attack'() {
                this.firstPlayerAsserter.send('P2A');
                this.secondPlayerAsserter.countMatchingAttacks(1, {
                    countered: true,
                    attackerCardId: 'C3A',
                    defenderCardId: 'C1A'
                });
            }
        },
        'when put down Target Missed and select station attack to counter': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            stationCards: [
                                { place: 'draw', card: createCard({ id: 'S1A' }) },
                                { place: 'draw', card: createCard({ id: 'S2A' }) }
                            ],
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: TargetMissed.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'attack',
                            cardsInOpponentZone: [
                                createCard({ id: 'C3A', type: 'spaceShip', attack: 2 })
                            ],
                            events: [
                                MoveCardEvent({ turn: 1, cardId: 'C3A' })
                            ]
                        }
                    }
                }));
                this.match.attackStationCard('P2A', { attackerCardId: 'C3A', targetStationCardIds: ['S1A', 'S2A'] });
                this.match.toggleControlOfTurn('P1A');
                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone' });

                this.match.counterAttack('P1A', { attackIndex: 0 });
            },
            'should have moved card used to counter into the discard pile'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasDiscardedCard('C2A');
            },
            'should have station card unflipped'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasUnflippedStationCard('S1A');
                this.firstPlayerAsserter.hasUnflippedStationCard('S2A');
            },
            'should have countered attack'() {
                this.firstPlayerAsserter.send('P2A');
                this.secondPlayerAsserter.countMatchingAttacks(1, {
                    countered: true,
                    attackerCardId: 'C3A',
                    targetStationCardIds: ['S1A', 'S2A']
                });
            }
        }
    }
};
