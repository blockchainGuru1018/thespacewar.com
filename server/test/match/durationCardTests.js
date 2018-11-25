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
let PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
let MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');

module.exports = {
    'when try to move duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                }
            }
        }));

        let error = catchError(() => this.match.moveCard('P1A', 'C1A'));

        assert(error);
        assert.equals(error.message, 'Cannot move card');
    },
    'when try to attack with duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                },
                'P2A': {
                    phase: 'attack',
                    cardsInOpponentZone: [createCard({ id: 'C2A' })],
                    events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                }
            }
        }));

        let error = catchError(() => this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot attack with card');
    },
    'when try to attack a duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                },
                'P2A': {
                    phase: 'attack',
                    cardsInOpponentZone: [createCard({ id: 'C2A', type: 'duration' })],
                    events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                }
            }
        }));

        let error = catchError(() => this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot attack that card');
    }
};