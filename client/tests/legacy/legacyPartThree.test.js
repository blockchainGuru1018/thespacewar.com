const FakeCardDataAssembler = require('../../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const AttackEvent = require('../../../shared/event/AttackEvent.js');
const getCardImageUrl = require('../../utils/getCardImageUrl.js');
const FakeState = require('../../testUtils/FakeState.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const { createController: createTestController } = require('../../testUtils');
const {
    assert,
    sinon,
    timeout,
    stub,
    dom: {
        click
    }
} = require('../../testUtils/bocha-jest/bocha-jest.js');

const FatalErrorCommonId = '38';
const TriggerHappyJoeCommonId = '24';

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

describe('Fatal Error:', () => {
    describe('when put down card Fatal Error', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: FatalErrorCommonId }],
                cardsInZone: [{ id: 'C2A' }],
                cardsInOpponentZone: [{ id: 'C3A' }],
                stationCards: [
                    { place: 'draw', id: 'C4A' },
                    { place: 'draw', id: 'C9A', flipped: true, card: createCard({ id: 'C9A' }) }
                ],
                opponentCardsInZone: [{ id: 'C5A' }],
                opponentCardsInPlayerZone: [{ id: 'C6A' }],
                opponentStationCards: [
                    { place: 'draw', id: 'C7A', flipped: false },
                    { place: 'draw', id: 'C8A', flipped: true, card: createCard({ id: 'C8A' }) }
                ]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');

            await click('.playerEventCardGhost');
        });
        test('should have card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 2);
        });
        test('should NOT have card in hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 0);
        });
        test('should NOT have discarded card', () => {
            assert.elementCount('.field-discardPile .card-faceDown', 0);
        });
        test('should show guide text', () => {
            assert.elementText('.guideText', 'Select any card to destroy');
        });
        test('should be able to select opponent card in home zone', () => {
            assert.elementCount('.opponentCardsInPlayerZone .selectable', 1);
        });
        test('should be able to select opponent card in opponent zone', () => {
            assert.elementCount('.opponentCardsInZone .selectable', 1);
        });
        test('should NOT be able to select opponents unflipped station card', () => {
            assert.elementCount('.field-opponent .stationCard:not(.stationCard--flipped) .selectable', 0);
        });
        test('should be able to select opponents flipped station card', () => {
            assert.elementCount('.field-opponent .stationCard--flipped .selectable', 1);
        });
        test('should NOT be able to select first player card in home zone', () => {
            assert.elementCount('.playerCardsInZone .card:eq(0) .selectable', 0);
        });
        test('should NOT be able to select players second card in home zone', () => {
            assert.elementCount('.playerCardsInZone .card:eq(1) .selectable', 0);
        });
        test('should NOT be able to select player card in opponent zone', () => {
            assert.elementCount('.playerCardsInOpponentZone .selectable', 0);
        });
        test('should NOT be able to select player station card', () => {
            assert.elementCount('.field-player .stationCard .selectable', 0);
        });
        test('should NOT be able to move own flipped station card', () => {
            assert.elementCount('.stationCard .moveToZone', 0);
        });
    });
    describe('when move Fatal Error from station to zone', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                stationCards: [
                    { place: 'action', id: 'S1A' },
                    {
                        place: 'draw',
                        id: 'C2A',
                        card: createCard({ id: 'C2A', commonId: FatalErrorCommonId, cost: 0 }),
                        flipped: true
                    }
                ],
                events: [PutDownCardEvent({
                    turn: 1,
                    location: 'station-draw',
                    cardId: 'C2A',
                    cardCommonId: FatalErrorCommonId
                })]
            }));
            await timeout();

            await click('.stationCard .moveToZone');
        });
        test('should have card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
        });
        test('should NOT have card among station cards', () => {
            assert.elementCount('.field-player .stationCard', 1);
        });
        test('should NOT have discarded card', () => {
            assert.elementCount('.field-discardPile .card-faceDown', 0);
        });
        test('should show guide text', () => {
            assert.elementText('.guideText', 'Select any card to destroy');
        });
    });
    describe.skip('when put down card Fatal Error and then select opponent card in player zone', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: FatalErrorCommonId }],
                cardsInZone: [{ id: 'C2A' }],
                cardsInOpponentZone: [{ id: 'C3A' }],
                stationCards: [{ place: 'draw', id: 'S1A' }],
                opponentCardsInZone: [{ id: 'C4A' }],
                opponentCardsInPlayerZone: [{ id: 'C5A' }],
                opponentStationCards: [{ place: 'draw', id: 'S2A' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C2A' }),
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C3A' })
                ]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');

            await click('.opponentCardsInPlayerZone .card:eq(0) .selectable');
        });
        test('should NOT have card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
        });
        test('should NOT have card in hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 0);
        });
        test('should have discarded card', () => {
            assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
        });
        test('should NOT show guide text', () => {
            assert.elementCount('.guideText', 0);
        });
        test('should NOT be able to select ANY card', () => {
            assert.elementCount('.selectable', 0);
        });
        test('should emit put down card with opponent card id as "choice"', () => {
            assert.calledWith(matchController.emit, 'putDownCard', {
                location: 'zone',
                cardId: 'C1A',
                choice: 'C5A'
            });
        });
    });
});
describe.skip('Trigger happy joe:', () => {
    describe('when moved to opponent zone last turn and has attacked station card once this turn and ready card again for attack', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{
                    id: 'C1A',
                    attack: 1,
                    type: 'spaceShip',
                    commonId: TriggerHappyJoeCommonId
                }],
                stationCards: [{ place: 'draw', id: 'S1A' }],
                opponentStationCards: [
                    { place: 'draw', id: 'S2A', flipped: true, card: createCard({ id: 'C2A' }) },
                    { place: 'draw', id: 'S3A' }
                ],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' }),
                    AttackEvent({ turn: 3, attackerCardId: 'C1A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .card .readyToAttack');
        });
        test('should be able to attack another unflipped station card', () => {
            assert.elementCount('.field-opponentStation .attackable', 1);
        });
    });
});
