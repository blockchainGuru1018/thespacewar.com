/**
 * @jest-environment node
 */
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');
const { PHASES } = require('../../../shared/phases.js');
const { setupFromState, BotId, PlayerId } = require('./botTestHelpers.js');

test('when has requirement draw should draw a card', async () => {
    const { matchController } = await setupFromState({
        requirements: [{
            type: 'drawCard',
            count: 1
        }]
    });
    expect(matchController.emit).toBeCalledWith('drawCard');
});

test('when is waiting on opponent with draw requirement should NOT EMIT ANYTHING', async () => {
    const { matchController } = await setupFromState({
        requirements: [{
            type: 'drawCard',
            waiting: true
        }]
    });
    expect(matchController.emit).not.toBeCalled();
});

test.todo('HANDLE REQUIREMENTS OF TYPES: DISCARD, DESTROY OPPONENT STATION, ');
