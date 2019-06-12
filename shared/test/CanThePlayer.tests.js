let {
    testCase,
    refute,
    assert
} = require('bocha');
const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCardData = FakeCardDataAssembler.createCard;
const BaseCard = require('../card/BaseCard.js');
const CanThePlayer = require('../match/CanThePlayer.js');
const GameConfig = require('../match/GameConfig.js');
const TestHelper = require('./fakeFactories/TestHelper.js');
const createState = require('./fakeFactories/createState.js');
const PutDownCardEvent = require('../PutDownCardEvent.js');

const {
    createCard
} = require('./shared.js');

module.exports = testCase('CanThePlayer', {
    'when max number of station cards is 1 and has 1 station card': {
        setUp() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        stationCards: [stationCard('S1A', 'draw')],
                        events: [
                            PutDownCardEvent({
                                location: 'station-draw',
                                cardId: 'S1A',
                                turn: 1
                            })
                        ]
                    }
                }
            }), {
                gameConfig: GameConfig({ maxStationCards: 1 })
            });
            this.canThePlayer = testHelper.canThePlayer('P1A');
        },
        'should NOT be able to put down more station cards'() {
            refute(this.canThePlayer.putDownMoreStationCardsThisTurn());
        }
    },
    'when card is of type spaceShip': {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { type: 'spaceShip' }
            });
            this.canThePlayer = new CanThePlayer();
        },
        'card can move'() {
            assert(this.canThePlayer.moveThisCard(this.card));
        },
        'card can attack'() {
            assert(this.canThePlayer.attackWithThisCard(this.card));
        }
    },
    'when card is of type missile and opponent has "Disturbing sensor" in play': {
        setUp() {
            this.card = createCard(BaseCard, {
                card: { type: 'missile' }
            });
            const disturbingSensor = {
                preventsOpponentMissilesFromMoving: true,
                preventsOpponentMissilesFromAttacking: true
            };
            this.canThePlayer = new CanThePlayer({
                opponentStateService: {
                    hasMatchingCardInSomeZone: matcher => matcher(disturbingSensor)
                }
            });
        },
        'card can NOT move'() {
            refute(this.canThePlayer.moveThisCard(this.card));
        },
        'card can NOT attack'() {
            refute(this.canThePlayer.attackWithThisCard(this.card));
        }
    },
    'counterCard:': {
        'card does not exist'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: []
                    }
                }
            }));
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            refute(canCounterCard);
        },
        'took control too late'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [
                            { id: 'C1A' }
                        ]
                    }
                }
            }));
            testHelper.stub('queryEvents', 'P1A', {
                lastTookControlWithinTimeFrameSincePutDownCard: () => false,
                wasOpponentCardAtLatestPutDownInHomeZone: () => true,
                wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () => false,
                wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false
            });
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            refute(canCounterCard);
        },
        'card was at the latest put down as station card'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [],
                        stationCards: [{ card: createCardData({ id: 'C1A' }), place: 'action' }]
                    }
                }
            }));
            testHelper.stub('queryEvents', 'P1A', {
                lastTookControlWithinTimeFrameSincePutDownCard: () => true,
                wasOpponentCardAtLatestPutDownInHomeZone: () => false,
                wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () => false,
                wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false
            });
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            refute(canCounterCard);
        },
        'card was at the latest put down in zone'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [createCardData({ id: 'C1A' })],
                    }
                }
            }));
            testHelper.stub('queryEvents', 'P1A', {
                lastTookControlWithinTimeFrameSincePutDownCard: () => true,
                wasOpponentCardAtLatestPutDownInHomeZone: () => true,
                wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () => false,
                wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false
            });
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            assert(canCounterCard);
        },
        'event card was at the latest both put down and discarded in the same turn'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        events: [
                            { type: 'takeControlOfOpponentsTurn', created: 0 }
                        ]
                    },
                    'P2A': {
                        phase: 'action',
                        discardedCards: [createCardData({ id: 'C1A', type: 'event' })],
                        events: [
                            { type: 'putDownCard', turn: 1, cardId: 'C1A', location: 'zone', created: 0 },
                            { type: 'discardCard', turn: 1, cardId: 'C1A' }
                        ]
                    }
                }
            }));
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            assert(canCounterCard);
        },
        'card was at the latest put down as extra station card'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [createCardData({ id: 'C1A' })],
                    }
                }
            }));
            testHelper.stub('queryEvents', 'P1A', {
                lastTookControlWithinTimeFrameSincePutDownCard: () => true,
                wasOpponentCardAtLatestPutDownInHomeZone: () => false,
                wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () => false,
                wasOpponentCardAtLatestPutDownAsExtraStationCard: () => true
            });
            const canThePlayer = testHelper.canThePlayer('P1A');

            const canCounterCard = canThePlayer.counterCard({ id: 'C1A' });

            assert(canCounterCard);
        }
    }
});

function stationCard(id, place) {
    return {
        place,
        flipped: false,
        card: { id }
    };
}
