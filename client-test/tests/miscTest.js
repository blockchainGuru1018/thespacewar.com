const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const { createController } = require('../matchTestUtils/index.js');
const {
    assert,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../bocha-jest/bocha-jest.js');

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

let controller;

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();
    controller && controller.tearDown();
});

describe('misc', async () => {
    test('when in "start" phase and click card on hand should NOT see ANY card ghosts', async () => {
        const { dispatch, showPage } = controller;
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'start',
            cardsOnHand: [createCard({ id: 'C1A' })],
            stationCards: [{ place: 'draw' }]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');

        assert.elementCount('.card-ghost', 0);
    });
});