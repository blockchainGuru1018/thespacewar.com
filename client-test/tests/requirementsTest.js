const FakeCardDataAssembler = require('../../server/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
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

describe('when has damageStationCard requirement by emptyDeck and is waiting', async () => {
    beforeEach(async () => {
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch('stateChanged', FakeState({
            turn: 1,
            currentPlayer: 'P1A',
            phase: 'action',
            requirements: [
                { type: 'damageStationCard', waiting: true, common: true, count: 0, reason: 'emptyDeck' }
            ]
        }));
        await timeout();
    });

    test('should show special text', async () => {
        assert.elementText('.guideText', 'Your opponent is dealing damage to your station');
    });
});

describe('when has find card requirement', () => {
    describe('with cards from 2 sources', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [
                    {
                        type: 'findCard',
                        count: 2,
                        cardGroups: [
                            { source: 'deck', cards: [createCard({ id: 'C1A' })] },
                            { source: 'discardPile', cards: [createCard({ id: 'C2A' }), createCard({ id: 'C3A' })] }
                        ],
                        cardCommonId: '17'
                    }
                ]
            }));
            await timeout();
        });

        test('should only show 2 groups', () => {
            assert.elementCount('.findCard-group', 2);
        });

        test('should show first group', () => {
            assert.elementText('.findCard-groupHeader:eq(0)', 'Deck');
            assert.elementCount('.findCard-group:eq(0) .findCard-card', 1);
        });

        test('should show second group', () => {
            assert.elementText('.findCard-groupHeader:eq(1)', 'Discard pile');
            assert.elementCount('.findCard-group:eq(1) .findCard-card', 2);
        });

        test('should show find card requirement header', () => {
            assert.elementText('.findCard-header', 'Pick 2 cards');
        });

        test('should show card that caused requirement', () => {
            assert.elementCount('.findCard-requirementCard', 1);
            const requirementCard = document.querySelector('.findCard-requirementCard img');
            const src = requirementCard.src;
            assert(src.includes('17'), `Card has src "${src}", should include its commond if of "17"`);
        });

        test('should NOT show "Done" button', () => {
            assert.elementCount('.findCard-done', 0);
        });
    });

    describe('when select a card and requirement is of count 1', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{
                    type: 'findCard',
                    count: 1,
                    cardGroups: [{ source: 'deck', cards: [createCard({ id: 'C1A' })] }],
                    cardCommonId: '17'
                }]
            }));
            await timeout();

            await click('.findCard-card:eq(0)');
        });

        test('should emit selectCard', () => {
            assert.calledOnceWith(matchController.emit, 'selectCardForFindCardRequirement', {
                cardGroups: [{
                    source: 'deck',
                    cardIds: ['C1A']
                }]
            });
        });
    });

    describe('when select a card and requirement is of count 2', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{
                    type: 'findCard',
                    count: 2,
                    cardGroups: [
                        { source: 'deck', cards: [createCard({ id: 'C1A' })] },
                        { source: 'discardPile', cards: [createCard({ id: 'C2A' })] }
                    ],
                    cardCommonId: '17'
                }]
            }));
            await timeout();

            await click('.findCard-card:eq(0)');
        });

        test('should NOT emit action', () => {
            refute.calledWith(matchController.emit, 'selectCardForFindCardRequirement');
        });

        test('should NOT show selected card', () => {
            assert.elementText('.findCard-groupHeader', 'Discard pile');
            assert.elementCount('.findCard-card', 1);
        });

        test('should show 1 card left to select', () => {
            assert.elementText('.findCard-header', 'Pick 1 card');
        });

        test('and select second card should emit action', async () => {
            await click('.findCard-card');

            assert.calledWith(matchController.emit, 'selectCardForFindCardRequirement', {
                cardGroups: [
                    { source: 'deck', cardIds: ['C1A'] },
                    { source: 'discardPile', cardIds: ['C2A'] }
                ]
            });
        });
    });

    describe('select last card of requirement and get another one with count 2 and select 1 card', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{
                    type: 'findCard',
                    count: 1,
                    cardGroups: [{
                        source: 'deck',
                        cards: [
                            createCard({ id: 'C1A' }),
                            createCard({ id: 'C2A' }),
                            createCard({ id: 'C3A' })
                        ]
                    }],
                    cardCommonId: '17'
                }]
            }));
            await timeout();
            await click('.findCard-card:eq(0)');
            matchController.emit = stub();

            dispatch('stateChanged', {
                requirements: [{
                    type: 'findCard',
                    count: 2,
                    cardGroups: [{
                        source: 'deck',
                        cards: [
                            createCard({ id: 'C2A' }),
                            createCard({ id: 'C3A' })
                        ]
                    }],
                    cardCommonId: '17'
                }]
            });
            await click('.findCard-card:eq(0)');
        });

        test('should NOT emit action', () => {
            refute.calledWith(matchController.emit, 'selectCardForFindCardRequirement');
        });
    });

    describe('when has NO cards to select and click "Done""', () => {
        beforeEach(async () => {
            const { dispatch, showPage } = setUpController();
            showPage();
            dispatch('stateChanged', FakeState({
                turn: 1,
                currentPlayer: 'P1A',
                phase: 'action',
                requirements: [{
                    type: 'findCard',
                    count: 1,
                    cardGroups: [],
                    cardCommonId: '17'
                }]
            }));
            await timeout();

            await click('.findCard-done');
        });

        test('should emit action with no cards selected', async () => {
            assert.calledWith(matchController.emit, 'selectCardForFindCardRequirement', {
                cardGroups: []
            });
        });
    });
});
