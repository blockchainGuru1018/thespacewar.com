const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../shared/event/MoveCardEvent');
const RepairCardEvent = require('../../shared/event/RepairCardEvent.js');
const AttackEvent = require('../../shared/event/AttackEvent.js');
const getCardImageUrl = require('../../client/utils/getCardImageUrl.js');
const FakeState = require('../matchTestUtils/FakeState.js');
const FakeMatchController = require('../matchTestUtils/FakeMatchController.js');
const Commander = require("../../shared/match/commander/Commander.js");
const { createController: createTestController } = require('../matchTestUtils/index.js');
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
} = require('../bocha-jest/bocha-jest.js');

const DiscoveryCommonId = '42';
const CommonShipId = '25';
const FastMissileId = '6';
const FatalErrorCommonId = '38';
const TriggerHappyJoeCommonId = '24';
const DeadlySniperCommonId = '39';
const PursuiterCommonId = '19';
const TheShadeCommonId = '27';
const EnergyShieldCommonId = '21';
const SmallRepairShopId = '29';

// module.exports = {
//     setUp() {
//         keysToPreserve.push(Object.keys(this));
//         sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');
//
//         createController = createControllerBoundToTestContext(this);
//     });
//     tearDown() {
//         clock && clock.restore();
//         getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();
//         this.controller && this.controller.tearDown();
//
//         for (let key of Object.keys(this)) {
//             if (!keysToPreserve.includes(key)) {
//                 delete this[key];
//             }
//         }
//     });

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
describe('attack phase:', () => {
    describe.skip('when card has attack level 2 and attack last opponent station card that is NOT flipped', () => {
        beforeEach(async () => {
            matchController = FakeMatchController();
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [createCard({ id: 'C1A', attack: 2 })],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ],
                opponentStationCards: [
                    { id: 'C2A', place: 'action' },
                    { id: 'C3A', place: 'action', flipped: true, card: createCard({ id: 'C3A' }) }
                ]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .readyToAttack');
            await click('.field-opponentStation .attackable');
        });
        test('should send attack', () => {
            assert.calledOnceWith(matchController.emit, 'attackStationCard', {
                attackerCardId: 'C1A',
                targetStationCardIds: ['C2A']
            });
        });
    });
    describe('when game has ended and opponent has lost', () => {
        beforeEach(async () => {
            clock = fakeClock();
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                stationCards: [{ id: 'C1A', place: 'action', card: createCard({ id: 'C1A' }) }],
                ended: true,
                retreatedPlayerId: 'P2A'
            }));
            await timeout(clock);
        });
        test('should show victory text', async () => {
            await timeout(clock, 5000);
            assert.elementCount('.victoryText', 1);
        });
        test('should show end game overlay', async () => {
            await timeout(clock, 5000);
            assert.elementCount('.endGameOverlay', 1);
        });
    });
    describe('when game ended and you lost', () => {
        beforeEach(async () => {
            clock = fakeClock();
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                ended: true,
                retreatedPlayerId: 'P1A'
            }));
            await timeout(clock);
        });
        test('should NOT show victory text', async () => {
            await timeout(clock, 5000);
            assert.elementCount('.victoryText', 0);
        });
        test('should show defeat text', async () => {
            await timeout(clock, 5000);
            assert.elementCount('.defeatText', 1);
        });
        test('should show end game overlay', async () => {
            await timeout(clock, 5000);
            assert.elementCount('.endGameOverlay', 1);
        });
    });
    describe.skip('when moved card to opponent zone last turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A' }],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ]
            }));
            await timeout();
        });
        test('should be able to select card to move back', () => {
            assert.elementCount('.playerCardsInOpponentZone .card .movable', 1);
        });
    });
    describe.skip('when moved card to opponent zone this turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A' }],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ]
            }));
            await timeout();
        });
        test('should NOT be able to select card to move back', () => {
            assert.elementCount('.playerCardsInOpponentZone .card .movable', 0);
        });
    });
    describe.skip('when moved Fast Missile to opponent zone THIS turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', commonId: FastMissileId }],
                events: [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ]
            }));
            await timeout();
        });
        test('should NOT be able to select card to move back', () => {
            assert.elementCount('.playerCardsInOpponentZone .card .movable', 0);
        });
    });
    describe.skip('when put down Fast missile this turn and select for attack', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', attack: 1, commonId: FastMissileId }],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();

            await click('.playerCardsInZone .card .readyToAttack');
        });
        test('should NOT be able to attack a station card', () => {
            assert.elementCount('.field-opponentStation .attackable', 0);
        });
    });
});
describe('discard card requirement', () => {
    describe('when have discard card requirement', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'draw' }],
                requirements: [{ type: 'discardCard', count: 2 }]
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
            assert.elementText('.guideText', 'Discard 2 cards');
        });
        test('should NOT be able to select any station card', () => {
            assert.elementCount('.stationCard .selectable', 0);
        });
    });
    describe('when have draw card requirement with "waiting" set to true', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                stationCards: [{ place: 'draw' }],
                requirements: [{ type: 'drawCard', waiting: true }]
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
            assert.elementCount('.guideText', 1);
            assert.elementCount('.guideText-waitingForOtherPlayer', 1);
        });
        test('should NOT be able to draw card', () => {
            assert.elementCount('.drawPile-draw', 0);
        });
    });
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
describe('draw card requirement', () => {
    describe('when have draw card requirement', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                opponentStationCards: [{ place: 'draw' }],
                requirements: [{ type: 'drawCard', count: 2 }],
                commanders: [Commander.TheMiller]
            }));
            await timeout();
        });
        test('should show guide text', () => {
            assert.elementTextStartsWith('.guideText', 'Draw card or Mill opponent (x2)');
        });
        test('should show draw pile action overlay', () => {
            assert.elementCount('.drawPile-draw', 1);
        });
    });
    describe('when have a draw card requirement in the draw phase', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'draw',
                requirements: [{ type: 'drawCard', count: 2 }],
                commanders: [Commander.TheMiller]
            }));
            await timeout();
        });
        test('should show opponent draw pile mill action overlay', () => {
            assert.elementCount('.drawPile-discardTopTwo', 1);
        });
        test('should show opponent draw pile help text', () => {
            assert.elementCount('.opponentDrawPileDescription', 1);
        });
    });
    describe('when have discard card requirement but a draw card requirement is the first', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{ type: 'drawCard', count: 2 }, { type: 'discardCard', count: 2 }],
                commanders: [Commander.TheMiller]
            }));
            await timeout();
        });
        test('should show draw card guide text', () => {
            assert.elementTextStartsWith('.guideText', 'Draw card or Mill opponent (x2)');
        });
    });
});

