const ExcellentWorkPlayer = require('../../../ai/cardPlayers/ExcellentWorkPlayer.js');
const ExcellentWork = require('../../../../shared/card/ExcellentWork.js');

test('when card has common ID of Excellent Work should accept card', () => {
    const player = ExcellentWorkPlayer({});
    expect(player.forCard({ commonId: ExcellentWork.CommonId })).toBe(true);
});

test('should play Excellent Work to station row decided by decider', () => {
    const matchController = { emit: jest.fn() };
    const player = ExcellentWorkPlayer({ matchController, decideRowForStationCard: () => 'action' });

    player.play({ id: 'C1A' });

    expect(matchController.emit).toBeCalledWith('putDownCard', {
        cardId: 'C1A',
        location: 'station-action',
        choice: 'putDownAsExtraStationCard'
    });
});
