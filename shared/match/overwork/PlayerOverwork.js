const canIssueOverworkFn = require('./canIssueOverwork.js'); //TODO This should perhaps just be an internal method
const CheatError = require('../../../server/match/CheatError.js');

module.exports = function ({
    matchService,
    playerStateService,
    playerRequirementService,
    opponentRequirementService,
    overworkEventFactory
}) {

    return {
        canIssueOverwork,
        overwork
    };

    function canIssueOverwork() {
        return canIssueOverworkFn({
            playerId: playerStateService.getPlayerId(),
            currentPlayer: matchService.getCurrentPlayer(),
            unflippedStationCardCount: playerStateService.getUnflippedStationCardsCount(),
            hasRequirements: playerRequirementService.hasAnyRequirement(),
            phase: playerStateService.getPhase()
        });
    }

    function overwork() {
        let unflippedStationCardsCount = playerStateService.getUnflippedStationCardsCount();
        if (unflippedStationCardsCount < 2) throw new CheatError('Too few undamaged station cards');

        opponentRequirementService.addDamageStationCardRequirement({ count: 1, reason: 'overwork', common: true });
        playerRequirementService.addEmptyCommonWaitingRequirement({ type: 'damageStationCard', reason: 'overwork' });
        overworkEventFactory.createAndStore();
    }
};