describe('Discovery:', () => {
    describe('when place down card "Discovery"', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }]
            }));
            await timeout();

            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');
        });
        test('should put down card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
        });
        test('should NOT have card on hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 0);
        });
        test('should NOT discard card', () => {
            assert.elementCount('.field-discardPile .card-faceDown', 0);
        });
        test('should show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 1);
        });
    });
    describe('when move card "Discovery" from station to zone', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                stationCards: [
                    {
                        place: 'draw',
                        id: 'C1A',
                        card: createCard({ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }),
                        flipped: true
                    },
                    { place: 'draw', id: 'C2A' },
                ],
                events: [
                    PutDownCardEvent({ cardId: 'C1A', cardCommonId: DiscoveryCommonId, location: 'zone', turn: 1 })
                ]
            }));
            await timeout();

            await click('.stationCard .moveToZone');
        });
        test('should show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 1);
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
    });
    describe('when move card "Discovery" from station to zone and cancels', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'action',
                stationCards: [
                    {
                        place: 'draw',
                        id: 'C1A',
                        card: createCard({ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }),
                        flipped: true
                    },
                    { place: 'draw', id: 'C2A' },
                ],
                events: [
                    PutDownCardEvent({ cardId: 'C1A', cardCommonId: DiscoveryCommonId, location: 'zone', turn: 1 })
                ]
            }));
            await timeout();

            await click('.stationCard .moveToZone');
            await click('.cardChoiceDialog-overlay');
        });
        test('should NOT show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 0);
        });
        test('should NOT have card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
        });
        test('should have card among station cards', () => {
            assert.elementCount('.field-player .stationCard', 2);
        });
        test('should NOT have discarded card', () => {
            assert.elementCount('.field-discardPile .card-faceDown', 0);
        });
    });
    describe('when place down card "Discovery" and choose draw options', () => {
        beforeEach(async () => {
            matchController = FakeMatchController();
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');

            await click('.cardChoiceDialog-choice:contains("draw")');
        });
        test('should emit "putDownCard"', () => {
            assert.calledOnceWith(matchController.emit, 'putDownCard', {
                location: 'zone',
                cardId: 'C1A',
                choice: 'draw'
            });
        });
        test('should NOT show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 0);
        });
        test('should NOT show card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
        });
        test('should NOT show card on hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 0);
        });
        test('should show card in discard pile', () => {
            assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
        });
    });
    describe('when place down card "Discovery" and choose discard option', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub().returns(new Promise(() => { })) });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');

            await click('.cardChoiceDialog-choice:contains("discard")');
        });
        test('should emit "putDownCard"', () => {
            assert.calledOnceWith(matchController.emit, 'putDownCard', {
                location: 'zone',
                cardId: 'C1A',
                choice: 'discard'
            });
        });
        test('should NOT show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 0);
        });
    });
    describe('when place down card "Discovery" and cancels', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [{ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }]
            }));
            await timeout();
            await click('.playerCardsOnHand .cardOnHand');
            await click('.playerEventCardGhost');

            await click('.cardChoiceDialog-overlay');
        });
        test('should NOT emit "putDownCard"', () => {
            refute.calledWith(matchController.emit, 'putDownCard');
        });
        test('should NOT show choice dialog', () => {
            assert.elementCount('.cardChoiceDialog', 0);
        });
        test('should NOT have card in zone', () => {
            assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
        });
        test('should show card on hand', () => {
            assert.elementCount('.playerCardsOnHand .cardOnHand', 1);
        });
        test('should NOT have discarded card', () => {
            assert.elementCount('.field-discardPile .card-faceDown', 0);
        });
    });
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
                    { place: 'draw', id: 'C7A' },
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
        test('should be able to select BOTH opponents station cards', () => {
            assert.elementCount('.field-opponent .stationCard .selectable', 2);
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
describe.skip('Deadly sniper', () => {
    describe('when card was placed this turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', attack: 1, type: 'spaceShip', commonId: DeadlySniperCommonId }],
                opponentCardsInZone: [{ id: 'C2A' }],
                opponentCardsInPlayerZone: [{ id: 'C3A' }],
                opponentStationCards: [{ place: 'draw', id: 'C4A' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInZone .card .readyToAttack');
        });
        test('should NOT be able to attack opponent card in opponent zone', () => {
            assert.elementCount('.opponentCardsInZone .attackable', 0);
        });
        test('should NOT be able to attack station card', () => {
            assert.elementCount('.field-opponentStation .attackable', 0);
        });
        test('should be able to attack opponent card in home zone', () => {
            assert.elementCount('.opponentCardsInPlayerZone .attackable', 1);
        });
    });
    describe('when was placed last turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', attack: 1, type: 'spaceShip', commonId: DeadlySniperCommonId }],
                opponentCardsInZone: [{ id: 'C2A' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInZone .card .readyToAttack');
        });
        test('should be able to attack opponent card in opponent zone ', () => {
            assert.elementCount('.opponentCardsInZone .attackable', 1);
        });
        test('should be able to attack opponent station card', () => {
            assert.elementCount('.field-opponentStation .attackable', 1);
        });
    });
});
describe.skip('Pursuiter:', () => {
    describe('when has card and an opponent card in home zone', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();
        });
        test('should be able to sacrifice own card', () => {
            assert.elementCount('.playerCardsInZone .sacrifice', 1);
        });
    });
    describe('when has card THAT IS NOT PURSUITER and an opponent card in home zone', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', type: 'spaceShip' }],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();
        });
        test('should NOT be able to sacrifice own card', () => {
            assert.elementCount('.playerCardsInZone .sacrifice', 0);
        });
    });
    describe('when select card to sacrifice and selects other card', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();

            await click('.playerCardsInZone .sacrifice');
            await click('.opponentCardsInPlayerZone .selectable');
        });
        test('should emit sacrifice with target card id', () => {
            assert.calledWith(matchController.emit, 'sacrifice', { cardId: 'C1A', targetCardId: 'C2A' });
        });
    });
    describe('when select card in home zone to sacrifice', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [
                    { id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId },
                    { id: 'C2A' }
                ],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                opponentCardsInZone: [{ id: 'C3A' }],
                opponentStationCards: [{ id: 'C4A', place: 'draw' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C2A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInZone .sacrifice');
        });
        test('should NOT be able to select opponent card in opponent home zone', () => {
            assert.elementCount('.opponentCardsInZone .selectable', 0);
        });
        test('should be able to select opponent card in player home zone', () => {
            assert.elementCount('.opponentCardsInPlayerZone .selectable', 1);
        });
        test('should NOT be able to select opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 0);
        });
        test('should NOT be able to select player card to target for sacrifice', () => {
            assert.elementCount('.playerCardsInZone .selectable', 0);
        });
        test('should NOT be able to any card for attack', () => {
            assert.elementCount('.readyToAttack', 0);
        });
        test('should NOT show extra transient card in home zone', () => {
            assert.elementCount('.playerCardsInZone .card:not(.card-placeholder)', 2);
        });
    });
    describe('when select card in opponent zone to sacrifice', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentCardsInPlayerZone: [{ id: 'C2A' }],
                opponentCardsInZone: [{ id: 'C3A' }],
                opponentStationCards: [
                    { id: 'C4A', place: 'draw' },
                    { id: 'C5A', flipped: true, place: 'draw', card: createCard({ id: 'C5A' }) }
                ],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C2A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
        });
        test('should be able to select opponent card in opponent home zone', () => {
            assert.elementCount('.opponentCardsInZone .selectable', 1);
        });
        test('should NOT be able to select opponent card in player home zone', () => {
            assert.elementCount('.opponentCardsInPlayerZone .selectable', 0);
        });
        test('should be able to select opponent station card', () => {
            assert.elementCount('.opponentStationCards .card:eq(0) .selectable', 1);
        });
        test('should NOT be able to select flipped opponent station card', () => {
            assert.elementCount('.opponentStationCards .card:eq(1) .selectable', 0);
        });
    });
    describe('when select card in opponent zone to sacrifice and opponent has energy shield', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentCardsInZone: [{ id: 'C2A', commonId: EnergyShieldCommonId }],
                opponentStationCards: [{ id: 'C3A', place: 'draw' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C2A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
        });
        test('should be able to select opponent card in opponent home zone', () => {
            assert.elementCount('.opponentCardsInZone .selectable', 1);
        });
        test('should NOT be able to select opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 0);
        });
    });
    describe('when select card to sacrifice and select a station card', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentCardsInZone: [{ id: 'C3A' }],
                opponentStationCards: [
                    { id: 'C4A', place: 'draw' },
                    { id: 'C5A', place: 'draw' }
                ],
                events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
            await click('.opponentStationCards .card:eq(0) .selectable');
        });
        test('should NOT be able to select opponent card in opponent home zone', () => {
            assert.elementCount('.opponentCardsInZone .selectable', 0);
        });
        test('should be able to select second opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 1);
        });
    });
    describe('when select card to sacrifice and select a 4 station cards', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentStationCards: [
                    { id: 'C2A', place: 'draw' },
                    { id: 'C3A', place: 'draw' },
                    { id: 'C4A', place: 'draw' },
                    { id: 'C5A', place: 'draw' },
                    { id: 'C6A', place: 'draw' }
                ],
                events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
            await click('.opponentStationCards .card:eq(0) .selectable');
            await click('.opponentStationCards .card:eq(1) .selectable');
            await click('.opponentStationCards .card:eq(2) .selectable');
            await click('.opponentStationCards .card:eq(3) .selectable');
        });
        test('should emit sacrifice with station card ids', () => {
            assert.calledWith(matchController.emit, 'sacrifice', {
                cardId: 'C1A',
                targetCardIds: ['C2A', 'C3A', 'C4A', 'C5A']
            });
        });
        test('should NOT be able to select another opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 0);
        });
    });
    describe('when select card to sacrifice and opponent has 3 unflipped station cards and select all 3', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentStationCards: [
                    { id: 'C2A', place: 'draw' },
                    { id: 'C3A', place: 'draw' },
                    { id: 'C4A', place: 'draw' },
                    { id: 'C5A', flipped: true, place: 'draw', card: createCard({ id: 'C5A' }) }
                ],
                events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
            await click('.opponentStationCards .card:eq(0) .selectable');
            await click('.opponentStationCards .card:eq(1) .selectable');
            await click('.opponentStationCards .card:eq(2) .selectable');
        });
        test('should emit sacrifice with station card ids', () => {
            assert.calledWith(matchController.emit, 'sacrifice', {
                cardId: 'C1A',
                targetCardIds: ['C2A', 'C3A', 'C4A']
            });
        });
        test('should NOT be able to select another opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 0);
        });
    });
    describe('when opponent has 1 station card and player has card in opponent zone with the ability to sacrifice itself', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentStationCards: [{ id: 'C2A', place: 'draw' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ]
            }));
            await timeout();
        });
        test('should be able to select card for sacrifice', () => {
            assert.elementCount('.playerCardsInOpponentZone .sacrifice', 1);
        });
    });
    describe('when select card to sacrifice and opponent has 1 station card and select that card', () => {
        beforeEach(async () => {
            matchController = FakeMatchController({ emit: stub() });
            const { dispatch } = createController({ matchController: matchController });
            controller.showPage();
            dispatch('stateChanged', FakeState({
                turn: 3,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                opponentStationCards: [{ id: 'C2A', place: 'draw' }],
                events: [
                    PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ]
            }));
            await timeout();

            await click('.playerCardsInOpponentZone .sacrifice');
            await click('.opponentStationCards .card .selectable');
        });
        test('should emit sacrifice with station card ids', () => {
            assert.calledWith(matchController.emit, 'sacrifice', { cardId: 'C1A', targetCardIds: ['C2A'] });
        });
        test('should NOT be able to select another opponent station card', () => {
            assert.elementCount('.opponentStationCards .selectable', 0);
        });
    });
});
describe.skip('The Shade:', () => {
    describe('when opponent card is The Shade and it has NOT attacked this turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                cardsInZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInPlayerZone: [{ id: 'C2A', commonId: TheShadeCommonId }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })],
                opponentEvents: []
            }));
            await timeout();
        });
        test('player card should NOT be able to attack', () => {
            assert.elementCount('.playerCardsInZone .readyToAttack', 0);
        });
    });
    describe('when PLAYER IS THE FIRST PLAYER and opponent card is The Shade and it has attacked last turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                playerOrder: ['P1A', 'P2A'],
                cardsInZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInPlayerZone: [{ id: 'C2A', commonId: TheShadeCommonId }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })],
                opponentEvents: [AttackEvent({ turn: 1, attackerCardId: 'C2A', cardCommonId: TheShadeCommonId })]
            }));
            await timeout();
        });
        test('player card should be able to attack', () => {
            assert.elementCount('.playerCardsInZone .readyToAttack', 1);
        });
    });
    describe('when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked this turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                playerOrder: ['P2A', 'P1A'],
                cardsInZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInPlayerZone: [{ id: 'C2A', commonId: TheShadeCommonId }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })],
                opponentEvents: [AttackEvent({ turn: 2, attackerCardId: 'C2A', cardCommonId: TheShadeCommonId })]
            }));
            await timeout();
        });
        test('player card should be able to attack', () => {
            assert.elementCount('.playerCardsInZone .readyToAttack', 1);
        });
    });
    describe('when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked last turn', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch('stateChanged', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                phase: 'attack',
                playerOrder: ['P2A', 'P1A'],
                cardsInZone: [{ id: 'C1A', attack: 1 }],
                opponentCardsInPlayerZone: [{ id: 'C2A', commonId: TheShadeCommonId }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })],
                opponentEvents: [AttackEvent({ turn: 1, attackerCardId: 'C2A', cardCommonId: TheShadeCommonId })]
            }));
            await timeout();
        });
        test('player card should NOT be able to attack', () => {
            assert.elementCount('.playerCardsInZone .readyToAttack', 0);
        });
    });
});
