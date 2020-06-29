const CheatError = require('../../../server/match/CheatError.js');
const Commander = require("../commander/Commander.js");
const PerfectPlan = require("../../card/PerfectPlan.js");

const PerfectPlanStationCardCost = 2;

module.exports = function ({
    playerPhase,
    playerStateService,
    queryPlayerRequirements,
    playerRequirementService,
    opponentRequirementService,
    playerCommanders,
    opponentActionLog,
    addRequirementFromSpec
}) {

    return {
        canIssuePerfectPlan,
        perfectPlan
    };

    function canIssuePerfectPlan() {
        return playerCommanders.has(Commander.DrStein)
            && playerPhase.isAction()
            && hasEnoughUnflippedStationCards()
            && !queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement();
    }

    function perfectPlan() {
        const unflippedStationCardsCount = playerStateService.getUnflippedStationCardsCount();
        if (unflippedStationCardsCount < PerfectPlanStationCardCost + 1) throw new CheatError('Too few undamaged station cards');

        opponentRequirementService.addDamageStationCardRequirement({
            count: PerfectPlanStationCardCost,
            reason: 'perfectPlan',
            common: true
        });
        playerRequirementService.addEmptyCommonWaitingRequirement({
            type: 'damageStationCard',
            reason: 'perfectPlan'
        });

        const fakeCard = { commonId: PerfectPlan.CommonId };
        addRequirementFromSpec.forCardAndSpec(fakeCard, PerfectPlan.Info.requirementSpecsWhenPutDownInHomeZone);

        opponentActionLog.opponentIssuedPerfectPlan();
    }

    function hasEnoughUnflippedStationCards() {
        const unflippedStationCardsCount = playerStateService.getUnflippedStationCardsCount();
        const opponentsQueuedDamageStationCardCount = opponentRequirementService.getQueuedDamageStationCardCount();
        const stationCardsAvailableToSacrifice = unflippedStationCardsCount - opponentsQueuedDamageStationCardCount;
        return stationCardsAvailableToSacrifice > PerfectPlanStationCardCost;
    }
};
