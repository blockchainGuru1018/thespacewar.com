const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const RepairCardEvent = require('../../../shared/event/RepairCardEvent.js');
const AttackEvent = require('../../../shared/event/AttackEvent.js');
const getCardImageUrl = require('../../../client/utils/getCardImageUrl.js');
const FakeState = require('../../matchTestUtils/FakeState.js');
const FakeMatchController = require('../../matchTestUtils/FakeMatchController.js');
const Commander = require("../../../shared/match/commander/Commander.js");
const { createController: createTestController } = require('../../matchTestUtils');
const {
    assert,
    sinon,
    timeout,
    stub,
    dom: {
        click
    }
} = require('../../bocha-jest/bocha-jest.js');

const EnergyShieldCommonId = '21';
const SmallRepairShopId = '29';

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

describe('attack', () => {
    describe('when player has card in opponent zone and opponent has 1 defense card', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInZone: [{ id: 'C2A,', type: 'defense' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();
        });
        test('player card should be able to attack', () => {
            assert.elementCount('.playerCardsInOpponentZone .readyToAttack', 1);
        });
    });
    // describe('when player has 1 card in opponent zone and opponent has 1 duration card in its zone', () => {
    //     beforeEach(async () => {
    //         const { dispatch } = createController();
    //         controller.showPage();
    //
    //         dispatch('stateChanged', FakeState({
    //             turn: 2,
    //             currentPlayer: 'P1A',
    //             phase: 'attack',
    //             cardsInOpponentZone: [{ id: 'C1A', attack: 1 }],
    //             opponentCardsInZone: [{ id: 'C2A,', type: 'duration' }],
    //             events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
    //         }));
    //         await timeout();
    //     });
    //     test('player card should not be able to attack', () => {
    //         assert.elementCount('.playerCardsInOpponentZone .readyToAttack', 0);
    //     });
    // });
});

describe('duration cards', () => {
    describe('when has duration in play and is your turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                cardsInZone: [{ id: 'C1A', type: 'duration' }]
            }));

            dispatch('nextPlayer', { turn: 2, currentPlayer: 'P1A' });
            await timeout();
        });
    });
    describe('when in preparation phase with 2 duration cards and click and discards the first', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                phase: 'preparation',
                currentPlayer: 'P1A',
                cardsInZone: [{ id: 'C1A', type: 'duration' }, { id: 'C2A', type: 'duration' }]
            }));
            await timeout();

            await click('.card[data-type="duration"]:eq(0) .discard');
        });
        test('should emit discardDurationCard', () => {
            assert.calledOnceWith(matchController.emit, 'discardDurationCard', 'C1A');
        });
        test('should remove card from own field', () => {
            assert.elementCount('.field-playerZoneCards .card[data-type="duration"]', 1);
        });
        test('should put card in discard pile', () => {
            assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
        });
    });
    describe('when in preparation phase and go to next phase', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                phase: 'preparation',
                currentPlayer: 'P1A'
            }));
            await timeout();

            await click('.nextPhaseButton');
        });
        test('should emit next phase', () => {
            assert.calledOnceWith(matchController.emit, 'nextPhase');
        });
    });
    describe('when in preparation phase and discard all duration cards should AUTOMATICALLY go to the draw phase', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                phase: 'preparation',
                currentPlayer: 'P1A',
                cardsInZone: [{ id: 'C1A', type: 'duration' }]
            }));
            await timeout();

            await click('.card[data-type="duration"] .discard');
        });
        test('should emit next phase', () => {
            assert.calledOnceWith(matchController.emit, 'nextPhase');
        });
    });
    describe('on "opponentDiscardedDurationCard"', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                currentPlayer: 'P2A',
                opponentCardsInZone: [{ id: 'C1A' }]
            }));
            await timeout();

            dispatch('opponentDiscardedDurationCard', { card: createCard({ id: 'C1A' }) });
        });
        test('should show card in discarded pile', () => {
            assert.elementCount('.field-opponent .field-discardPile .card[data-cardId="C1A"]', 1);
        });
        test('should NOT show card in opponent zone', () => {
            assert.elementCount('.field-opponent .field-zone .card--turnedAround', 0);
        });
    });
});

