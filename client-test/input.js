let assert = require('bocha/lib/dom/assert.js');
let refute = require('bocha/lib/dom/refute.js');
let timeout = require('bocha/lib/timeoutPromise.js');
let bochaDom = require('bocha/lib/dom/dom.js');
let sinon = require('sinon');
let stub = sinon.stub;
let click = bochaDom.clickAndTick;
const resolveModuleWithPossibleDefault = require('../client/utils/resolveModuleWithPossibleDefault.js');
const Vue = resolveModuleWithPossibleDefault(require('vue'));
const Vuex = resolveModuleWithPossibleDefault(require('vuex'));
const PortalVue = resolveModuleWithPossibleDefault(require('portal-vue'));
const vClickOutside = resolveModuleWithPossibleDefault(require('v-click-outside'));
const defaults = require('lodash/defaults');
const Page = require('../client/match/MatchPage.js');
const FakeCardDataAssembler = require('../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require('../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../shared/event/MoveCardEvent');
const RepairCardEvent = require('../shared/event/RepairCardEvent.js');
const AttackEvent = require('../shared/event/AttackEvent.js');
const SmallCannon = require('../shared/card/SmallCannon.js');
const getCardImageUrl = require('../client/utils/getCardImageUrl.js');
const cardsJson = require('../server/card/rawCardData.cache.json').data;

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

Vue.use(Vuex);
Vue.use(PortalVue);
Vue.use(vClickOutside);

let controller;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();
    controller && controller.tearDown();
});

describe('misc', async () => {
    test('when in "start" phase and click card on hand should NOT see ANY card ghosts', async () => {
        const { dispatch } = createController();
        controller.showPage();
        dispatch('restoreState', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'start',
            cardsOnHand: [createCard({ id: 'C1A' })],
            stationCards: [{ place: 'draw' }]
        }));
        await timeout();

        await click('.field-playerCardsOnHand .cardOnHand');

        assert.elementCount('.card-ghost', 0);
    });
});

describe('action phase', () => {
    describe('when in action phase and click card on hand', async () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('restoreState', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                cardsOnHand: [createCard({ id: 'C1A' })],
                stationCards: [{ place: 'draw' }]
            }));
            await timeout();

            await click('.field-playerCardsOnHand .cardOnHand');
        });

        test('should see station card ghosts', async () => {
            assert.elementCount('.field-playerStation .card-ghost', 3);
        });
    });
});

let keysToPreserver = [];

