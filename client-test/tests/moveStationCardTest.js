const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const Commander = require("../../shared/match/commander/Commander.js");
const { createController } = require('../matchTestUtils/index.js');
const {
    assert,
    timeout,
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

describe('when has 1 station card in draw row in action phase and click move', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw' }
            ],
            commanders: [Commander.KeveBakins]
        }));
        await timeout();
        await click('.playerStationCards .stationCard .moveToOtherStationRow');
    });

    test('should ONLY show station ghosts', async () => {
        assert.elementCount('.card-ghost', 3);
        assert.elementCount('.playerStationCards .card-ghost', 3);
    });

    test('should NOT show card being moved', async () => {
        assert.elementCount('.playerStationCards .stationCard', 0);
    });
});

describe('when move station card from draw row to action row', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw' }
            ],
            commanders: [Commander.KeveBakins]
        }));
        await timeout();

        await click('.playerStationCards .stationCard .moveToOtherStationRow');
        await click('.playerStationCards .card-ghost:eq(1)');
    });

    test('should emit move station card', async () => {
        assert.calledWith(matchController.emit, 'moveStationCard', { cardId: 'C1A', location: 'station-action' });
    });
});
