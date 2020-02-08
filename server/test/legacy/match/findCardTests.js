const {
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    createState,
} = require('./shared.js');
const StateAsserter = require('../../testUtils/StateAsserter.js');

module.exports = {
    async setUp() {
        const firstPlayerConnection = FakeConnection2(['stateChanged']);
        const secondPlayerConnection = FakeConnection2(['stateChanged']);
        const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
        this.match = createMatch({ players });
        this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
        this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
    },
    'when select duration card for requirement with source "opponentCardsInZone"': {
        async setUp() {
            this.match.restoreFromState(createState({
                currentPlayer: 'P1A',
                turn: 2,
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        requirements: [
                            {
                                type: 'findCard',
                                cardGroups: [
                                    {
                                        source: 'opponentCardsInZone',
                                        cards: [{ id: 'C2A' }],
                                    }
                                ],
                                count: 1,
                                target: 'opponentDiscardPile'
                            }
                        ]
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [
                            createCard({ id: 'C2A', type: 'duration' }),
                        ]
                    }
                }
            }));
            this.match.selectCardForFindCardRequirement('P1A', {
                cardGroups: [{
                    source: 'opponentCardsInZone',
                    cardIds: ['C2A']
                }]
            });
        },
        'should discard opponents card'() {
            this.secondPlayerAsserter.send();
            this.secondPlayerAsserter.hasDiscardedCard('C2A');
        }
    }
};
