const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
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

describe('when phase is wait but is current player', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'wait'
        }));
        await timeout();
    });

    test('guide text should mention that you have taken control', async () => {
        assert.elementText('.guideText', 'Put down any 0-cost card');
        assert.elementText('.toggleControlOfTurn', 'Release control');
    });
});

describe('when phase is wait and is NOT current player', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P2A',
            phase: 'wait'
        }));
        await timeout();
    });

    test('guide text should mention that it is the opponents turn', async () => {
        assert.elementText('.guideText', 'Enemy turn');
        assert.elementText('.toggleControlOfTurn', 'Take control');
    });
});

describe('when phase is action but is not current player', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P2A',
            phase: 'action'
        }));
        await timeout();
    });

    test('guide text should mention that you do NOT have control', async () => {
        assert.elementText('.guideText', 'Your opponent has taken control');
        assert.elementText('.guideText-subText', 'wait to have it back');
    });
});

describe('when has taken control of the turn and is holding a 0 cost card', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'wait',
            cardsOnHand: [{ id: 'C1A', cost: 0 }]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');
    });

    test('should show zone ghost', async () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 1);
    });
});

describe('when has taken control of the turn and is holding a card costing more than 0', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'wait',
            cardsOnHand: [{ id: 'C1A', cost: 1 }]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');
    });

    test('should NOT show zone ghost', async () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 0);
    });
});