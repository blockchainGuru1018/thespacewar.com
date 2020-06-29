const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const MatchMode = require('../../shared/match/MatchMode.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const { createController } = require('../testUtils');
const {
    assert,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;
jest.mock('../utils/getCardImageUrl.js', () => ({ byCommonId: commonId => '/#' + commonId }));

beforeEach(() => {
    controller = createController();
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
});

describe('when player is chosen as "second player" and is holding card while opponent selects station card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = controller;
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P2A',
            phase: 'start',
            mode: MatchMode.selectStationCards,
            cardsOnHand: [createCard({ id: 'C1A', commonId: 'C1B' })],
            playerStationCards: [],
            opponentStationCards: []
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
        await timeout();

        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P2A',
            phase: 'start',
            mode: MatchMode.selectStationCards,
            cardsOnHand: [createCard({ id: 'C1A', commonId: 'C1B' })],
            playerStationCards: [],
            opponentStationCards: [{ place: 'draw' }]
        }));
        await timeout();
    });

    test('should still be holding card', async () => {
        assert.elementCount('.holdingCard', 1);
        const element = document.querySelector('.holdingCard');
        const imageUrl = element.style.backgroundImage.toString();
        assert(imageUrl.includes('C1B'));
    });
});
