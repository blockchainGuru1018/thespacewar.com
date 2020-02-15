import setupTest from "./setupTest.js";

const FakeState = require('../testUtils/FakeState.js');
const OverCapacity = require('../../shared/card/OverCapacity.js');
const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const {
    assert,
    timeout,
    dom: {
        click
    }
} = require('../testUtils/bocha-jest/bocha-jest.js');

jest.mock('../utils/featureToggles.js', () => ({ isEnabled: name => name === 'lookAtStationRow' }));

test('when has Over Capacity in play should see "look at" overlay for hand size (bottom) row', async () => {
    const { dispatch, showPage } = setupTest();
    showPage();
    dispatch('stateChanged', FakeState({
        phase: 'action',
        currentPlayer: 'P1A',
        cardsInZone: [{ commonId: OverCapacity.CommonId, id: 'C1A' }],
        events: [PutDownCardEvent.forTest({ cardId: 'C1A' })]
    }));
    await timeout();

    assert.elementCount('.field-playerStation .field-stationRow:eq(2) .lookAtStationRowOverlay', 1);
});

test('when click "look at" overlay should issue lookAt requirement for FIRST matching card', async () => {
    const emitStub = jest.fn();
    const { dispatch, showPage } = setupTest(emitStub);
    showPage();
    dispatch('stateChanged', FakeState({
        phase: 'action',
        currentPlayer: 'P1A',
        cardsInZone: [
            { commonId: OverCapacity.CommonId, id: 'C1A' },
            { commonId: OverCapacity.CommonId, id: 'C2A' }
        ],
        events: [
            PutDownCardEvent.forTest({ cardId: 'C1A' }),
            PutDownCardEvent.forTest({ cardId: 'C2A' }),
        ]
    }));
    await timeout();

    await click('.field-playerStation .field-stationRow:eq(2) .lookAtStationRowOverlay', 1);

    expect(emitStub).toBeCalledWith('lookAtStationRow', { stationRow: 'handSize', cardId: 'C1A' });
});
