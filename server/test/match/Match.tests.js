let {
    testCase,
    stub,
    sinon,
    assert,
    refute,
    defaults
} = require('bocha');
let FakeDeckFactory = require('../testUtils/FakeDeckFactory.js');
let FakeCardFactory = require('../testUtils/FakeCardFactory.js');
const createCard = FakeCardFactory.createCard;
const createDeckFromCards = FakeDeckFactory.createDeckFromCards;
let CardInfoRepository = require('../../../shared/CardInfoRepository.js');
let Match = require('../../match/Match.js');

//Explain: "player of the turn" is the current player of the turn. Both players will be the current player of the turn, once.
module.exports = testCase('Match', {
    'putDownCard:': {
        'when card is NOT in hand should throw error': function () {
            let match = createMatch({
                players: createPlayers([{ id: 'P1A' }])
            });
            match.start();
            match.start();
            const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

            let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

            assert.equals(error.message, 'Card is not on hand');
            assert.equals(error.type, 'CheatDetected');
        },
        'when does NOT have enough action points to place card in zone': function () {
            const card = createCard({ id: 'C1A', cost: 7 });
            let match = createMatch({
                deckFactory: FakeDeckFactory.fromCards([card]),
                players: createPlayers([{ id: 'P1A' }])
            });
            match.start();
            match.start();
            const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

            let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

            assert.equals(error.message, 'Cannot afford card');
            assert.equals(error.type, 'CheatDetected');
        },
        'when have just started game': {
            async setUp() {
                const restoreState = stub();
                const connection = FakeConnection({ restoreState });
                const player = createPlayer({ id: 'P1A', cost: 1, connection });
                let match = createMatch({ players: [player] });
                match.start();
                match.start();

                match.start();
                this.state = restoreState.firstCall.args[0];
            },
            'should have 7 cards on hand': function () {
                assert.equals(this.state.cardsOnHand.length, 7);
            },
            'should have correct amount and position of station cards': function () {
                assert.equals(this.state.stationCards.length, 5);
                assert.equals(this.state.stationCards.filter(c => c.place === 'draw').length, 1);
                assert.equals(this.state.stationCards.filter(c => c.place === 'action').length, 3);
                assert.equals(this.state.stationCards.filter(c => c.place === 'handSize').length, 1);
            },
            'should have 6 action points equal to the amound of station cards * 2': function () {
                assert.equals(this.state.actionPoints, 6);
            },
            'should be first players turn': function () {
                assert.equals(this.state.currentPlayer, 'P1A');
            },
            'should be turn 1': function () {
                assert.equals(this.state.turn, 1);
            }
        },
        'when can afford card:': {
            async setUp() {
                const card = createCard({ id: 'C1A', cost: 1 });
                this.connection = FakeConnection2(['restoreState']);
                this.secondPlayerConnection = FakeConnection2(['putDownOpponentCard', 'restoreState']);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards([card]),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.connection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should put card in zone'() {
                this.match.start();
                let state = this.connection.restoreState.firstCall.args[0];
                assert.equals(state.cardsInZone, [{ id: 'C1A', cost: 1 }]);
            },
            'should remove card from hand'() {
                this.match.start();
                let state = this.connection.restoreState.firstCall.args[0];
                assert.equals(state.cardsOnHand.length, 7);
            },
            'should add event'() {
                this.match.start();
                let state = this.connection.restoreState.firstCall.args[0];
                assert.equals(state.events.length, 1);
                assert.match(state.events[0], {
                    type: 'putDownCard',
                    turn: 1,
                    location: 'zone',
                    cardId: 'C1A'
                });
            },
            'should emit zone card to other player'() {
                let event = this.secondPlayerConnection.putDownOpponentCard.lastCall.args[0];
                assert.equals(event.location, 'zone');
                assert.match(event.card, { id: 'C1A' });
            },
            'when second player restore state should get zone card'() {
                this.match.start();
                const { opponentCardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert(opponentCardsInZone);
                assert.equals(opponentCardsInZone.length, 1);
                assert.match(opponentCardsInZone[0], { id: 'C1A' });
            }
        },
        'when put down station card and has already put down a station this turn should throw error': function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });
            match.putDownCard('P1A', { location: 'station-draw', cardId: 'C1A' });

            let error = catchError(() => match.putDownCard('P1A', { location: 'station-draw', cardId: 'C2A' }));

            assert.equals(error.message, 'Cannot put down more than one station card on the same turn');
            assert.equals(error.type, 'CheatDetected');
        },
        'when put down card and is NOT your turn should throw error': function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });

            let error = catchError(() => match.putDownCard('P2A', { location: 'zone', cardId: 'C2A' }));

            assert.equals(error.message, 'Cannot put down card when it is not your turn');
            assert.equals(error.type, 'CheatDetected');
        }
    },
    'discardCard:': {
        'when is action phase and first player discards card': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'setOpponentCardCount']);
                this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
                this.cards = [
                    createCard({ id: 'C1A' }), createCard({ id: 'C2A' }), createCard({ id: 'C3A' }),
                    createCard({ id: 'C4A' }), createCard({ id: 'C5A' }), createCard({ id: 'C6A' }),
                    createCard({ id: 'C7A' })
                ]
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards(this.cards),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });

                this.match.discardCard('P1A', 'C2A');
            },
            'should emit opponents new card count to first player'() {
                assert.calledOnce(this.firstPlayerConnection.setOpponentCardCount);
                assert.calledWith(this.firstPlayerConnection.setOpponentCardCount, 8);
            },
            'when restore state of first player should NOT have discarded card on hand'() {
                this.match.start();
                const { cardsOnHand } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsOnHand.length, 7);
                const discardedCardIsOnHand = cardsOnHand.some(c => c.id === 'C2A')
                refute(discardedCardIsOnHand);
            },
            'when restore state of first player should NOT have 2 additional action points'() {
                this.match.start();
                assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                    actionPoints: 8
                }));
            },
            'should emit opponentDiscardedCard to second player'() {
                assert.calledOnce(this.secondPlayerConnection.opponentDiscardedCard);
                const {
                    bonusCard,
                    discardedCard,
                    opponentCardCount
                } = this.secondPlayerConnection.opponentDiscardedCard.lastCall.args[0];
                assert.defined(bonusCard.id);
                assert.equals(discardedCard.id, 'C2A');
                assert.equals(opponentCardCount, 7);
            }
        },
        'when discards a card and then puts down a card in the action phase and goes to next phase': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'setOpponentCardCount']);
                this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
                this.cards = [
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A', cost: 1 })
                ]
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards(this.cards),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });
                this.match.discardCard('P1A', 'C1A');
                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' });

                this.match.nextPhase('P1A');
            },
            'and restore state should have correct amount of action points'() {
                this.match.start();
                assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                    actionPoints: 6
                }));
            }
        },
        'when in the action phase and discards 3 cards, puts down a card in the zone, puts down a station card and go to next players turn': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'setOpponentCardCount']);
                this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
                this.cards = [
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A', cost: 1 }),
                    createCard({ id: 'C3A' }),
                    createCard({ id: 'C4A' }),
                    createCard({ id: 'C5A' })
                ]
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards(this.cards),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });
                this.match.discardCard('P1A', 'C1A');
                this.match.discardCard('P1A', 'C2A');
                this.match.discardCard('P1A', 'C3A');
                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C4A' });
                this.match.putDownCard('P1A', { location: 'station-draw', cardId: 'C5A' });

                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
            },
            'and restore state should have correct amount of action points'() {
                this.match.start();
                assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                    actionPoints: 6
                }));
            }
        }
    },
    'nextPhase:': {
        'when is not own players turn should throw error': function () {
            let match = createMatch({
                players: [
                    createPlayer({ id: 'P1A' }),
                    createPlayer({ id: 'P2A' })
                ]
            });
            match.start();
            match.start();

            let error = catchError(() => match.nextPhase('P2A'));

            assert.equals(error.message, 'Switching phase when not your own turn');
            assert.equals(error.type, 'CheatDetected');
        },
        'when player of the turn is player one and current phase is the last one and go to next phase': {
            async setUp() {
                this.playerOneConnection = FakeConnection2(['nextPlayer']);
                this.playerTwoConnection = FakeConnection2(['nextPlayer']);
                let match = createMatchAndGoToFirstAttackPhase({
                    players: [
                        createPlayer({ id: 'P1A', connection: this.playerOneConnection }),
                        createPlayer({ id: 'P2A', connection: this.playerTwoConnection })
                    ]
                });

                match.nextPhase('P1A');
            },
            'should broadcast next player of the turn and turn count of 1 to playerOne'() {
                assert.calledWith(this.playerOneConnection.nextPlayer, { turn: 1, currentPlayer: 'P2A' });
            },
            'should broadcast next player of the turn and turn count of 1 to playerTwo'() {
                assert.calledWith(this.playerTwoConnection.nextPlayer, { turn: 1, currentPlayer: 'P2A' });
            }
        },
        'when player of the turn is player two and current phase is the last one': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['nextPlayer']);
                this.secondPlayerConnection = FakeConnection2(['nextPlayer']);
                let match = createMatchAndGoToSecondAttackPhase({
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection }),
                    ]
                });

                match.nextPhase('P2A');
            },
            'should broadcast next player of the turn and turn count of 2 to first player'() {
                assert.calledWith(this.firstPlayerConnection.nextPlayer, { turn: 2, currentPlayer: 'P1A' });
            },
            'should broadcast next player of the turn and turn count of 2 to second player'() {
                assert.calledWith(this.secondPlayerConnection.nextPlayer, { turn: 2, currentPlayer: 'P1A' });
            }
        },
        'when receive first next phase command from player of the turn': {
            async setUp() {
                this.drawCards = stub();
                this.restoreState = stub();
                const connection = FakeConnection({
                    drawCards: this.drawCards,
                    restoreState: this.restoreState
                });
                this.match = createMatch({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [createPlayer({ id: 'P1A', connection })]
                });
                this.match.start();
                this.match.start();

                this.match.nextPhase('P1A');
            },
            'should emit draw card with 1 card to the player of the turn': function () {
                assert.calledOnce(this.drawCards);

                const cards = this.drawCards.firstCall.args[0];
                assert.equals(cards.length, 1);
                assert.equals(cards[0].id, 'C1A');
            },
            'and get restore state should have added card on hand': function () {
                this.match.start();
                const { cardsOnHand } = this.restoreState.firstCall.args[0];
                assert.equals(cardsOnHand.length, 8);
            }
        },
        'when receive last next phase command from first player': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['drawCards', 'setOpponentCardCount']);
                this.secondPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
                this.match = createMatchAndGoToFirstAttackPhase({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });

                this.match.nextPhase('P1A');
            },
            'should NOT emit draw card again to first player'() {
                assert.calledOnce(this.firstPlayerConnection.drawCards);
            },
            'should emit setOpponentCardCount to first player': function () {
                assert.equals(this.firstPlayerConnection.setOpponentCardCount.lastCall.args[0], 8);
            },
            'should emit draw card with 1 card to second player': function () {
                assert.calledOnce(this.secondPlayerConnection.drawCards);

                const cards = this.secondPlayerConnection.drawCards.firstCall.args[0];
                assert.equals(cards.length, 1);
                assert.equals(cards[0].id, 'C1A');
            },
            'and get restore state should have added card on hand': function () {
                this.match.start();
                const { cardsOnHand } = this.secondPlayerConnection.restoreState.firstCall.args[0];
                assert.equals(cardsOnHand.length, 8);
            }
        },
        'when second player emits next phase on last phase of first turn': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
                this.secondPlayerConnection = FakeConnection2(['drawCards']);
                this.match = createMatchAndGoToSecondAttackPhase({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });

                this.match.nextPhase('P2A');
            },
            'should NOT emit draw card again to second player'() {
                assert.calledOnce(this.secondPlayerConnection.drawCards);
            },
            'should emit draw card with 1 card for the second time to the first player': function () {
                assert.calledTwice(this.firstPlayerConnection.drawCards);

                const cards = this.firstPlayerConnection.drawCards.secondCall.args[0];
                assert.equals(cards.length, 1);
                assert.equals(cards[0].id, 'C1A');
            },
            'and get restore state should have added card on hand on top of the 3 remaining after last discard phase': function () {
                this.match.start();

                const { cardsOnHand } = this.firstPlayerConnection.restoreState.firstCall.args[0];
                assert.equals(cardsOnHand.length, 4);
            }
        }
    },
    'nextPhase action phase:': {
        'when is first player in first turn': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints']);
                this.match = createMatchAndGoToFirstActionPhase({
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });
            },
            'should emit action points'() {
                assert.calledOnce(this.playerConnection.setActionPoints);
                assert.calledWith(this.playerConnection.setActionPoints, 6);
            }
        },
        'when is second player in first turn': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints']);
                this.match = createMatchAndGoToSecondActionPhase({
                    players: [
                        createPlayer({ id: 'P1A' }),
                        createPlayer({ id: 'P2A', connection: this.playerConnection })
                    ]
                });
            },
            'should emit action points'() {
                assert.calledOnce(this.playerConnection.setActionPoints);
                assert.calledWith(this.playerConnection.setActionPoints, 6);
            }
        },
        'when leaves the action phase': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints', 'restoreState']);
                this.match = createMatchAndGoToFirstActionPhase({
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });

                this.match.nextPhase('P1A');
            },
            'should reset action points'() {
                let lastCallActionPoints = this.playerConnection.setActionPoints.lastCall.args[0];
                assert.equals(lastCallActionPoints, 6);
            },
            'when restore state should get correct amount of action points': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 6
                }));
            }
        },
        'when has put down 1 zero cost card in zone and then puts down station card in action row': {
            async setUp() {
                this.playerConnection = FakeConnection2(['restoreState']);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards([
                        createCard({ id: 'C1A', cost: 0 }),
                        createCard({ id: 'C2A', cost: 0 })
                    ]),
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
                this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C2A' });
            },
            'when restore state should have correct amount of action points': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 8
                }));
            }
        },
        'when put down station card should NOT lose any action points': {
            async setUp() {
                this.playerConnection = FakeConnection2(['restoreState']);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards([
                        createCard({ id: 'C1A', cost: 1 }),
                    ]),
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });

                this.match.putDownCard('P1A', { location: 'station-draw', cardId: 'C1A' });
            },
            'when restore state should have correct amount of action points': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 6
                }));
            }
        },
        'when put card in zone and then put down a station card in action row': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints', 'restoreState']);
                let cardFactory = FakeCardFactory.fromCards([createCard({ id: 'C1A', cost: 1 })]);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory({ cardFactory }),
                    cardInfoRepository: CardInfoRepository({ cardFactory }),
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
                this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C1A' });
            },
            'when restore state should have correct amount of action points': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 5
                }));
            },
            'when go to next phase should gain action points from added station card': function () {
                this.match.nextPhase('P1A');

                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 8
                }));
            }
        },
        'when put down a station card in action row and then put down card in zone': {
            async setUp() {
                this.card = createCard({ id: 'C1A', cost: 1 });
                this.playerConnection = FakeConnection2(['setActionPoints', 'restoreState']);
                let cardFactory = FakeCardFactory.fromCards([this.card]);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory({ cardFactory }),
                    cardInfoRepository: CardInfoRepository({ cardFactory }),
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });

                this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C1A' });
                this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' }));
            },
            'should NOT give error'() {
                refute(this.error);
            },
            'when restore state should have correct amount of action points': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    actionPoints: 7
                }));
            },
            'when restore state should have card in zone': function () {
                this.match.start();
                assert.calledWith(this.playerConnection.restoreState, sinon.match({
                    cardsInZone: [this.card]
                }));
            },
            'when restore state should have 4 station cards in action row': function () {
                this.match.start();
                let { stationCards } = this.playerConnection.restoreState.lastCall.args[0];
                const stationCardsInActionRow = stationCards.filter(s => s.place === 'action')
                assert.equals(stationCardsInActionRow.length, 4);
            }
        }
    },
    'discard phase': {
        'when has 8 cards entering discard phase of first turn and leaves without discarding should throw error': function () {
            let match = createMatchAndGoToFirstDiscardPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });

            let error = catchError(() => match.nextPhase('P1A'));

            assert.equals(error.message, 'Cannot leave the discard phase without discarding enough cards');
            assert.equals(error.type, 'CheatDetected');
        },
        'when exit fist discard phase with 3 cards': {
            async setUp() {
                this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
                let match = createMatchAndGoToFirstDiscardPhase({
                    deckFactory: FakeDeckFactory.fromCards([
                        createCard({ id: 'C1A' }),
                        createCard({ id: 'C2A' }),
                        createCard({ id: 'C3A' }),
                        createCard({ id: 'C4A' }),
                        createCard({ id: 'C5A' })
                    ]),
                    players: [createPlayer({ id: 'P1A' }), createPlayer({
                        id: 'P2A',
                        connection: this.secondPlayerConnection
                    })]
                });
                match.discardCard('P1A', 'C1A');
                match.discardCard('P1A', 'C2A');
                match.discardCard('P1A', 'C3A');
                match.discardCard('P1A', 'C4A');
                match.discardCard('P1A', 'C5A');

                this.error = catchError(() => match.nextPhase('P1A'));
            },
            'should NOT throw an error'() {
                refute(this.error);
            },
            'should emit opponentDiscardedCard to second player for each discarded card'() {
                assert.equals(this.secondPlayerConnection.opponentDiscardedCard.callCount, 5);
                assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                    discardedCard: sinon.match({ id: 'C1A' }),
                    opponentCardCount: 7
                });
                assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                    discardedCard: sinon.match({ id: 'C2A' }),
                    opponentCardCount: 6
                });
                assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                    discardedCard: sinon.match({ id: 'C3A' }),
                    opponentCardCount: 5
                });
                assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                    discardedCard: sinon.match({ id: 'C4A' }),
                    opponentCardCount: 4
                });
                assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                    discardedCard: sinon.match({ id: 'C5A' }),
                    opponentCardCount: 3
                });
            }
        }
    },
    'attack phase:': {
        'when first player is in attack phase and moves card': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState']);
                this.secondPlayerConnection = FakeConnection2(['opponentMovedCard', 'restoreState']);
                this.match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [
                        createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                    ]
                });
                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
                this.match.nextPhase('P1A');
                this.match.discardCard('P1A', 'C1A');
                this.match.discardCard('P1A', 'C1A');
                this.match.discardCard('P1A', 'C1A');
                this.match.discardCard('P1A', 'C1A');
                this.match.discardCard('P1A', 'C1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');

                this.match.nextPhase('P2A');
                this.match.nextPhase('P2A');
                this.match.discardCard('P2A', 'C1A');
                this.match.discardCard('P2A', 'C1A');
                this.match.discardCard('P2A', 'C1A');
                this.match.discardCard('P2A', 'C1A');
                this.match.discardCard('P2A', 'C1A');
                this.match.nextPhase('P2A');
                this.match.nextPhase('P2A');

                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');

                this.match.moveCard('P1A', 'C1A');
            },
            'should emit opponentMovedCard'() {
                assert.calledOnce(this.secondPlayerConnection.opponentMovedCard);
                assert.calledWith(this.secondPlayerConnection.opponentMovedCard, 'C1A');
            },
            'when restore state for first player should NOT have moved card in own zone'() {
                this.match.start();
                const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(state.cardsInZone.length, 0);
            },
            'when restore state for first player should have moved card in playerCardsInOpponentZone'() {
                this.match.start();
                const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(state.cardsInOpponentZone.length, 1);
                assert.match(state.cardsInOpponentZone[0], { id: 'C1A' });
            },
            'when restore state for first player should have a move card event'() {
                this.match.start();
                const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
                const moveCardEvents = state.events.filter(e => e.type === 'moveCard');
                assert.equals(moveCardEvents.length, 1);
                assert.match(moveCardEvents[0], { cardId: 'C1A' });
            },
            'when restore state for second player should have card in opponentCardsInPlayerZone'() {
                this.match.start();
                let state = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(state.opponentCardsInPlayerZone.length, 1);
                assert.match(state.opponentCardsInPlayerZone[0], { id: 'C1A' });
            }
        },
        'when try to move card that is NOT in own zone should throw error': async function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                players: [
                    createPlayer({ id: 'P1A' }),
                    createPlayer({ id: 'P2A' })
                ]
            });
            match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            match.nextPhase('P1A');
            repeat(5, () => match.discardCard('P1A', 'C1A'));
            repeat(2, () => match.nextPhase('P1A'));

            repeat(2, () => match.nextPhase('P2A'));
            repeat(5, () => match.discardCard('P2A', 'C1A'));
            repeat(2, () => match.nextPhase('P2A'));

            repeat(3, () => match.nextPhase('P1A'));

            let error = catchError(() => match.moveCard('P1A', 'C2A'));

            assert(error);
            assert.equals(error.message, 'Cannot move card that is not in your own zone');
        },
        'when try to move card on the same turn it was put down should throw error': async function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                players: [
                    createPlayer({ id: 'P1A' }),
                    createPlayer({ id: 'P2A' })
                ]
            });
            match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            match.nextPhase('P1A');
            repeat(5, () => match.discardCard('P1A', 'C1A'));
            match.nextPhase('P1A')

            let error = catchError(() => match.moveCard('P1A', 'C1A'));

            assert(error);
            assert.equals(error.message, 'This card cannot be moved on the same turn it was put down');
        },
        'when first player attack card in opponents own zone': {
            async setUp() {
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.secondPlayerConnection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 1 })],
                        },
                        'P2A': {
                            cardsInZone: [createCard({ id: 'C2A' })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': createDeckFromCards([{ id: 'C1A' }]),
                        'P2A': createDeckFromCards([{ id: 'C2A' }])
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when second player restore state should have damaged card still in own zone'() {
                this.match.start();
                const { cardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                const damagedCards = cardsInZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 1);
                assert.equals(damagedCards[0].damage, 1);
            },
            'should emit opponentAttackedCard with card ids and damage amount'() {
                assert.calledWith(this.secondPlayerConnection.opponentAttackedCard, {
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    newDamage: 1
                });
            }
        },
        'when first player attack card in own zone from opponents zone': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A' })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A' })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': createDeckFromCards([{ id: 'C1A' }]),
                        'P2A': createDeckFromCards([{ id: 'C2A' }])
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
                this.error = catchError(() => this.match.attack('P1A', attackOptions));
            },
            'should throw error': function () {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack card in another zone');
            },
            'when second player restore state should have card undamaged and still in own zone'() {
                this.match.start();

                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                assert(cardsInOpponentZone.some(c => c.id === 'C2A'));

                const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 0);
            }
        },
        'when first player attack but is NOT in attack phase': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'discard',
                            cardsInOpponentZone: [createCard({ id: 'C1A' })],
                        },
                        'P2A': {
                            cardsInZone: [createCard({ id: 'C2A' })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': createDeckFromCards([{ id: 'C1A' }]),
                        'P2A': createDeckFromCards([{ id: 'C2A' }])
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
                this.error = catchError(() => this.match.attack('P1A', attackOptions));
            },
            'should throw error': function () {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack when not in attack phase');
            },
            'when second player restore state should have card undamaged and still in own zone'() {
                this.match.start();

                const { cardsInZone } = this.connection.restoreState.lastCall.args[0];
                assert(cardsInZone.some(c => c.id === 'C2A'));

                const damagedCards = cardsInZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 0);
            }
        },
        'when first player attack card in opponent zone from own zone': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A' })],
                        },
                        'P2A': {
                            cardsInZone: [createCard({ id: 'C2A' })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': createDeckFromCards([{ id: 'C1A' }]),
                        'P2A': createDeckFromCards([{ id: 'C2A' }])
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
                this.error = catchError(() => this.match.attack('P1A', attackOptions));
            },
            'should throw error': function () {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack card in another zone');
            },
            'when second player restore state should have card undamaged and still in own zone'() {
                this.match.start();

                const { cardsInZone } = this.connection.restoreState.lastCall.args[0];
                assert(cardsInZone.some(c => c.id === 'C2A'));

                const damagedCards = cardsInZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 0);
            }
        },
        'when first player attack card in own zone': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A' })]
                        }
                    },
                    deckByPlayerId: {
                        'P1A': createDeckFromCards([{ id: 'C1A' }]),
                        'P2A': createDeckFromCards([{ id: 'C2A' }])
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when second player restore state should have damaged card still in opponent zone'() {
                this.match.start();
                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 1);
                assert.equals(damagedCards[0].damage, 1);
            }
        },
        'when first player makes deadly attack should remove defending card from play': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 2 })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 1 })]
                        }
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when second player restore state should NOT have attacked card'() {
                this.match.start();
                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                assert.equals(cardsInOpponentZone.length, 0);
            },
            'should emit opponent attacked card'() {
                assert.calledWith(this.connection.opponentAttackedCard, {
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    defenderCardWasDestroyed: true
                });
            }
        },
        'when defender has 2 in defense and 1 in damage and first player attacks with card with 1 in attack': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 2, damage: 1 })]
                        }
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when second player restore state should NOT have attacked card'() {
                this.match.start();
                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                assert.equals(cardsInOpponentZone.length, 0);
            },
            'should emit opponent attacked card and that defender card was destroyed'() {
                assert.calledWith(this.connection.opponentAttackedCard, {
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    defenderCardWasDestroyed: true
                });
            }
        },
        'when defender has 3 in defense and 1 in damage and first player attacks with card with 1 in attack': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 3, damage: 1 })]
                        }
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when second player restore state should have damaged card still in opponent zone'() {
                this.match.start();
                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
                assert.equals(damagedCards.length, 1);
                assert.equals(damagedCards[0].damage, 2);
            },
            'should emit opponent attacked card twice'() {
                assert.calledOnce(this.connection.opponentAttackedCard);
                assert.calledWith(this.connection.opponentAttackedCard, {
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    newDamage: 2
                });
            }
        },
        'when attacks twice with same card in same turn': {
            async setUp() {
                this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
                this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 2 })]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
                this.match.attack('P1A', attackOptions);
                this.error = catchError(() => this.match.attack('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack twice in the same turn');
            },
            'when second player restore state should still have attacked card'() {
                this.match.start();
                const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
                assert.equals(cardsInOpponentZone.length, 1);
                assert.match(cardsInOpponentZone[0], { id: 'C2A' });
            },
            'should emit opponent attacked card only once'() {
                assert.calledOnce(this.connection.opponentAttackedCard);
                assert.calledWith(this.connection.opponentAttackedCard, {
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    newDamage: 1
                });
            }
        },
        'when first player try to move defense card': {
            setUp() {
                this.match = createMatch({ players: [Player('P1A')] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', type: 'defense' })]
                        }
                    }
                }));

                this.error = catchError(() => this.match.moveCard('P1A', 'C1A'));
            },
            'should throw error': function () {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot move defense card');
            }
        },
        'when first player attack first action station card': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stationCardsChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', type: 'defense' })],
                            events: [{ type: 'moveCard', turn: 1, cardId: 'C1A' }]
                        },
                        'P2A': {
                            stationCards: [
                                { id: 'C2A', card: createCard({ id: 'C2A' }), place: 'action' },
                                { id: 'C3A', card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', {
                    attackerCardId: 'C1A',
                    targetStationCardId: 'C2A'
                });
            },
            'when second player restore state should have 1 station card flipped': function () {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(stationCards.length, 2);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            },
            'when first player restore state 1 of the opponent station cards should be flipped': function () {
                this.match.start();
                let { opponentStationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(opponentStationCards.length, 2);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to second player': function () {
                const stationCards = this.secondPlayerConnection.stationCardsChanged.lastCall.args[0];
                assert.equals(stationCards.length, 2);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to first player': function () {
                const stationCards = this.firstPlayerConnection.opponentStationCardsChanged.lastCall.args[0];
                assert.equals(stationCards.length, 2);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            }
        },
        'when card has NOT been in enemy zone for 1 turn': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stationCardsChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', type: 'defense' })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { id: 'C2A', card: createCard({ id: 'C2A' }), place: 'action' },
                                { id: 'C3A', card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardId: 'C2A' }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack station when have not been in the zone for at least 1 turn');
            }
        },
        'when card has never been moved': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stationCardsChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', type: 'defense' })],
                            events: []
                        },
                        'P2A': {
                            stationCards: [
                                { id: 'C2A', card: createCard({ id: 'C2A' }), place: 'action' },
                                { id: 'C3A', card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardId: 'C2A' }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Can only attack station card from enemy zone');
            }
        },
        'when attacking station card that does NOT exist': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stationCardsChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', type: 'defense' })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { id: 'C2A', card: createCard({ id: 'C2A' }), place: 'action' },
                                { id: 'C3A', card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardId: 'NO_CARD_HAS_THIS_ID' }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should NOT throw error'() {
                refute(this.error);
            },
            'when second player restore state should NOT have any station cards flipped'() {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 0);
            },
            'when first player restore state none of the opponent station cards should be flipped'() {
                this.match.start();
                let { opponentStationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 0);
            },
            'should NOT emit flipped station card to second player'() {
                refute.called(this.secondPlayerConnection.stationCardsChanged);
            },
            'should NOT emit flipped station card to first player'() {
                refute.called(this.firstPlayerConnection.opponentStationCardsChanged);
            }
        }
    },
    'when first player retreats from match should emit opponentRetreated to second player': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['opponentRetreated', 'restoreState']);
            this.match = createMatchAndGoToFirstActionPhase({
                players: [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection)
                ]
            });

            this.match.retreat('P1A');
        },
        'should emit opponentRetreated'() {
            assert.calledOnce(this.secondPlayerConnection.opponentRetreated);
        },
        'when first player restore state should say opponent retreated'() {
            this.match.start();
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                playerRetreated: true
            }));
        },
        'when second player restore state should say opponent retreated'() {
            this.match.start();
            assert.calledWith(this.secondPlayerConnection.restoreState, sinon.match({
                opponentRetreated: true
            }));
        },
        'when ask match if has ended should be true'() {
            assert(this.match.hasEnded());
        }
    }
});

