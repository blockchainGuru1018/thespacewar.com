const {
    assert,
} = require('../testUtils/bocha-jest/bocha');
const createCard = require('../testUtils/FakeCardDataAssembler.js').createCard;
const TestHelper = require('../fakeFactories/TestHelper.js');
const createState = require('../fakeFactories/createState.js');

module.exports = {
    'opponentAny': {
        'asd'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [
                            { id: 'C1A' },
                            { id: 'C2A' }
                        ]
                    }
                }
            }));
            testHelper.stub('canThePlayer', 'P1A', {
                counterCard: card => card.id === 'C1A'
            });
            const sourceFetcher = testHelper.sourceFetcher('P1A');
            const triggerCard = { canCounterCard: otherCard => otherCard.id === 'C1A' };

            const cards = sourceFetcher.opponentAny({ canBeCountered: true }, { triggerCard });

            assert.equals(cards.length, 1);
            assert.equals(cards[0].id, 'C1A');
        }
    },
    'can get draw station cards': function () {
        const testHelper = TestHelper(createState({
            currentPlayer: 'P1A',
            playerStateById: {
                'P1A': {
                    stationCards: [
                        { place: 'draw', card: createCard({ id: 'C1A' }) }
                    ]
                }
            }
        }));
        const sourceFetcher = testHelper.sourceFetcher('P1A');

        const cards = sourceFetcher.drawStationCards();

        assert.equals(cards.length, 1);
        assert.match(cards[0], { id: 'C1A' });
    }
};
