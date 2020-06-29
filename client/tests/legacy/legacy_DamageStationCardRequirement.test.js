const FakeCardDataAssembler = require('../../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const getCardImageUrl = require('../../utils/getCardImageUrl.js');
const FakeState = require('../../testUtils/FakeState.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const Commander = require("../../../shared/match/commander/Commander.js");
const { createController: createTestController } = require('../../testUtils');
const {
    assert,
    refute,
    sinon,
    timeout,
    stub,
    fakeClock,
    dom: {
        click
    }
} = require('../../testUtils/bocha-jest/bocha-jest.js');

const FastMissileId = '6';

let controller;
let matchController;
let clock;

function createController({ matchController = FakeMatchController() } = {}) { //Has side effects to afford a convenient tear down
    controller = createTestController({ matchController });
    return controller;
}

beforeEach(async () => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

afterEach(() => {
    clock && clock.restore();
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();

    controller = null;
    clock = null;
    matchController = null;
});

describe('damage station card requirement', () => {
    describe('when have damageStationCard requirement', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'draw' }, { place: 'draw' }, { place: 'draw' }],
                opponentStationCards: [{ place: 'draw' }],
                requirements: [{ type: 'damageStationCard', count: 2 }]
            }));
            await timeout();
        });
        test('should NOT show next phase button', () => {
            assert.elementCount('.nextPhaseButton', 0);
        });
        test('should NOT show end turn button', () => {
            assert.elementCount('.nextPhaseButton-endTurn', 0);
        });
        test('should show guide text', () => {
            assert.elementText('.guideText', 'Select 2 station cards to damage');
        });
        test('should NOT be able to select own station card', () => {
            assert.elementCount('.field-player .stationCard .selectable', 0);
        });
    });
    describe('when in action phase with damageStationCard requirement and opponent has flipped station card and click on card in hand', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [createCard({ id: 'C1A' })],
                requirements: [{ type: 'damageStationCard', count: 1 }],
                opponentStationCards: [
                    { place: 'draw' },
                    { card: createCard({ id: 'C2A' }), place: 'draw', flipped: true }
                ]
            }));
            await timeout();

            await click('.playerCardsOnHand .cardOnHand');
        });
        test('should NOT be able to move station cards to zone', () => {
            assert.elementCount('.stationCard .moveToZone', 0);
        });
    });
    describe('when in action phase with a damageStationCard requirement and opponent has station cards and has an affordable card on hand and click on card in hand', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [createCard({ id: 'C1A' })],
                requirements: [{ type: 'damageStationCard', count: 1 }],
                opponentStationCards: [
                    { place: 'action' },
                    { card: createCard({ id: 'C2A' }), place: 'action', flipped: true }
                ]
            }));
            await timeout();

            await click('.playerCardsOnHand .cardOnHand');
        });
        test('should NOT show ANY card ghosts', () => {
            assert.elementCount('.card-ghost', 0);
        });
    });
    describe('when have damageStationCard requirement and 1 of 2 opponent station cards is flipped', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                requirements: [{ type: 'damageStationCard', count: 1 }],
                opponentStationCards: [
                    { place: 'draw' },
                    { card: createCard({ id: 'C2A' }), place: 'draw', flipped: true }
                ],
            }));
            await timeout();
        });
        test('should NOT be able to select flipped station card', () => {
            assert.elementCount('.field-opponent .stationCard--flipped', 1);
            assert.elementCount('.field-opponent .stationCard--flipped .selectable', 0);
        });
    });
    describe('when have damageStationCard requirement with count 2 and click on 1 station card ', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                requirements: [{ type: 'damageStationCard', count: 2 }],
                opponentStationCards: [{ place: 'draw' }, { place: 'draw' }, { place: 'draw' }],
            }));
            await timeout();

            await click('.field-opponent .stationCard:eq(0) .selectable');
        });
        test('should NOT show next phase button', () => {
            assert.elementCount('.nextPhaseButton', 0);
        });
        test('should NOT show end turn button', () => {
            assert.elementCount('.nextPhaseButton-endTurn', 0);
        });
        test('should show guide text', () => {
            assert.elementText('.guideText', 'Select 1 station card to damage');
        });
        test('should show clicked station card as selected', () => {
            assert.elementCount('.field-opponent .stationCard:eq(0).selected--danger', 1);
        });
        test('should NOT be able to selected clicked station card', () => {
            assert.elementCount('.field-opponent .stationCard:eq(0) .selectable', 0);
        });
    });
    describe('when have damageStationCard requirement with count of 1 and click on station card and requirement is removed', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{ type: 'damageStationCard', count: 1 }],
                opponentStationCards: [{ id: 'S1A', place: 'draw' }, { id: 'S2A', place: 'draw' }],
            }));
            await timeout();

            await click('.field-opponent .stationCard:eq(0) .selectable');
            dispatch('stateChanged', {
                requirements: []
            });
            await timeout();
        });
        test('should NOT show next phase button', () => {
            assert.elementCount('.nextPhaseButton', 1);
        });
        test('should NOT show guide text', () => {
            assert.elementCount('.guideText', 0);
        });
        test('should NOT be able to select any station card', () => {
            assert.elementCount('.stationCard .selectable', 0);
        });
        test('should emit "damageStationCards"', () => {
            assert.calledWith(matchController.emit, 'damageStationCards', {
                targetIds: ['S1A']
            });
        });
    });
    describe('when completed damageStationCard requirement and then get another one and select another station', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{ type: 'damageStationCard', count: 1 }],
                opponentStationCards: [
                    { id: 'S1A', place: 'draw' },
                    { id: 'S2A', place: 'draw' },
                    { id: 'S3A', place: 'draw' }
                ],
            }));
            await timeout();
            await click('.field-opponent .stationCard:eq(0) .selectable');
            dispatch('stateChanged', {
                requirements: [{ type: 'damageStationCard', count: 1 }]
            });
            await timeout();

            await click('.field-opponent .stationCard:eq(1) .selectable');
        });
        test('should emit "damageStationCards" twice and second time with the second station card ID', () => {
            assert.calledTwiceWith(matchController.emit, 'damageStationCards');
            assert.calledWith(matchController.emit, 'damageStationCards', {
                targetIds: ['S2A']
            });
        });
    });
});
