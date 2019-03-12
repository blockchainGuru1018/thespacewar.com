const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const { createController } = require('../matchTestUtils/index.js');
const {
    assert,
    refute,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../bocha-jest/bocha-jest.js');

let controller;
let matchController;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    matchController = FakeMatchController();
    controller = createController({ matchController });
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
    matchController = null;
    controller = null;
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

describe('when in discard phase and is required to discard 2 cards', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = controller;
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'discard',
            cardsOnHand: [
                createCard({ id: 'C1A' }),
                createCard({ id: 'C2A' })
            ],
        }));
        await timeout();
    });

    test('and discards 2 cards should at least go to next phase', async () => {
        await click('.field-playerCardsOnHand .cardOnHand:eq(0)');
        await click('.field-player .discardPile-cardGhost');
        await click('.field-playerCardsOnHand .cardOnHand');
        await click('.field-player .discardPile-cardGhost');

        assert.calledWith(matchController.emit, 'nextPhase');
    });

    test('and discards 1 card', async () => {
        await click('.field-playerCardsOnHand .cardOnHand:eq(0)');
        await click('.field-player .discardPile-cardGhost');

        refute.calledWith(matchController.emit, 'nextPhase');
    });
});