const CheatError = require('../../../server/match/CheatError.js');

module.exports = function ({
    playerStateService,
    playerRequirementService,
    opponentRequirementService,
    overworkEventFactory
}) {

    return {
        overwork
    };

    function overwork() {
        let unflippedStationCardsCount = playerStateService.getUnflippedStationCardsCount();
        if (unflippedStationCardsCount < 2) throw new CheatError('Too few undamaged station cards');

        opponentRequirementService.addDamageStationCardRequirement({ count: 1, reason: 'overwork', common: true });
        playerRequirementService.addEmptyCommonWaitingRequirement({ type: 'damageStationCard', reason: 'overwork' });
        overworkEventFactory.createAndStore();
    }
};