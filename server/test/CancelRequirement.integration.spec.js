const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

test('when has 1 cancelable requirement and cancels requirement', () => {
    const {
        firstPlayerAsserter,
        match
    } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            'P1A': {
                requirements: [cancelableWithCountOneAndOneCard('C1A')]
            },
            'P2A': {}
        }
    });

    match.cancelRequirement('P1A');

    firstPlayerAsserter.refuteHasRequirement({ type: 'findCard' });
});

function cancelableWithCountOneAndOneCard(cardId) {
    return {
        type: 'findCard',
        count: 1,
        cardGroups: [{ source: 'deck', cards: [createCard({ id: cardId })] }],
        cardCommonId: '17',
        cancelable: true,
    };
}
