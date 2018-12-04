const {
    bocha: {
        assert,
        refute,
        sinon
    },
    createCard,
    createDeckFromCards,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const BaseCard = require('../../../shared/card/BaseCard.js');
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');

module.exports = {
    'Energy Shield:': {
        'when player is attacking station with attack level of 5 and opponent has an Energy Shield': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection)
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 5 })],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                                MoveCardEvent({ turn: 2, cardId: 'C1A' })
                            ]
                        },
                        'P2A': {
                            cardsInZone: [
                                createCard({
                                    id: 'C2A',
                                    type: 'defense',
                                    name: BaseCard.names.energyShield,
                                    defense: 5
                                })
                            ],
                            stationCards: [
                                { card: createCard({ id: 'S1A' }), place: 'action' },
                                { card: createCard({ id: 'S2A' }), place: 'action' },
                                { card: createCard({ id: 'S3A' }), place: 'action' },
                                { card: createCard({ id: 'S4A' }), place: 'action' },
                                { card: createCard({ id: 'S5A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', {
                    attackerCardId: 'C1A',
                    targetStationCardIds: ['S1A', 'S2A', 'S3A', 'S4A', 'S5A',]
                });
            },
            'opponent should have 0 station cards flipped'() {
                this.match.start();
                const { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                const flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards, []);
            },
            'opponent should NOT have energy shield in zone'() {
                this.match.start();
                const { cardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInZone, []);
            },
            'opponent should have energy shield in discard pile'() {
                this.match.start();
                const { discardedCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(discardedCards.length, 1);
                assert.equals(discardedCards[0].id, 'C2A');
            },
            'should emit stateChanged to second player once'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
            },
            'should emit stateChanged to second player with cards in zone'() {
                const { cardsInZone } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(cardsInZone, []);
            },
            'should emit stateChanged to second player with discarded cards'() {
                const { discardedCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(discardedCards.length, 1);
                assert.match(discardedCards[0], { id: 'C2A' });
            },
            'should emit stateChanged to second player WITHOUT station cards'() {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(stationCards);
            },
            'should emit stateChanged to first  player once'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
            },
            'should emit stateChanged to first player with opponentCardsInZone empty'() {
                const { opponentCardsInZone } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentCardsInZone, []);
            },
            'should emit stateChanged to first player with opponentDiscardedCards including Energy Shield'() {
                const { opponentDiscardedCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentDiscardedCards.length, 1);
                assert.match(opponentDiscardedCards[0], { id: 'C2A' });
            },
            'should emit stateChanged to first player that does NOT include opponentStationCards'() {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(opponentStationCards);
            }
        },
        'when player is attacking station with attack level of 4 and opponent has an Energy Shield': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection)
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 4 })],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                                MoveCardEvent({ turn: 2, cardId: 'C1A' })
                            ]
                        },
                        'P2A': {
                            cardsInZone: [
                                createCard({
                                    id: 'C2A',
                                    type: 'defense',
                                    name: BaseCard.names.energyShield,
                                    defense: 5
                                })
                            ],
                            stationCards: [
                                { card: createCard({ id: 'S1A' }), place: 'action' },
                                { card: createCard({ id: 'S2A' }), place: 'action' },
                                { card: createCard({ id: 'S3A' }), place: 'action' },
                                { card: createCard({ id: 'S4A' }), place: 'action' },
                                { card: createCard({ id: 'S5A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', {
                    attackerCardId: 'C1A',
                    targetStationCardIds: ['S1A', 'S2A', 'S3A', 'S4A']
                });
            },
            'opponent should have 0 station cards flipped'() {
                this.match.start();
                const { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                const flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards, []);
            },
            'opponent should have energy shield in zone with 4 damage'() {
                this.match.start();
                const { cardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInZone.length, 1);
                assert.match(cardsInZone[0], { id: 'C2A', damage: 4 });
            },
            'opponent should NOT have energy shield in discard pile'() {
                this.match.start();
                const { discardedCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(discardedCards.length, 0);
            },
            'should emit stateChanged to second player once'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
            },
            'should emit stateChanged to second player WITHOUT discarded cards'() {
                const { discardedCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(discardedCards);
            },
            'should emit stateChanged to second player WITHOUT station cards'() {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(stationCards);
            },
            'should emit stateChanged to first player once'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
            },
            'should emit stateChanged to first player WITHOUT opponentDiscardedCards'() {
                const { opponentDiscardedCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(opponentDiscardedCards);
            },
            'should emit stateChanged to first player WITHOUT opponentStationCards'() {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                refute.defined(opponentStationCards);
            }
        },
        'when player is attacking station with attack level of 5 and opponent has an Energy Shield with 1 damage': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection)
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 5 })],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                                MoveCardEvent({ turn: 2, cardId: 'C1A' })
                            ]
                        },
                        'P2A': {
                            cardsInZone: [
                                createCard(
                                    {
                                        id: 'C2A',
                                        type: 'defense',
                                        name: BaseCard.names.energyShield,
                                        defense: 5,
                                        damage: 1
                                    }
                                )
                            ],
                            stationCards: [
                                { card: createCard({ id: 'S1A' }), place: 'action' },
                                { card: createCard({ id: 'S2A' }), place: 'action' },
                                { card: createCard({ id: 'S3A' }), place: 'action' },
                                { card: createCard({ id: 'S4A' }), place: 'action' },
                                { card: createCard({ id: 'S5A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', {
                    attackerCardId: 'C1A',
                    targetStationCardIds: ['S1A', 'S2A', 'S3A', 'S4A', 'S5A',]
                });
            },
            'opponent should have 1 station card flipped'() {
                this.match.start();
                const { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                const flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0], { card: { id: 'S5A' }, flipped: true });
            },
            'opponent should NOT have energy shield in zone'() {
                this.match.start();
                const { cardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInZone.length, 0);
            },
            'opponent should have energy shield in discard pile'() {
                this.match.start();
                const { discardedCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(discardedCards.length, 1);
                assert.match(discardedCards[0], { id: 'C2A' });
            },
            'should emit stateChanged to second player once'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
            },
            'should emit stateChanged to second player with cards in zone'() {
                const { cardsInZone } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(cardsInZone.length, 0);
            },
            'should emit stateChanged to second player with discarded cards'() {
                const { discardedCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(discardedCards.length, 1);
                assert.match(discardedCards[0], { id: 'C2A' });
            },
            'should emit stateChanged to second player with station cards'() {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(stationCards.length, 5);
                assert.equals(stationCards[0].id, 'S1A');
                assert.equals(stationCards[1].id, 'S2A');
                assert.equals(stationCards[2].id, 'S3A');
                assert.equals(stationCards[3].id, 'S4A');

                assert.equals(stationCards[4].id, 'S5A');
                assert.equals(stationCards[4].card.id, 'S5A');
                assert(stationCards[4].flipped);
            },
            'should emit stateChanged to first player once'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
            },
            'should emit stateChanged to first player with opponentCardsInZone'() {
                const { opponentCardsInZone } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentCardsInZone.length, 0);
            },
            'should emit stateChanged to first player with opponentDiscardedCards'() {
                const { opponentDiscardedCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentDiscardedCards.length, 1);
                assert.match(opponentDiscardedCards[0], { id: 'C2A' });
            },
            'should emit stateChanged to first player with opponentStationCards'() {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentStationCards.length, 5);
                assert.equals(opponentStationCards[0].id, 'S1A');
                assert.equals(opponentStationCards[1].id, 'S2A');
                assert.equals(opponentStationCards[2].id, 'S3A');
                assert.equals(opponentStationCards[3].id, 'S4A');

                assert.equals(opponentStationCards[4].id, 'S5A');
                assert.equals(opponentStationCards[4].card.id, 'S5A');
                assert(opponentStationCards[4].flipped);
            }
        }
    },
    'Small Cannon:': {}
};