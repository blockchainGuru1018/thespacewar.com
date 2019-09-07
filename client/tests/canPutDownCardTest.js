const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const FakeMatchController = require('../testUtils/FakeMatchController.js');
const DestinyDecided = require("../../shared/card/DestinyDecided.js");
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const Neutralization = require("../../shared/card/Neutralization.js");
const { createController } = require('../testUtils');
const {
    assert,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

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

describe('when has Destiny decided in play and hold event card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [{ id: 'C1A', commonId: DestinyDecided.CommonId }],
            cardsOnHand: [{ id: 'C2A', type: 'event' }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should see "cannot play card" event ghost', () => {
        assert.elementCount('.playerEventCardGhost--deactivated', 1);
    });
});

describe('when does NOT have Destiny decided in play and hold event card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsOnHand: [{ id: 'C2A', type: 'event' }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should see zone ghosts', () => {
        assert.elementCount('.playerEventCardGhost', 1);
    });
});

describe('when has Destiny decided in play and has event card as flipped station card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [{ id: 'C1A', commonId: DestinyDecided.CommonId }],
            stationCards: [
                { id: 'C2A', place: 'draw', flipped: true, card: createCard({ id: 'C2A', type: 'event' }) },
                { id: 'C3A', place: 'draw' }
            ],
            events: [PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone' })]
        }));
        await timeout();
    });

    test('should NOT be able to move station card to zone', () => {
        assert.elementCount('.playerStationCards .moveToZone', 0);
    });
});

describe('when has Destiny decided in play and hold any card (not an event card as that is covered by previous tests)', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [{ id: 'C1A', commonId: DestinyDecided.CommonId }],
            cardsOnHand: [{ id: 'C2A', type: 'spaceShip' }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should NOT see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 0);
    });
});

describe('when opponent has Destiny decided in play and player has put down 1 card this turn and is holding a card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [{ id: 'C1A' }],
            cardsOnHand: [{ id: 'C2A' }],
            events: [PutDownCardEvent({ location: 'zone', cardId: 'C1A', turn: 1 })],
            opponentCardsInZone: [{ id: 'C1A', type: 'duration', commonId: DestinyDecided.CommonId }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should NOT see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 0);
    });
});

describe('when opponent has Destiny decided in play and player has put down 1 card this turn and is holding a card, but player has Neutralization in play', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [{ id: 'C1A', type: 'duration', commonId: Neutralization.CommonId }],
            cardsOnHand: [{ id: 'C2A' }],
            events: [PutDownCardEvent({ location: 'zone', cardId: 'C1A', turn: 1 })],
            opponentCardsInZone: [{ id: 'C1A', type: 'duration', commonId: DestinyDecided.CommonId }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 1);
    });
});

describe('when opponent has Destiny decided in play and player has NOT put down ANY card this turn and is holding a card', () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            cardsInZone: [],
            cardsOnHand: [{ id: 'C2A' }],
            events: [],
            opponentCardsInZone: [{ id: 'C1A', type: 'duration', commonId: DestinyDecided.CommonId }]
        }));
        await timeout();

        await click('.playerCardsOnHand .cardOnHand');
    });

    test('should see zone ghosts', () => {
        assert.elementCount('.playerCardsInZone .card-ghost', 1);
    });
});
