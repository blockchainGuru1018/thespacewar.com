const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const { createController } = require('../matchTestUtils/index.js');
const {
    assert,
    refute,
    timeout,
    stub,
    dom: {
        click
    }
} = require('../bocha-jest/bocha-jest.js');

let controller;
let matchController;

function setUpController(optionsAndPageDeps = {}) { //Has side effects to afford a convenient tear down
    matchController = FakeMatchController();
    controller = createController({ matchController, ...optionsAndPageDeps });

    return controller;
}

beforeEach(() => {
    getCardImageUrl.byCommonId = commonId => `/${commonId}`
});

afterEach(() => {
    controller && controller.tearDown();
    matchController = null;
    controller = null;
});

describe('when has unflipped 2 station cards and click overwork', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { place: 'action', id: 'C1A' },
                { place: 'action', id: 'C2A' }
            ]
        }));
        await timeout();

        await click('.overwork');
    });

    test('should emit overwork', async () => {
        assert.calledOnceWith(matchController.emit, 'overwork');
    });
});

describe('when has 1 unflipped station card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { place: 'action', id: 'C1A' },
            ]
        }));
        await timeout();
    });

    test('should NOT see overwork button', async () => {
        assert.elementCount('.overwork', 0);
    });
});
