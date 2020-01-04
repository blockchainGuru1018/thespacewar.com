const getCardImageUrl = require('../utils/getCardImageUrl.js');
const FakeState = require('../testUtils/FakeState.js');
const { createController } = require('../testUtils');
const {
    assert,
    sinon,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

let controller;

beforeEach(() => {
    sinon.stub(getCardImageUrl, 'byCommonId').returns('/#');

    controller = createController();
});

afterEach(() => {
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();
});

describe('show notification banner when...', () => {
    test('attack was countered', async () => {
        await triggerActionLogChangeWithEntry(LogEntry('counteredAttackOnCard', 'ABC'));
        assert.elementCount('.notificationBanner', 1);
        assert.elementText('.notificationBanner-header', 'ABC');
    });
    test('played card was countered', async () => {
        await triggerActionLogChangeWithEntry(LogEntry('countered', 'DEF'));
        assert.elementCount('.notificationBanner', 1);
        assert.elementText('.notificationBanner-header', 'DEF');
    });
});

test('when NO nothing has changed should NOT show notification', async () => {
    const { dispatch, showPage } = controller;
    showPage();
    dispatch('stateChanged', FakeState({
        phase: 'attack',
        actionLogEntries: []
    }));
    await timeout();
    assert.elementCount('.notificationBanner', 0);
});

async function triggerActionLogChangeWithEntry(entry) {
    const { dispatch, showPage } = controller;
    showPage();
    dispatch('stateChanged', FakeState({
        phase: 'attack',
        actionLogEntries: []
    }));
    dispatch('stateChanged', FakeState({
        actionLogEntries: [entry],
    }));
    await timeout();
}

function LogEntry(action, text = '') {
    return { action, text }
}

//TODO Banner for counter card (as opposed to counter attack)
//TODO Refactor store to use factory
//TODO Refactor: Split up PlayerHud.vue
