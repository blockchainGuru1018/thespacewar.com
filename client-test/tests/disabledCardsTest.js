const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const Neutralization = require('../../shared/card/Neutralization.js');
const DisturbingSensor = require('../../shared/card/DisturbingSensor.js');
const { createController } = require('../matchTestUtils/index.js');
const {
    assert,
    sinon,
    timeout,
} = require('../bocha-jest/bocha-jest.js');

let controller;
let matchController;

function setUpController(optionsAndPageDeps = {}) { //Has side effects to afford a convenient tear down
    matchController = FakeMatchController();
    controller = createController({ matchController, ...optionsAndPageDeps });

    return controller;
}

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
    matchController = null;
    controller = null;
});

describe('when has duration card Neutralization and other duration card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'draw',
            playerCardsInDeckCount: 1,
            cardsInZone: [
                { id: 'C1A', type: 'duration', commonId: Neutralization.CommonId },
                { id: 'C2A', type: 'duration' }
            ]
        }));
        await timeout();
    });

    test('other, now disabled, duration card should have a disabled overlay', () => {
        assert.elementCount('.playerCardsInZone .card:eq(1) .cardDisabledOverlay', 1);
    });
});

describe('when has Disturbing Sensor and a missile in play and opponent has a missile in play', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'draw',
            playerCardsInDeckCount: 1,
            cardsInZone: [
                { id: 'C1A', type: 'spaceShip', commonId: DisturbingSensor.CommonId },
                { id: 'C2A', type: 'missile' }
            ],
            opponentCardsInZone: [
                { id: 'C3A', type: 'missile' }
            ]
        }));
        await timeout();
    });

    test('opponent missile card should have a disabled overlay', () => {
        assert.elementCount('.opponentCardsInZone .card .cardDisabledOverlay', 1);
    });

    test('player missile card should NOT have a disabled overlay', () => {
        assert.elementCount('.playerCardsInZone .cardDisabledOverlay', 0);
    });
});
