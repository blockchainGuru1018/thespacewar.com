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
const DrawCardEvent = require('../../shared/event/DrawCardEvent.js');

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

describe('when in draw phase and can draw 2 cards per turn and has drawn 1 card already', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'draw',
            stationCards: [
                stationCard('S1A', 'draw'),
                stationCard('S2A', 'draw')
            ],
            events: [DrawCardEvent({ type: 'drawCard', turn: 1 })]
        }));
        await timeout();
    });

    test('should show that there is 1 card left to draw', async () => {
        assert.elementTextStartsWith('.guideText', 'Draw 1 card');
    });
});

function stationCard(id, place) {
    return {
        id,
        place,
        card: { id }
    };
}