function createPlayers(playerOptions) {
    return [
        createPlayer(playerOptions[0] || {}),
        createPlayer(playerOptions[1] || {})
    ];
}

function Player(id = '007', connection = FakeConnection2()) {
    return createPlayer({ id, connection });
}

function createPlayer(options = {}) { // TODO Make "Player" be createPlayer and this be something else
    return defaults(options, {
        id: '007',
        name: 'James',
        connection: FakeConnection2()
    });
}

function createMatchAndGoToFirstActionPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstDiscardPhase(deps = {}) {
    const match = createMatchAndGoToFirstActionPhase(deps);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstAttackPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();

    const [firstPlayer, _] = match.players;
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);

    let firstPlayerCards = null;
    firstPlayer.connection.on('restoreState', state => {
        firstPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = firstPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, firstPlayer.id, match);

    match.nextPhase(firstPlayer.id);

    return match;
}

function createMatchAndGoToSecondActionPhase(deps = {}) {
    const match = createMatchAndGoToFirstAttackPhase(deps);
    match.nextPhase(match.players[0].id);

    match.nextPhase(match.players[1].id);
    return match;
}

function createMatchAndGoToSecondAttackPhase(deps = {}) {
    const match = createMatchAndGoToSecondActionPhase(deps);
    match.nextPhase(match.players[1].id);

    const [_, secondPlayer] = match.players;
    let secondPlayerCards = null;
    secondPlayer.connection.on('restoreState', state => {
        secondPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = secondPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, secondPlayer.id, match);

    match.nextPhase(match.players[1].id);

    return match;
}

function discardCardsAsPlayer(cardIds, playerId, match) {
    for (let i = 0; i < cardIds.length; i++) {
        match.discardCard(playerId, cardIds[i]);
    }
}

function createMatch(deps = {}) {
    if (deps.players && deps.players.length === 1) {
        deps.players.push(createPlayer());
    }
    const deckFactory = deps.deckFactory || FakeDeckFactory.fromCards([createCard()]);
    const cardFactory = deckFactory._getCardFactory();
    defaults(deps, {
        deckFactory,
        cardInfoRepository: CardInfoRepository({ cardFactory }),
        players: [createPlayer(), createPlayer()]
    });
    return Match(deps);
}

function FakeConnection(listenerByActionName) { // TODO Migrate this to the new and then rename the new one to this name
    return {
        emit(_, { action, value }) {
            if (listenerByActionName[action]) {
                listenerByActionName[action](value);
            }
        }
    };
}

function FakeConnection2(namesOfActionsToStub = []) {
    const stubMap = {};
    for (let name of namesOfActionsToStub) {
        stubMap[name] = stub();
    }
    const listenersByActionName = {};

    return {
        emit(_, { action, value }) {
            if (stubMap[action]) {
                stubMap[action](value);
            }
            if (listenersByActionName[action]) {
                listenersByActionName[action].forEach(listener => listener(value));
            }
        },
        on(action, callback) {
            listenersByActionName[action] = listenersByActionName[action] || [];
            listenersByActionName[action].push(callback);
        },
        ...stubMap
    };
}

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

function repeat(count, callback) {
    for (let i = 0; i < count; i++) {
        callback();
    }
}

function createState(options) {
    defaults(options, {
        turn: 1,
        currentPlayer: 'P1A',
        playerOrder: ['P1A', 'P2A'],
        playerStateById: {},
        deckByPlayerId: {}
    });
    for (let key of Object.keys(options.playerStateById)) {
        options.playerStateById[key] = createPlayerState(options.playerStateById[key]);
    }
    for (let playerId of options.playerOrder) {
        if (!options.deckByPlayerId[playerId]) {
            options.deckByPlayerId[playerId] = FakeDeckFactory.createDeckFromCards([FakeCardFactory.createCard()]);
        }
        if (!options.playerStateById[playerId]) {
            options.playerStateById[playerId] = createPlayerState();
        }
    }

    return options;
}

function createPlayerState(options = {}) {
    return defaults(options, {
        phase: 'wait',
        cardsOnHand: [],
        cardsInZone: [],
        cardsInOpponentZone: [],
        stationCards: [],
        events: []
    });
}