const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const FakeMatchController = require('../testUtils/FakeMatchController.js');
const { createController } = require('../testUtils');

const {
    assert,
    refute,
    timeout,
    stub,
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

describe('with cards from 2 sources', () => {
    test('should only show 2 groups', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementCount('.findCard-group', 2);
    });

    test('should show first group', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementText('.findCard-groupHeader:eq(0)', 'Deck');
        assert.elementCount('.findCard-group:eq(0) .findCard-card', 1);
    });

    test('should show second group', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementText('.findCard-groupHeader:eq(1)', 'Discard pile');
        assert.elementCount('.findCard-group:eq(1) .findCard-card', 2);
    });

    test('should show find card requirement header', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementText('.findCard-header', 'Pick 2 cards to play');
    });

    test('should show card that caused requirement', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementCount('.findCard-requirementCard', 1);
        const requirementCard = document.querySelector('.findCard-requirementCard img');
        const src = requirementCard.src;
        assert(src.includes('17'), `Card has src "${src}", should include its commond if of "17"`);
    });

    test('should NOT show "Done" button', async () => {
        await setupWithRequirement(requirementWithTwoSourcesAndCommonId('17'));

        assert.elementCount('.findCard-done', 0);
    });
});

test('when select a card and requirement is of count 1 should emit selectCard', async () => {
    await setupWithRequirement(countOneAndOneCardRequirement());

    await click('.findCard-card:eq(0)');

    assert.calledOnceWith(matchController.emit, 'selectCardForFindCardRequirement', {
        cardGroups: [{
            source: 'deck',
            cardIds: ['C1A']
        }]
    });
});

describe('when select a card and requirement is of count 2', () => {
    test('should NOT emit action', async () => {
        await setupWithRequirement(requirementWithCountTwoAndTwoCardsLeft('C1A', 'C2A'));

        await click('.findCard-card:eq(0)');

        refute.calledWith(matchController.emit, 'selectCardForFindCardRequirement');
    });

    test('should NOT show selected card', async () => {
        await setupWithRequirement(requirementWithCountTwoAndTwoCardsLeft('C1A', 'C2A'));

        await click('.findCard-card:eq(0)');

        assert.elementText('.findCard-groupHeader', 'Discard pile');
        assert.elementCount('.findCard-card', 1);
    });

    test('should show 1 card left to select', async () => {
        await setupWithRequirement(requirementWithCountTwoAndTwoCardsLeft('C1A', 'C2A'));

        await click('.findCard-card:eq(0)');

        assert.elementText('.findCard-header', 'Pick 1 card to play');
    });

    test('and select second card should emit action', async () => {
        await setupWithRequirement(requirementWithCountTwoAndTwoCardsLeft('C1A', 'C2A'));
        await click('.findCard-card:eq(0)');

        await click('.findCard-card');

        assert.calledWith(matchController.emit, 'selectCardForFindCardRequirement', {
            cardGroups: [
                { source: 'deck', cardIds: ['C1A'] },
                { source: 'discardPile', cardIds: ['C2A'] }
            ]
        });
    });
});

test('select last card of requirement and get another one with count 2 and select 1 card should NOT emit action', async () => {
    const { dispatch } = await setupWithRequirement({
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
    });
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

    refute.calledWith(matchController.emit, 'selectCardForFindCardRequirement');
});

test('when has NO cards to select and click "Done" should emit action with no cards selected', async () => {
    await setupWithRequirement({
        type: 'findCard',
        count: 1,
        cardGroups: [],
        cardCommonId: '17'
    });

    await click('.findCard-done');

    assert.calledWith(matchController.emit, 'selectCardForFindCardRequirement', {
        cardGroups: []
    });
});

test('when requirement is cancelable and cancels requirement should emit cancelRequirement', async () => {
    await setupWithRequirement(cancelableRequirement());

    await click('.findCard-cancel');

    assert.calledOnceWith(matchController.emit, 'cancelRequirement');
});

test('when requirement is NOT cancelable should NOT show cancel button', async () => {
    await setupWithRequirement(countOneAndOneCardRequirement());

    assert.elementCount('.findCard-cancel', 0);
});

function cancelableRequirement() {
    return {
        type: 'findCard',
        count: 1,
        cardGroups: [{
            source: 'deck',
            cards: [
                createCard({ id: 'C1A' }),
            ]
        }],
        cardCommonId: '17',
        cancelable: true,
    };
}

async function setupWithRequirement(requirement) {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch('stateChanged', FakeState({
        turn: 1,
        currentPlayer: 'P1A',
        phase: 'action',
        requirements: [requirement]
    }));
    await timeout();

    return {
        dispatch
    };
}

function requirementWithCountTwoAndTwoCardsLeft(firstCardLeftId, secondCardLeftId) {
    return {
        type: 'findCard',
        count: 2,
        cardGroups: [
            { source: 'deck', cards: [createCard({ id: firstCardLeftId })] },
            { source: 'discardPile', cards: [createCard({ id: secondCardLeftId })] }
        ],
        cardCommonId: '17'
    };
}

function requirementWithTwoSourcesAndCommonId(commonId) {
    return {
        type: 'findCard',
        count: 2,
        cardGroups: [
            { source: 'deck', cards: [createCard({ id: 'C1A' })] },
            { source: 'discardPile', cards: [createCard({ id: 'C2A' }), createCard({ id: 'C3A' })] }
        ],
        cardCommonId: commonId
    };
}

function countOneAndOneCardRequirement() {
    return {
        type: 'findCard',
        count: 1,
        cardGroups: [{ source: 'deck', cards: [createCard({ id: 'C1A' })] }],
        cardCommonId: '17'
    };
}
