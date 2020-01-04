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

describe('when get new entry in event log that Target Missed was used', () => {
    test('should show notification banner', async () => {
        await triggerActionLogChangeWithEntry(LogEntry('counteredAttackOnCard'));
        assert.elementCount('.notificationBanner', 1);
        assert.elementText('.notificationBanner-header', 'Opponent used Target Missed');
    });
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

function LogEntry(action) {
    return { action, text: '' }
}

//TODO Banner for counter card (as opposed to counter attack)
//TODO Refactor store to use factory
//TODO Refactor: Split up PlayerHud.vue
