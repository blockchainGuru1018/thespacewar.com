const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const DestinyDecided = require("../../shared/card/DestinyDecided.js");
const { createController } = require('../testUtils');
const {
    assert,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
});

describe('when opponent has Destiny Decided in play and holds event card in hand', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsOnHand: [createCard({ type: 'event' })],
            opponentCardsInZone: [createCard({ type: 'duration', commonId: DestinyDecided.CommonId })]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should see deactivated event card ghost', async () => {
        assert.elementCount('.playerEventCardGhost--deactivated', 1);
    });
});