const testConfig = {
    setUp() {
        keysToPreserver.push(Object.keys(this));
    },
    tearDown() {
        for (let key of Object.keys(this)) {
            if (!keysToPreserver.includes(key)) {
                delete this[key];
            }
        }
    },
    'attack': {
        'when player has card in opponent zone and opponent has 1 defense card': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInOpponentZone: [{ id: 'C1A', attack: 1 }],
                    opponentCardsInZone: [{ id: 'C2A,', type: 'defense' }],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
                }));
                await timeout();
            },
            'player card should be able to attack'() {
                assert.elementCount('.playerCardsInOpponentZone .readyToAttack', 1);
            }
        },
        'when player has 1 card in opponent zone and opponent has 1 duration card in its zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInOpponentZone: [{ id: 'C1A', attack: 1 }],
                    opponentCardsInZone: [{ id: 'C2A,', type: 'duration' }],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
                }));
                await timeout();
            },
            'player card should not be able to attack'() {
                assert.elementCount('.playerCardsInOpponentZone .readyToAttack', 0);
            }
        }
    },
    'duration cards': {
        'when has duration in play and is your turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    cardsInZone: [{ id: 'C1A', type: 'duration' }]
                }));

                dispatch('nextPlayer', { turn: 2, currentPlayer: 'P1A' });
                await timeout();
            }
        },
        'when in preparation phase with 2 duration cards and click and discards the first': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    phase: 'preparation',
                    currentPlayer: 'P1A',
                    cardsInZone: [{ id: 'C1A', type: 'duration' }, { id: 'C2A', type: 'duration' }]
                }));
                await timeout();

                await click('.card[data-type="duration"]:eq(0) .discard');
            },
            'should emit discardDurationCard'() {
                assert.calledOnceWith(this.matchController.emit, 'discardDurationCard', 'C1A');
            },
            'should remove card from own field'() {
                assert.elementCount('.field-playerZoneCards .card[data-type="duration"]', 1);
            },
            'should put card in discard pile'() {
                assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
            }
        },
        'when in preparation phase and go to next phase': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    phase: 'preparation',
                    currentPlayer: 'P1A'
                }));
                await timeout();

                await click('.nextPhaseButton');
            },
            'should emit next phase'() {
                assert.calledOnceWith(this.matchController.emit, 'nextPhase');
            },
        },
        'when in preparation phase and discard all duration cards should AUTOMATICALLY go to the draw phase': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    phase: 'preparation',
                    currentPlayer: 'P1A',
                    cardsInZone: [{ id: 'C1A', type: 'duration' }]
                }));
                await timeout();

                await click('.card[data-type="duration"] .discard');
            },
            'should emit next phase'() {
                assert.calledOnceWith(this.matchController.emit, 'nextPhase');
            }
        },
        'on "opponentDiscardedDurationCard"': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    currentPlayer: 'P2A',
                    opponentCardsInZone: [{ id: 'C1A' }]
                }));
                await timeout();

                dispatch('opponentDiscardedDurationCard', { card: createCard({ id: 'C1A' }) });
            },
            'should show card in discarded pile'() {
                assert.elementCount('.field-opponent .field-discardPile .card[data-cardId="C1A"]', 1);
            },
            'should NOT show card in opponent zone'() {
                assert.elementCount('.field-opponent .field-zone .card--turnedAround', 0);
            }
        }
    },
    'enlarge': {
        'when has 1 card in own zone and click enlarge icon on it': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    cardsInZone: [{ id: 'C1A' }],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
                }));
                await timeout();

                await click('.field-playerZoneCards .card .enlargeIcon');
            },
            'should show enlarged version of card'() {
                assert.elementCount('.card--enlarged', 1);
            }
        },
        'when enlarged version of card is visible and click on overlay should hide enlarged card': async function () {
            const { dispatch } = createController();
            controller.showPage();
            dispatch('restoreState', FakeState({
                turn: 2,
                currentPlayer: 'P1A',
                cardsInZone: [{ id: 'C1A' }],
                events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
            }));
            await timeout();
            await click('.field-playerZoneCards .card .enlargeIcon');

            await click('.dimOverlay');

            assert.elementCount('.card--enlarged', 0);
        }
    },
    'behaviour - Small Repair Shop': {
        'when has card in zone and a damaged card in same zone BUT is action phase': {
            async setUp() {
                const events = [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, cardId: 'C2A' })
                ];
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 1 }],
                    events
                }));
                await timeout();
            },
            'should NOT be able to select card for repair'() {
                assert.elementCount('.repair', 0);
            }
        },
        'when has card in zone, a damaged card in same zone, a station card and a flipped station card': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const events = [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, cardId: 'C2A' })
                ];
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should be able to choose repair for Small Repair Shop'() {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 1);
            },
            'should show damage indicator for other card'() {
                assert.elementText('.card-damageIndicator', '-1');
            },
            'and click repair': {
                async setUp() {
                    await click('.field-playerZoneCards .card:eq(0) .repair');
                },
                'should NOT be able to select for attack'() {
                    assert.elementCount('.field-playerZoneCards .card:eq(0) .readyToAttack', 0);
                },
                'should NOT be able to select for move'() {
                    assert.elementCount('.field-playerZoneCards .card:eq(0) .movable', 0);
                },
                'should be able to select station card for repair'() {
                    assert.elementCount('.playerStationCards .selectForRepair', 1);
                },
                'and click selectForRepair on damaged card': {
                    async setUp() {
                        await click('.field-playerZoneCards .card:eq(1) .selectForRepair');
                    },
                    'should NOT be able to choose repair for Small Repair Shop'() {
                        assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
                    }
                },
                'and click selectForRepair on flipped station card': {
                    async setUp() {
                        await click('.playerStationCards .selectForRepair');
                    },
                    'should NOT be able to choose repair for Small Repair Shop'() {
                        assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
                    },
                    'should emit repair card'() {
                        assert.calledOnceWith(this.matchController.emit, 'repairCard', {
                            repairerCardId: 'C1A',
                            cardToRepairId: 'C3A'
                        });
                    }
                }
            }
        },
        'when repair 3 damage of card with 4 damage and has opponent card in zone': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should emit repair card'() {
                assert.calledOnceWith(this.matchController.emit, 'repairCard', {
                    repairerCardId: 'C1A',
                    cardToRepairId: 'C2A'
                });
            },
            'should NOT be able to still select card for repair'() {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .selectForRepair', 0);
            }
        },
        'when has repaired this turn and has card in same zone with damage': {
            async setUp() {
                const events = [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    PutDownCardEvent({ turn: 1, cardId: 'C2A' }),
                    RepairCardEvent({ turn: 2, cardId: 'C1A' })
                ];
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    cardsInZone: [{ id: 'C1A', commonId: SmallRepairShopId }, { id: 'C2A', damage: 1 }],
                    events
                }));
                await timeout();
            },
            'should NOT be able to choose repair for Small Repair Shop'() {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
            }
        },
        'when has card in zone and there is NO damaged ship in same zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    cardsInZone: [{ id: SmallRepairShopId }],
                    events: [PutDownCardEvent({ turn: 1, cardId: SmallRepairShopId })]
                }));
                await timeout();
            },
            'should NOT be able to choose repair for Small Repair Shop'() {
                assert.elementCount('.field-playerZoneCards .card:eq(0) .repair', 0);
            }
        },
        //when selected card to repair and has other damaged card and is it self damaged should NOT be able to select self for repair
        //OR when is damaged should be able to select for repair and repair self
    },
    'behaviour - Energy Shield': {
        'when ready card for attack in opponent zone and they have an Energy shield': {
            async setUp() {
                const events = [
                    PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                    MoveCardEvent({ turn: 2, cardId: 'C1A' })
                ];
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should NOT be able to select opponent station card'() {
                assert.elementCount('.field-opponentStation .attackable', 0);
            }
        }
    },
    'draw phase:': {
        'when in draw phase': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }]
                }));
                await timeout();
            },
            'should show guide text'() {
                assert.elementCount('.guideText-drawCard', 1);
            },
            'should show draw pile action overlay'() {
                assert.elementCount('.drawPile-draw', 1);
            },
            'should show opponent draw pile action overlay'() {
                assert.elementCount('.drawPile-discardTopTwo', 1);
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            }
        },
        'when has 1 card in draw-station row and is in draw phase and click on own draw pile': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }, { place: 'action' }]
                }));
                await timeout();

                await click('.drawPile-draw');
                dispatch('drawCards', { cards: [{ id: 'C1A' }], moreCardsCanBeDrawn: false });
                await timeout();
            },
            'should ask to draw card'() {
                assert.calledOnceWith(this.matchController.emit, 'drawCard');
            },
            'should get put new card in hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 1);
            },
            'should NOT show guide text'() {
                assert.elementCount('.guideText-drawCard', 0);
            },
            'should NOT show draw pile action overlay'() {
                assert.elementCount('.drawPile-draw', 0);
            },
            'should NOT show opponent draw pile action overlay'() {
                assert.elementCount('.drawPile-discardTopTwo', 0);
            }
        },
        'when is in draw phase and click on own draw pile and server responds with card and that more can be drawn': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw'
                }));
                await timeout();

                await click('.drawPile-draw');
                dispatch('drawCards', { cards: [{ id: 'C1A' }], moreCardsCanBeDrawn: true });
                await timeout();
            },
            'should ask to draw card'() {
                assert.calledOnceWith(this.matchController.emit, 'drawCard');
            },
            'should get put new card in hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 1);
            },
            'should NOT show go to next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should still show guide text'() {
                assert.elementCount('.guideText-drawCard', 1);
            }
        },
        'when is in draw phase and click on opponent draw pile and server responds without any card but that more can be drawn': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw'
                }));
                await timeout();

                await click('.drawPile-discardTopTwo');
                dispatch(
                    'stateChanged',
                    { opponentDiscardedCards: [createCard({ id: 'C2A' }), createCard({ id: 'C3A' })] }
                );
                dispatch('drawCards', { cards: [], moreCardsCanBeDrawn: true });
                await timeout();
            },
            'should ask to discard opponent top 2 cards'() {
                assert.calledOnceWith(this.matchController.emit, 'discardOpponentTopTwoCards');
            },
            'should NOT get new card in hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 0);
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should still show guide text'() {
                assert.elementCount('.guideText-drawCard', 1);
            }
        }
    },
    'skip phases with NO actions:': {
        'when in draw phase with NO station cards in draw row but 1 in action row should show next phase button to Action phase': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'action' }]
                }));
                await timeout();
            },
            'should show next phase as Action phase'() {
                assert.elementText('.nextPhaseButton', 'Go to action phase');
            }
        },
        'when in action phase with no cards to discard and no cards in play should show next phase as End turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action'
                }));
                await timeout();
            },
            'should show next phase as End turn'() {
                assert.elementCount('.nextPhaseButton-endTurn', 1);
            }
        },
        'when in action phase with no cards to discard and no cards in play and click "End turn"': {
            async setUp() {
                this.matchController = FakeMatchController();
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action'
                }));
                await timeout();

                await click('.nextPhaseButton-endTurn');
            },
            'should skip to end of turn'() {
                assert.calledThriceWith(this.matchController.emit, 'nextPhase');
            }
        },
        'when in action phase with no cards to discard and 1 in play that can move': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsInZone: [createCard({ id: 'C1A', commonId: CommonShipId })],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A', location: 'zone', cardCommonId: CommonShipId })]
                }));
                await timeout();
            },
            'should see next phase as "Attack phase"'() {
                assert.elementText('.nextPhaseButton', 'Go to attack phase');
            }
        },
        'when in action phase with no cards to discard and 1 in play in opponent zone that can move': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should see next phase as "Attack phase"'() {
                assert.elementText('.nextPhaseButton', 'Go to attack phase');
            }
        },
        'when in action phase with no cards to discard and 1 in play in opponent zone that can NOT move': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should see "End turn" button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 1);
            }
        },
        'when in action phase with no cards to discard and has 1 fast missile in play': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should NOT see end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should see next phase as "Attack phase"'() {
                assert.elementText('.nextPhaseButton', 'Go to attack phase');
            }
        }
    },
    'attack phase:': {
        'when card has attack level 2 and attack last opponent station card that is NOT flipped': {
            async setUp() {
                this.matchController = FakeMatchController();
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should send attack'() {
                assert.calledOnceWith(this.matchController.emit, 'attackStationCard', {
                    attackerCardId: 'C1A',
                    targetStationCardIds: ['C2A']
                });
            }
        },
        'when opponent has 0 unflipped station cards': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    stationCards: [{ id: 'C1A', place: 'action', card: createCard({ id: 'C1A' }) }],
                    opponentStationCards: [
                        { id: 'C2A', place: 'action', flipped: true, card: createCard({ id: 'C2A' }) }
                    ]
                }));
                await timeout();
            },
            'should show victory text'() {
                assert.elementCount('.victoryText', 1);
            },
            'should show end game overlay'() {
                assert.elementCount('.endGameOverlay', 1);
            }
        },
        'when you have 0 unflipped station cards': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    stationCards: [
                        { id: 'C1A', place: 'action', flipped: true, card: createCard({ id: 'C1A' }) }
                    ]
                }));
                await timeout();
            },
            'should NOT show victory text'() {
                assert.elementCount('.victoryText', 0);
            },
            'should show defeat text'() {
                assert.elementCount('.defeatText', 1);
            },
            'should show end game overlay'() {
                assert.elementCount('.endGameOverlay', 1);
            }
        },
        'when moved card to opponent zone last turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should be able to select card to move back'() {
                assert.elementCount('.playerCardsInOpponentZone .card .movable', 1);
            }
        },
        'when moved card to opponent zone this turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should NOT be able to select card to move back'() {
                assert.elementCount('.playerCardsInOpponentZone .card .movable', 0);
            }
        },
        'when moved Fast Missile to opponent zone THIS turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'should NOT be able to select card to move back'() {
                assert.elementCount('.playerCardsInOpponentZone .card .movable', 0);
            }
        },
        'when put down Fast missile this turn and select for attack': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', attack: 1, commonId: FastMissileId }],
                    opponentCardsInPlayerZone: [{ id: 'C2A' }],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })]
                }));
                await timeout();

                await click('.playerCardsInZone .card .readyToAttack');
            },
            'should NOT be able to attack a station card'() {
                assert.elementCount('.field-opponentStation .attackable', 0);
            }
        }
    },
    'discard card requirement': {
        'when have discard card requirement': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }],
                    requirements: [{ type: 'discardCard', count: 2 }]
                }));
                await timeout();
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should NOT show end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Discard 2 cards');
            },
            'should NOT be able to select any station card'() {
                assert.elementCount('.stationCard .selectable', 0);
            }
        },
        'when have draw card requirement with "waiting" set to true': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }],
                    requirements: [{ type: 'drawCard', waiting: true }]
                }));
                await timeout();
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should NOT show end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should show guide text'() {
                assert.elementCount('.guideText', 1);
                assert.elementCount('.guideText-waitingForOtherPlayer', 1);
            },
            'should NOT be able to draw card'() {
                assert.elementCount('.drawPile-draw', 0);
            }
        }
    },
    'damage own station card requirement': {
        'when have damageOwnStationCard requirement': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }, { place: 'draw' }, { place: 'draw' }],
                    opponentStationCards: [{ place: 'draw' }],
                    requirements: [{ type: 'damageOwnStationCard', count: 2 }]
                }));
                await timeout();
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should NOT show end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Select 2 of your own station cards to damage');
            },
            'should NOT be able to select opponent station card'() {
                assert.elementCount('.field-opponent .stationCard .selectable', 0);
            }
        },
        'when in action phase with damageOwnStationCard requirement and a flipped station card and click on card in hand': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [createCard({ id: 'C1A' })],
                    stationCards: [
                        { place: 'draw' },
                        { card: createCard({ id: 'C2A' }), place: 'draw', flipped: true }
                    ],
                    requirements: [{ type: 'damageOwnStationCard', count: 1 }]
                }));
                await timeout();

                await click('.field-playerCardsOnHand .cardOnHand');
            },
            'should NOT be able to move station cards to zone'() {
                assert.elementCount('.stationCard .movable', 0);
            }
        },
        'when in action phase with damageOwnStationCard requirement and an affordable card on hand and click on card in hand': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [createCard({ id: 'C1A' })],
                    stationCards: [
                        { place: 'action' },
                        { card: createCard({ id: 'C2A' }), place: 'action', flipped: true }
                    ],
                    requirements: [{ type: 'damageOwnStationCard', count: 1 }]
                }));
                await timeout();

                await click('.field-playerCardsOnHand .cardOnHand');
            },
            'should NOT show ANY card ghosts'() {
                assert.elementCount('.card-ghost', 0);
            }
        },
        'when have damageOwnStationCard requirement and 1 of 2 station cards is flipped': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [
                        { place: 'draw' },
                        { card: createCard({ id: 'C2A' }), place: 'draw', flipped: true }
                    ],
                    requirements: [{ type: 'damageOwnStationCard', count: 1 }]
                }));
                await timeout();
            },
            'should NOT be able to select flipped station card'() {
                assert.elementCount('.field-player .stationCard--flipped', 1);
                assert.elementCount('.field-player .stationCard--flipped .selectable', 0);
            }
        },
        'when have damageOwnStationCard requirement and click on station card ': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    stationCards: [{ place: 'draw' }, { place: 'draw' }, { place: 'draw' }],
                    requirements: [{ type: 'damageOwnStationCard', count: 2 }]
                }));
                await timeout();

                await click('.field-player .stationCard:eq(0) .selectable');
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should NOT show end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Select 1 of your own station cards to damage');
            },
            'should have clicked station card selected'() {
                assert.elementCount('.field-player .stationCard:eq(0).selected--danger', 1);
            }
        },
        'when have damageOwnStationCard requirement with count of 1 and click on station card': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    stationCards: [{ id: 'S1A', place: 'draw' }, { id: 'S2A', place: 'draw' }],
                    requirements: [{ type: 'damageOwnStationCard', count: 1 }]
                }));
                await timeout();

                await click('.field-player .stationCard:eq(0) .selectable');
            },
            'should NOT show next phase button'() {
                assert.elementCount('.nextPhaseButton', 0);
            },
            'should NOT show end turn button'() {
                assert.elementCount('.nextPhaseButton-endTurn', 0);
            },
            'should NOT show guide text'() {
                assert.elementCount('.guideText', 0);
            },
            'should NOT be able to select any station card'() {
                assert.elementCount('.stationCard .selectable', 0);
            },
            'should emit "damageOwnStationCards"'() {
                assert.calledWith(this.matchController.emit, 'damageOwnStationCards', {
                    targetIds: ['S1A']
                });
            }
        }
    },
    'draw card requirement': {
        'when have draw card requirement': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    opponentStationCards: [{ place: 'draw' }],
                    requirements: [{ type: 'drawCard', count: 2 }]
                }));
                await timeout();
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Draw card or Mill opponent');
            },
            'should show draw pile action overlay'() {
                assert.elementCount('.drawPile-draw', 1);
            }
        },
        'when have a draw card requirement in the draw phase': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'draw',
                    requirements: [{ type: 'drawCard', count: 2 }]
                }));
                await timeout();
            },
            'should show opponent draw pile mill action overlay'() {
                assert.elementCount('.drawPile-discardTopTwo', 1);
            },
            'should show opponent draw pile help text'() {
                assert.elementCount('.opponentDrawPileDescription', 1);
            }
        },
        'when have discard card requirement but a draw card requirement is the first': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    requirements: [{ type: 'drawCard', count: 2 }, { type: 'discardCard', count: 2 }]
                }));
                await timeout();
            },
            'should show draw card guide text'() {
                assert.elementText('.guideText', 'Draw card or Mill opponent');
            }
        }
    },
    'Discovery:': {
        'when place down card "Discovery"': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [{ id: 'C1A', commonId: DiscoveryCommonId }]
                }));
                await timeout();

                await click('.field-playerCardsOnHand .cardOnHand');
                await click('.field-playerZoneCards .card-ghost:eq(0)');
            },
            'should put down card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
            },
            'should NOT have card on hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 0);
            },
            'should NOT discard card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            },
            'should show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 1);
            }
        },
        'when move card "Discovery" from station to zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    stationCards: [
                        {
                            place: 'draw',
                            id: 'C1A',
                            card: createCard({ id: 'C1A', commonId: DiscoveryCommonId }),
                            flipped: true
                        },
                        { place: 'draw', id: 'C2A' },
                    ],
                    events: [
                        PutDownCardEvent({ cardId: 'C1A', cardCommonId: DiscoveryCommonId, location: 'zone', turn: 1 })
                    ]
                }));
                await timeout();

                await click('.stationCard .movable');
            },
            'should show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 1);
            },
            'should have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
            },
            'should NOT have card among station cards'() {
                assert.elementCount('.field-player .stationCard', 1);
            },
            'should NOT have discarded card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            }
        },
        'when move card "Discovery" from station to zone and cancels': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    stationCards: [
                        {
                            place: 'draw',
                            id: 'C1A',
                            card: createCard({ id: 'C1A', commonId: DiscoveryCommonId }),
                            flipped: true
                        },
                        { place: 'draw', id: 'C2A' },
                    ],
                    events: [
                        PutDownCardEvent({ cardId: 'C1A', cardCommonId: DiscoveryCommonId, location: 'zone', turn: 1 })
                    ]
                }));
                await timeout();

                await click('.stationCard .movable');
                await click('.cardChoiceDialog-overlay');
            },
            'should NOT show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 0);
            },
            'should NOT have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
            },
            'should have card among station cards'() {
                assert.elementCount('.field-player .stationCard', 2);
            },
            'should NOT have discarded card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            }
        },
        'when place down card "Discovery" and choose draw options': {
            async setUp() {
                this.matchController = FakeMatchController();
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [{ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }]
                }));
                await timeout();
                await click('.field-playerCardsOnHand .cardOnHand');
                await click('.field-playerZoneCards .card-ghost:eq(0)');

                await click('.cardChoiceDialog-choice:contains("draw")');
            },
            'should emit "putDownCard"'() {
                assert.calledOnceWith(this.matchController.emit, 'putDownCard', {
                    location: 'zone',
                    cardId: 'C1A',
                    choice: 'draw'
                });
            },
            'should NOT show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 0);
            },
            'should NOT show card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
            },
            'should NOT show card on hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 0);
            },
            'should show card in discard pile'() {
                assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
            }
        },
        'when place down card "Discovery" and choose discard option': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub().returns(new Promise(() => {})) });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [{ id: 'C1A', commonId: DiscoveryCommonId }]
                }));
                await timeout();
                await click('.field-playerCardsOnHand .cardOnHand');
                await click('.field-playerZoneCards .card-ghost:eq(0)');

                await click('.cardChoiceDialog-choice:contains("discard")');
            },
            'should emit "putDownCard"'() {
                assert.calledOnceWith(this.matchController.emit, 'putDownCard', {
                    location: 'zone',
                    cardId: 'C1A',
                    choice: 'discard'
                });
            },
            'should NOT show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 0);
            }
        },
        'when place down card "Discovery" and cancels': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [{ id: 'C1A', commonId: DiscoveryCommonId }]
                }));
                await timeout();
                await click('.field-playerCardsOnHand .cardOnHand');
                await click('.field-playerZoneCards .card-ghost:eq(0)');

                await click('.cardChoiceDialog-overlay');
            },
            'should NOT emit "putDownCard"'() {
                refute.calledWith(this.matchController.emit, 'putDownCard');
            },
            'should NOT show choice dialog'() {
                assert.elementCount('.cardChoiceDialog', 0);
            },
            'should NOT have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 0);
            },
            'should show card on hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 1);
            },
            'should NOT have discarded card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            }
        },
    },
    'Fatal Error:': {
        'when put down card Fatal Error': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsOnHand: [{ id: 'C1A', commonId: FatalErrorCommonId }],
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
                await click('.field-playerCardsOnHand .cardOnHand');

                await click('.field-playerZoneCards .card-ghost:eq(0)');
            },
            'should have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 2);
            },
            'should NOT have card in hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 0);
            },
            'should NOT have discarded card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Select any card to destroy');
            },
            'should be able to select opponent card in home zone'() {
                assert.elementCount('.opponentCardsInPlayerZone .selectable', 1);
            },
            'should be able to select opponent card in opponent zone'() {
                assert.elementCount('.opponentCardsInZone .selectable', 1);
            },
            'should be able to select BOTH opponents station cards'() {
                assert.elementCount('.field-opponent .stationCard .selectable', 2);
            },
            'should NOT be able to select first player card in home zone'() {
                assert.elementCount('.playerCardsInZone .card:eq(0) .selectable', 0);
            },
            'should NOT be able to select players second card in home zone'() {
                assert.elementCount('.playerCardsInZone .card:eq(1) .selectable', 0);
            },
            'should NOT be able to select player card in opponent zone'() {
                assert.elementCount('.playerCardsInOpponentZone .selectable', 0);
            },
            'should NOT be able to select player station card'() {
                assert.elementCount('.field-player .stationCard .selectable', 0);
            },
            'should NOT be able to move own flipped station card'() {
                assert.elementCount('.stationCard .movable', 0);
            }
        },
        'when move Fatal Error from station to zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
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

                await click('.stationCard .movable');
            },
            'should have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
            },
            'should NOT have card among station cards'() {
                assert.elementCount('.field-player .stationCard', 1);
            },
            'should NOT have discarded card'() {
                assert.elementCount('.field-discardPile .card-faceDown', 0);
            },
            'should show guide text'() {
                assert.elementText('.guideText', 'Select any card to destroy');
            }
        },
        'when put down card Fatal Error and then select opponent card in player zone': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
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
                await click('.field-playerCardsOnHand .cardOnHand');
                await click('.field-playerZoneCards .card-ghost:eq(0)');

                await click('.opponentCardsInPlayerZone .card:eq(0) .selectable');
            },
            'should NOT have card in zone'() {
                assert.elementCount('.field-playerZoneCards .card:not(.card-placeholder)', 1);
            },
            'should NOT have card in hand'() {
                assert.elementCount('.field-playerCardsOnHand .cardOnHand', 0);
            },
            'should have discarded card'() {
                assert.elementCount('.field-player .field-discardPile .card[data-cardId="C1A"]', 1);
            },
            'should NOT show guide text'() {
                assert.elementCount('.guideText', 0);
            },
            'should NOT be able to select ANY card'() {
                assert.elementCount('.selectable', 0);
            },
            'should emit put down card with opponent card id as "choice"'() {
                assert.calledWith(this.matchController.emit, 'putDownCard', {
                    location: 'zone',
                    cardId: 'C1A',
                    choice: 'C5A'
                });
            }
        }
    },
    'Trigger happy joe:': {
        'when moved to opponent zone last turn and has attacked station card once this turn and ready card again for attack': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInOpponentZone: [{ id: 'C1A', type: 'spaceShip', commonId: TriggerHappyJoeCommonId }],
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
            },
            'should be able to attack another unflipped station card'() {
                assert.elementCount('.field-opponentStation .attackable', 1);
            }
        }
    },
    'Deadly sniper': {
        'when card was placed this turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: DeadlySniperCommonId }],
                    opponentCardsInZone: [{ id: 'C2A' }],
                    opponentCardsInPlayerZone: [{ id: 'C3A' }],
                    opponentStationCards: [{ place: 'draw', id: 'C4A' }],
                    events: [
                        PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })
                    ]
                }));
                await timeout();

                await click('.playerCardsInZone .card .readyToAttack');
            },
            'should NOT be able to attack opponent card in opponent zone'() {
                assert.elementCount('.opponentCardsInZone .attackable', 0);
            },
            'should NOT be able to attack station card'() {
                assert.elementCount('.field-opponentStation .attackable', 0);
            },
            'should be able to attack opponent card in home zone'() {
                assert.elementCount('.opponentCardsInPlayerZone .attackable', 1);
            }
        },
        'when was placed last turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: DeadlySniperCommonId }],
                    opponentCardsInZone: [{ id: 'C2A' }],
                    events: [
                        PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })
                    ]
                }));
                await timeout();

                await click('.playerCardsInZone .card .readyToAttack');
            },
            'should be able to attack opponent card in opponent zone '() {
                assert.elementCount('.opponentCardsInZone .attackable', 1);
            },
            'should be able to attack opponent station card'() {
                assert.elementCount('.field-opponentStation .attackable', 1);
            }
        }
    },
    // 'Expansion:': { //TODO What to do about this test? The card expansion is replaced with a new one with a different ability
    //     'when has expansion in play and has put down a station card and hold a card': {
    //         async setUp() {
    //             const { dispatch } = createController();
    //             controller.showPage();
    //             dispatch('restoreState', FakeState({
    //                 turn: 1,
    //                 currentPlayer: 'P1A',
    //                 phase: 'action',
    //                 stationCards: [{ id: 'C1A', place: 'draw' }],
    //                 cardsInZone: [{ id: 'C2A', type: 'duration', commonId: ExpansionCommonId }],
    //                 cardsOnHand: [{ id: 'C3A' }],
    //                 events: [
    //                     PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' }),
    //                     { type: 'putDownExtraStationCard', effectCardId: 'C2A', turn: 1 }
    //                 ]
    //             }));
    //             await timeout();
    //
    //             await click('.field-playerCardsOnHand .cardOnHand');
    //         },
    //         'should be able to put down a second station card'() {
    //             assert.elementCount('.field-playerStation .card-ghost', 3);
    //         }
    //     }
    // },
    'Pursuiter:': {
        'when has card and an opponent card in home zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                    opponentCardsInPlayerZone: [{ id: 'C2A' }],
                    events: [PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })]
                }));
                await timeout();
            },
            'should be able to sacrifice own card'() {
                assert.elementCount('.playerCardsInZone .sacrifice', 1);
            }
        },
        'when is NOT attack phase and has card and an opponent card in home zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'action',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                    opponentCardsInPlayerZone: [{ id: 'C2A' }],
                    events: [PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })]
                }));
                await timeout();
            },
            'should NOT be able to sacrifice own card'() {
                assert.elementCount('.playerCardsInZone .sacrifice', 0);
            }
        },
        'when has card THAT IS NOT PURSUITER and an opponent card in home zone': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip' }],
                    opponentCardsInPlayerZone: [{ id: 'C2A' }],
                    events: [PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })]
                }));
                await timeout();
            },
            'should NOT be able to sacrifice own card'() {
                assert.elementCount('.playerCardsInZone .sacrifice', 0);
            }
        },
        'when select card to sacrifice and selects other card': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', type: 'spaceShip', commonId: PursuiterCommonId }],
                    opponentCardsInPlayerZone: [{ id: 'C2A' }],
                    events: [PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })]
                }));
                await timeout();

                await click('.playerCardsInZone .sacrifice');
                await click('.opponentCardsInPlayerZone .selectable');
            },
            'should emit sacrifice with target card id': function () {
                assert.calledWith(this.matchController.emit, 'sacrifice', { cardId: 'C1A', targetCardId: 'C2A' });
            }
        },
        'when select card in home zone to sacrifice': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should NOT be able to select opponent card in opponent home zone': function () {
                assert.elementCount('.opponentCardsInZone .selectable', 0);
            },
            'should be able to select opponent card in player home zone': function () {
                assert.elementCount('.opponentCardsInPlayerZone .selectable', 1);
            },
            'should NOT be able to select opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 0);
            },
            'should NOT be able to select player card to target for sacrifice': function () {
                assert.elementCount('.playerCardsInZone .selectable', 0);
            },
            'should NOT be able to any card for attack': function () {
                assert.elementCount('.readyToAttack', 0);
            },
            'should NOT show extra transient card in home zone': function () {
                assert.elementCount('.playerCardsInZone .card:not(.card-placeholder)', 2);
            }
        },
        'when select card in opponent zone to sacrifice': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should be able to select opponent card in opponent home zone': function () {
                assert.elementCount('.opponentCardsInZone .selectable', 1);
            },
            'should NOT be able to select opponent card in player home zone': function () {
                assert.elementCount('.opponentCardsInPlayerZone .selectable', 0);
            },
            'should be able to select opponent station card': function () {
                assert.elementCount('.opponentStationCards .card:eq(0) .selectable', 1);
            },
            'should NOT be able to select flipped opponent station card': function () {
                assert.elementCount('.opponentStationCards .card:eq(1) .selectable', 0);
            }
        },
        'when select card in opponent zone to sacrifice and opponent has energy shield': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should be able to select opponent card in opponent home zone': function () {
                assert.elementCount('.opponentCardsInZone .selectable', 1);
            },
            'should NOT be able to select opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 0);
            }
        },
        'when select card to sacrifice and select a station card': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should NOT be able to select opponent card in opponent home zone': function () {
                assert.elementCount('.opponentCardsInZone .selectable', 0);
            },
            'should be able to select second opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 1);
            }
        },
        'when select card to sacrifice and select a 4 station cards': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should emit sacrifice with station card ids'() {
                assert.calledWith(this.matchController.emit, 'sacrifice', {
                    cardId: 'C1A',
                    targetCardIds: ['C2A', 'C3A', 'C4A', 'C5A']
                });
            },
            'should NOT be able to select another opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 0);
            }
        },
        'when select card to sacrifice and opponent has 3 unflipped station cards and select all 3': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
                    turn: 1,
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
            },
            'should emit sacrifice with station card ids'() {
                assert.calledWith(this.matchController.emit, 'sacrifice', {
                    cardId: 'C1A',
                    targetCardIds: ['C2A', 'C3A', 'C4A']
                });
            },
            'should NOT be able to select another opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 0);
            }
        },
        'when opponent has 1 station card and player has card in opponent zone with the ability to sacrifice itself': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should be able to select card for sacrifice'() {
                assert.elementCount('.playerCardsInOpponentZone .sacrifice', 1);
            }
        },
        'when select card to sacrifice and opponent has 1 station card and select that card': {
            async setUp() {
                this.matchController = FakeMatchController({ emit: stub() });
                const { dispatch } = createController({ matchController: this.matchController });
                controller.showPage();
                dispatch('restoreState', FakeState({
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
            },
            'should emit sacrifice with station card ids'() {
                assert.calledWith(this.matchController.emit, 'sacrifice', { cardId: 'C1A', targetCardIds: ['C2A'] });
            },
            'should NOT be able to select another opponent station card': function () {
                assert.elementCount('.opponentStationCards .selectable', 0);
            }
        }
    },
    'The Shade:': {
        'when opponent card is The Shade and it has NOT attacked this turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    phase: 'attack',
                    cardsInZone: [{ id: 'C1A', attack: 1 }],
                    opponentCardsInPlayerZone: [{ id: 'C2A', commonId: TheShadeCommonId }],
                    events: [PutDownCardEvent({ turn: 1, cardId: 'C1A' })],
                    opponentEvents: []
                }));
                await timeout();
            },
            'player card should NOT be able to attack'() {
                assert.elementCount('.playerCardsInZone .readyToAttack', 0);
            }
        },
        'when PLAYER IS THE FIRST PLAYER and opponent card is The Shade and it has attacked last turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'player card should be able to attack'() {
                assert.elementCount('.playerCardsInZone .readyToAttack', 1);
            }
        },
        'when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked this turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'player card should be able to attack'() {
                assert.elementCount('.playerCardsInZone .readyToAttack', 1);
            }
        },
        'when PLAYER IS THE SECOND PLAYER and opponent card is The Shade and it has attacked last turn': {
            async setUp() {
                const { dispatch } = createController();
                controller.showPage();

                dispatch('restoreState', FakeState({
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
            },
            'player card should NOT be able to attack'() {
                assert.elementCount('.playerCardsInZone .readyToAttack', 0);
            }
        }
    }
};

let methods = {
    describe,
    test,
    beforeEach,
    afterEach
};
let testContext = {
    testContext: 'yeah'
};
let myStack = loopOverTestConfig(testConfig);
let myTests = setItUp(myStack);
for (let callback of myTests) {
    callback();
}

function setItUp(stack, depth = 0) {

    let callbacks = [];
    while (stack.length > 0) {
        let piece = stack.pop();

        if (piece.method === 'beforeEach' || piece.method === 'afterEach') {
            callbacks.push(function () {
                methods[piece.method](piece.fn);
            });
        }
        else if (piece.method === 'describe') {
            let subCallbacks = setItUp(piece.stack, depth + 1);
            if (piece.name.startsWith('=>')) {
                callbacks.push(function () {
                    methods[piece.method].only(piece.name, function () {
                        for (let subCallback of subCallbacks) {
                            subCallback();
                        }
                    });
                });
            }
            else {
                callbacks.push(function () {
                    methods[piece.method](piece.name, function () {
                        for (let subCallback of subCallbacks) {
                            subCallback();
                        }
                    });
                });
            }
        }
        else if (piece.method === 'test') {
            while (piece && piece.method === 'test') {
                let pieceToUse = piece;
                if (piece.name.startsWith('=>')) {
                    callbacks.push(function () {
                        methods[pieceToUse.method].only(pieceToUse.name, pieceToUse.fn);
                    });
                }
                else {
                    callbacks.push(function () {
                        methods[pieceToUse.method](pieceToUse.name, pieceToUse.fn);
                    });
                }

                piece = stack.pop();
            }
        }
    }

    return callbacks;
}

function loopOverTestConfig(config) {
    let stack = [];

    for (let key of Object.keys(config)) {
        if (key === 'setUp') {
            stack.push({ method: 'beforeEach', fn: config[key].bind(testContext) });
        }
        else if (key === 'tearDown') {
            stack.push({ method: 'afterEach', fn: config[key].bind(testContext) });
        }
        else {
            if (typeof config[key] === 'object') {
                let subStack = loopOverTestConfig(config[key]);
                stack.push({
                    method: 'describe',
                    name: key,
                    stack: subStack
                });
            }
            else if (typeof config[key] === 'function') {
                stack.push({ method: 'test', name: key, fn: config[key].bind(testContext) });
            }
        }
    }

    return stack.reverse();
}

function createController(options = {}) {
    controller = TestController(options);
    return { dispatch: controller.dispatch };
}

function TestController({ playerIds = ['P1A', 'P2A'], matchId = 'M1A', ...pageDeps } = {}) {
    const store = new Vuex.Store({});
    const [ownId, opponentId] = playerIds;
    const matchController = pageDeps.matchController || FakeMatchController();
    pageDeps.matchControllerFactory = pageDeps.matchControllerFactory || FakeMatchControllerFactory({ matchController });
    pageDeps.userRepository = pageDeps.userRepository || FakeUserRepository({ ownUser: { id: ownId } });
    pageDeps.cardInfoRepository = {
        getType() {},
        getCost() {},
        getImageUrl() {}
    };
    pageDeps.rootStore = store;
    pageDeps.rawCardDataRepository = { init() {}, get: () => cardsJson };

    const page = Page(pageDeps);

    return {
        dispatch(...args) {
            pageDeps.matchControllerFactory.getStoreDispatch()(...args);
        },
        showPage() {
            page.show({ matchId, opponentUser: { id: opponentId } });
        },
        tearDown() {
            page.hide();
        }
    };
}

function FakeMatchControllerFactory({ matchController = FakeMatchController() } = {}) {
    let _dispatch;
    return {
        create: ({ dispatch }) => {
            _dispatch = dispatch;
            return matchController;
        },
        getStoreDispatch: () => _dispatch
    }
}

function FakeMatchController(options = {}) {
    return defaults(options, {
        start() {
        },
        emit: stub(),
        stop() {}
    });
}

function FakeState(options) {
    const cardsInZone = options.cardsInZone || [];
    options.cardsInZone = cardsInZone.map(c => createCard(c));
    options.cardsInOpponentZone = (options.cardsInOpponentZone || []).map(c => createCard(c));
    options.opponentCardsInZone = (options.opponentCardsInZone || []).map(c => createCard(c));
    options.cardsOnHand = (options.cardsOnHand || []).map(c => createCard(c));

    return defaults(options, {
        stationCards: [{ place: 'draw' }], //Needed to not always show a Defeated screen
        cardsOnHand: [],
        cardsInZone: [],
        cardsInOpponentZone: [],
        discardedCards: [],
        opponentCardCount: 0,
        opponentDiscardedCards: [],
        opponentStationCards: [{ place: 'draw' }], //Needed to not always show a Defeated screen
        opponentCardsInZone: [],
        opponentCardsInPlayerZone: [],
        events: [],
        requirements: [],
        phase: 'wait',
        turn: 1,
        currentPlayer: 'P2A',
        opponentRetreated: false,
        playerRetreated: false,
        playerOrder: ['P1A', 'P2A']
    });
}

function FakeUserRepository({ ownUser }) {
    return {
        getOwnUser() {
            return ownUser;
        }
    }
}