const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const ExcellentWork = require('../../shared/card/ExcellentWork.js');
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
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

describe('when has already put down station card this turn and holding Excellent work', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C0A', place: 'action' },
                { id: 'C1A', place: 'action' }
            ],
            cardsOnHand: [{ id: 'C2A', cost: 1, commonId: ExcellentWork.CommonId }],
            events: [
                PutDownCardEvent({
                    turn: 1,
                    location: 'station-action',
                    cardId: 'C1A'
                })
            ]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');
    });

    test('should NOT show station ghosts', () => {
        assert.elementCount('.playerStationCards .card-ghost', 0);
    });

    test('should see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 1);
    });
});

describe('when has already put down station card this turn and holding Excellent work and cannot afford card', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'action' }
            ],
            cardsOnHand: [{ id: 'C2A', cost: 1, commonId: ExcellentWork.CommonId }],
            events: [
                PutDownCardEvent({
                    turn: 1,
                    location: 'station-action',
                    cardId: 'C1A'
                })
            ]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');
    });

    test('should NOT show station ghosts', () => {
        assert.elementCount('.playerStationCards .card-ghost', 0);
    });

    test('should NOT see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 0);
    });
});

describe('when has NOT put down station card this turn and holding Excellent work and cannot afford card', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw' }
            ],
            cardsOnHand: [{ id: 'C2A', cost: 1, commonId: ExcellentWork.CommonId }],
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');
    });

    test('should show station ghosts', () => {
        assert.elementCount('.playerStationCards .card-ghost', 3);
    });

    test('should NOT see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 0);
    });
});

describe('putting down card and selecting choice "Put down as extra station card"', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsOnHand: [{ id: 'C1A', commonId: ExcellentWork.CommonId }]
        }));
        await timeout();
        await click('.field-playerCardsOnHand .cardOnHand');
        await click('.playerCardsInZone .card-ghost');

        await click('.cardChoiceDialog-choice:contains("Put down as extra station card")');
    });

    test('should ONLY show station ghosts', async () => {
        assert.elementCount('.card-ghost', 3);
        assert.elementCount('.playerStationCards .card-ghost', 3);
    });
});

describe('have put down Excellent work and selected "Put down as extra station card"', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsOnHand: [{ id: 'C1A', commonId: ExcellentWork.CommonId }]
        }));
        await timeout();
        await click('.field-playerCardsOnHand .cardOnHand');
        await click('.playerCardsInZone .card-ghost');
        await click('.cardChoiceDialog-choice:contains("Put down as extra station card")');
    });

    test('when put down in first station row should emit putDownCard', async () => {
        await click('.playerStationCards .card-ghost:eq(0)');

        assert.calledWith(matchController.emit, 'putDownCard', {
            location: 'station-draw',
            cardId: 'C1A',
            choice: 'putDownAsExtraStationCard'
        });
    });
});

describe('when has excellent work as flipped station card and move it to zone', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            stationCards: [
                { id: 'C1A', place: 'draw', },
                {
                    id: 'C2A',
                    place: 'draw',
                    flipped: true,
                    card: createCard({ id: 'C2A', commonId: ExcellentWork.CommonId })
                },
            ]
        }));
        await timeout();
        await click('.playerStationCards .movable');
    });

    test('should show choice dialog', async () => {
        assert.elementCount('.cardChoiceDialog', 1);
    });
});