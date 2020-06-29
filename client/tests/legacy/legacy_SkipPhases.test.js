const FakeCardDataAssembler = require('../../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const getCardImageUrl = require('../../utils/getCardImageUrl.js');
const FakeState = require('../../testUtils/FakeState.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const { createController: createTestController } = require('../../testUtils');
const {
    assert,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../../testUtils/bocha-jest/bocha-jest.js');

const CommonShipId = '25';
const FastMissileId = '6';

let controller;
let matchController;

function createController({ matchController = FakeMatchController() } = {}) { //Has side effects to afford a convenient tear down
    controller = createTestController({ matchController });
    return controller;
}

beforeEach(async () => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();

    controller = null;
    matchController = null;
});

describe('skip phases with NO actions:', () => {
    describe('when in draw phase with NO station cards in draw row but 1 in action row should show next phase button to Action phase', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'action' }]
            }));
            await timeout();
        });
        test('should show next phase as Action phase', () => {
            assert.elementText('.nextPhaseButton', 'Go to action phase');
        });
    });
    describe('when in action phase with no cards to discard and no cards in play should show next phase as End turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action'
            }));
            await timeout();
        });
        test('should show next phase as End turn', () => {
            assert.elementCount('.nextPhaseButton-endTurn', 1);
        });
    });
    describe('when in action phase with no cards to discard and no cards in play and click "End turn"', () => {
        beforeEach(async () => {
            matchController = FakeMatchController();
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action'
            }));
            await timeout();

            await click('.nextPhaseButton-endTurn');
        });
        test('should skip to end of turn', () => {
            assert.calledThriceWith(matchController.emit, 'nextPhase');
        });
    });
    describe('when in action phase with no cards to discard and 1 in play that can move', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsInZone: [createCard({ id: 'C1A', commonId: CommonShipId })],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone', cardCommonId: CommonShipId })]
            }));
            await timeout();
        });
        test('should see next phase as "Attack phase"', () => {
            assert.elementText('.nextPhaseButton', 'Go to attack phase');
        });
    });
    describe('when in action phase with no cards to discard and 1 in play in opponent zone that can move', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsInOpponentZone: [createCard({ id: 'C1A', commonId: CommonShipId })],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone', cardCommonId: CommonShipId }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A', cardCommonId: CommonShipId })
                ]
            }));
            await timeout();
        });
        test('should see next phase as "Attack phase"', () => {
            assert.elementText('.nextPhaseButton', 'Go to attack phase');
        });
    });
    describe('when in action phase with no cards to discard and 1 in play in opponent zone that can NOT move', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsInOpponentZone: [createCard({ id: 'C1A', commonId: CommonShipId })],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone', cardCommonId: CommonShipId }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A', cardCommonId: CommonShipId })
                ]
            }));
            await timeout();
        });
        test('should see "End turn" button', () => {
            assert.elementCount('.nextPhaseButton-endTurn', 1);
        });
    });
    describe('when in action phase with no cards to discard and has 1 fast missile in play', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsInZone: [createCard({ id: 'C1A', commonId: FastMissileId })],
                events: [PutDownCardEvent({
                    turn: 1,
                    cardId: 'C1A',
                    location: 'zone',
                    cardCommonId: FastMissileId
                })]
            }));
            await timeout();
        });
        test('should NOT see end turn button', () => {
            assert.elementCount('.nextPhaseButton-endTurn', 0);
        });
        test('should see next phase as "Attack phase"', () => {
            assert.elementText('.nextPhaseButton', 'Go to attack phase');
        });
    });
});
