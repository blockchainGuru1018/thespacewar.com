const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const OverCapacity = require('../../shared/card/OverCapacity.js');
const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

const OverCapacityCommonId = OverCapacity.CommonId;

test('trigger action "lookAtStationRow" for card OverCapacity', () => {
    const {
        firstPlayerAsserter,
        match
    } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            'P1A': {
                phase: 'action',
                cardsInZone: [createCard({ id: 'C1A', commonId: OverCapacityCommonId })],
                stationCards: [stationCard({ place: 'handSize' })]
            },
            'P2A': {}
        }
    });

    match.lookAtStationRow('P1A', { cardId: 'C1A', stationRow: 'handSize' });

    firstPlayerAsserter.hasRequirement({ type: 'findCard', count: 1 });
});

function stationCard({ place = 'draw', flipped, id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}
