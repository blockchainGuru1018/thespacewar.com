const canIssueOverworkFn = require('./canIssueOverwork.js'); //TODO This should perhaps just be an internal method
const CheatError = require('../../../server/match/CheatError.js');
const Commander = require("../commander/Commander.js");

module.exports = function ({
    matchService,
    playerStateService,
    playerRequirementService,
    queryPlayerRequirements,
    opponentRequirementService,
    overworkEventFactory,
    playerCommanders,
    opponentActionLog
}) {

    return {
        canIssueOverwork,
        overwork
    };

    function canIssueOverwork() {
        return playerCommanders.has(Commander.GeneralJackson)
            && canIssueOverworkFn({
                playerId: playerStateService.getPlayerId(),
                currentPlayer: matchService.getCurrentPlayer(),
                unflippedStationCardCount: playerStateService.getUnflippedStationCardsCount(),
                hasRequirements: queryPlayerRequirements.hasAnyRequirements(),
                phase: playerStateService.getPhase()
            });
    }

    function overwork() {
        const unflippedStationCardsCount = playerStateService.getUnflippedStationCardsCount();
        if (unflippedStationCardsCount < 2) throw new CheatError('Too few undamaged station cards');

        opponentRequirementService.addDamageStationCardRequirement({ count: 1, reason: 'overwork', common: true });
        playerRequirementService.addEmptyCommonWaitingRequirement({ type: 'damageStationCard', reason: 'overwork' });
        overworkEventFactory.createAndStore();

        opponentActionLog.opponentIssuedOverwork();
    }
};