describe('behaviour - Small Repair Shop', () => {
    describe('when has card in zone and a damaged card in same zone BUT is action phase', () => {
        beforeEach(async () => {
            const events = [
                PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                PutDownCardEvent({ turn: 1, cardId: 'C2A' })
            ];
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 1 }],
                events
            }));
            await timeout();
        });
        test('should NOT be able to select card for repair', () => {
            assert.elementCount('.repair', 0);
        });
    });
    describe.skip('when has card in zone, a damaged card in same zone, a station card and a flipped station card', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const events = [
                PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                PutDownCardEvent({ turn: 1, cardId: 'C2A' })
            ];
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 1 }],
                stationCards: [
                    { id: 'C3A', place: 'draw', flipped: true, card: createCard({ id: 'C3A' }) },
                    { id: 'C4A', place: 'draw' }
                ],
                events
            }));
            await timeout();
        });
        test('should be able to choose repair for Small Repair Shop', () => {
            assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 1);
        });
        test('should show damage indicator for other card', () => {
            assert.elementText('.card-damageIndicator', '1');
        });
        describe('and click repair', () => {
            beforeEach(async () => {
                await click('.field-playerZoneCards .card:eq(0) .repair');
            });
            test('should NOT be able to select for attack', () => {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .readyToAttack', 0);
            });
            test('should NOT be able to select for move', () => {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .movable', 0);
            });
            test('should be able to select station card for repair', () => {
                assert.elementCount('.playerStationCards .selectForRepair', 1);
            });
            describe('and click selectForRepair on damaged card', () => {
                beforeEach(async () => {
                    await click('.field-playerZoneCards .card:eq(1) .selectForRepair');
                });
                test('should NOT be able to choose repair for Small Repair Shop', () => {
                    assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
                });
            });
            describe('and click selectForRepair on flipped station card', () => {
                beforeEach(async () => {
                    await click('.playerStationCards .selectForRepair');
                });
                test('should NOT be able to choose repair for Small Repair Shop', () => {
                    assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
                });
                test('should emit repair card', () => {
                    assert.calledOnceWith(matchController.emit, 'repairCard', {
                        repairerCardId: 'C1A',
                        cardToRepairId: 'C3A'
                    });
                });
            });
        });
    });
    describe.skip('when repair 3 damage of card with 4 damage and has opponent card in zone', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 4 }],
                opponentCardsInPlayerZone: [{ id: 'C3A' }],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, cardId: 'C2A' })
                ]
            }));
            await timeout();

            await click('.field-playerZoneCards .card:eq(0) .repair');
            await click('.field-playerZoneCards .card:eq(1) .selectForRepair');
        });
        test('should emit repair card', () => {
            assert.calledOnceWith(matchController.emit, 'repairCard', {
                repairerCardId: 'C1A',
                cardToRepairId: 'C2A'
            });
        });
        test('should NOT be able to still select card for repair', () => {
            assert.elementCount('.field-playerZoneCards .card:eq(0) .selectForRepair', 0);
        });
    });
    describe('when has repaired this turn and has card in same zone with damage', () => {
        beforeEach(async () => {
            const events = [
                PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                PutDownCardEvent({ turn: 1, cardId: 'C2A' }),
                RepairCardEvent({ turn: 2, cardId: 'C1A' })
            ];
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 1 }],
                events
            }));
            await timeout();
        });
        test('should NOT be able to choose repair for Small Repair Shop', () => {
            assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
        });
    });
    describe('when has card in zone and there is NO damaged ship in same zone', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                cardsInZone: [{ id: SmallRepairShopId }],
                events: [PutDownCardEvent({ turn: 1, cardId: SmallRepairShopId })]
            }));
            await timeout();
        });
        test('should NOT be able to choose repair for Small Repair Shop', () => {
            assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
        });
    });
});
describe.skip('behaviour - Energy Shield', () => {
    describe('when ready card for attack in opponent zone and they have an Energy shield', () => {
        beforeEach(async () => {
            const events = [
                PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                MoveCardEvent({ turn: 2, cardId: 'C1A' })
            ];
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInZone: [{ id: 'C2A', commonId: EnergyShieldCommonId }],
                opponentStationCards: [{ place: 'action' }],
                events
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .readyToAttack');
        });
        test('should NOT be able to select opponent station card', () => {
            assert.elementCount('.field-opponentStation .attackable', 0);
        });
    });
});
describe('draw phase:', () => {
    describe('when in draw phase', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'draw' }],
                commanders: [Commander.TheMiller]
            }));
            await timeout();
        });
        test('should show guide text', () => {
            assert.elementCount('.guideText-drawCard', 1);
        });
        test('should show draw pile action overlay', () => {
            assert.elementCount('.drawPile-draw', 1);
        });
        test('should show opponent draw pile action overlay', () => {
            assert.elementCount('.drawPile-discardTopTwo', 1);
        });
        test('should NOT show next phase button', () => {
            assert.elementCount('.nextPhaseButton', 0);
        });
    });
    describe('when has 1 card in draw-station row and is in draw phase and click on own draw pile', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'draw' }, { place: 'action' }],
                commanders: [Commander.TheMiller]
            }));
            await timeout();

            await click('.drawPile-draw');
            dispatch('drawCards', { cards: [{ id: 'C1A' }], moreCardsCanBeDrawn: false });
            await timeout();
        });
        test('should ask to draw card', () => {
            assert.calledOnceWith(matchController.emit, 'drawCard');
        });
        test('should get put new card in hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 1);
        });
        test('should NOT show guide text', () => {
            assert.elementCount('.guideText-drawCard', 0);
        });
        test('should NOT show draw pile action overlay', () => {
            assert.elementCount('.drawPile-draw', 0);
        });
        test('should NOT show opponent draw pile action overlay', () => {
            assert.elementCount('.drawPile-discardTopTwo', 0);
        });
    });
    describe('when is in draw phase and click on own draw pile and server responds with card and that more can be drawn', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw'
            }));
            await timeout();

            await click('.drawPile-draw');
            dispatch('drawCards', { cards: [{ id: 'C1A' }], moreCardsCanBeDrawn: true });
            await timeout();
        });
        test('should ask to draw card', () => {
            assert.calledOnceWith(matchController.emit, 'drawCard');
        });
        test('should get put new card in hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 1);
        });
        test('should NOT show go to next phase button', () => {
            assert.elementCount('.nextPhaseButton', 0);
        });
        test('should still show guide text', () => {
            assert.elementCount('.guideText-drawCard', 1);
        });
    });
    describe('when is in draw phase and click on opponent draw pile and server responds without any card but that more can be drawn', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                commanders: [Commander.TheMiller]
            }));
            await timeout();

            await click('.drawPile-discardTopTwo');
            dispatch(
                'stateChanged',
                { opponentDiscardedCards: [createCard({ id: 'C2A' }), createCard({ id: 'C3A' })] }
            );
            dispatch('drawCards', { cards: [], moreCardsCanBeDrawn: true });
            await timeout();
        });
        test('should have asked to discard opponent top 2 cards', () => {
            assert.calledOnceWith(matchController.emit, 'discardOpponentTopTwoCards');
        });
        test('should NOT get new card in hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 0);
        });
        test('should NOT show next phase button', () => {
            assert.elementCount('.nextPhaseButton', 0);
        });
        test('should still show guide text', () => {
            assert.elementCount('.guideText-drawCard', 1);
        });
    });
});
