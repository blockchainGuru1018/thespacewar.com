const infoByCardCommonId = require('../../card/info/infoByCardCommonId.js');

module.exports = function ({ //TODO Is there a better name for this class? Perhaps "AddRequirementSpec"/"RequirementSpecAdder"
    playerStateService,
    opponentStateService,
    playerRequirementService,
    playerRequirementFactory,
    opponentRequirementService,
    opponentRequirementFactory
}) {
    return {
        forCardAndChoiceOfRequirement,
        forCardPutDownInHomeZone,
        forCardAndSpec,
        forReasonAndSpec
    };

    function forCardAndChoiceOfRequirement(cardData, choice) {
        const info = infoByCardCommonId[cardData.commonId];
        if (!info) return;

        const card = playerStateService.createBehaviourCard(cardData);
        const spec = info.choiceToRequirementSpec[choice];
        if (spec) {
            forCardAndSpec(card, spec);
        }
    }

    function forCardPutDownInHomeZone(cardData) {
        const info = infoByCardCommonId[cardData.commonId];
        if (!info) return;

        const card = playerStateService.createBehaviourCard(cardData);
        const spec = info.requirementSpecsWhenPutDownInHomeZone;
        if (!spec) return;

        forCardAndSpec(card, spec);
    }

    function forCardAndSpec(card, spec) {
        const playerId = playerStateService.getPlayerId();
        const opponentId = opponentStateService.getPlayerId();
        const order = spec.opponentIsFirst
            ? [opponentId, playerId]
            : [playerId, opponentId];

        for (const id of order) {
            forCardAndSpecAndPlayer(card, spec, id);
        }
    }

    function forCardAndSpecAndPlayer(card, spec, playerId) {
        const requirementFactory = playerStateService.getPlayerId() === playerId ? playerRequirementFactory : opponentRequirementFactory;
        const requirementService = playerStateService.getPlayerId() === playerId ? playerRequirementService : opponentRequirementService;

        const requirementSpecs = playerId === playerStateService.getPlayerId() ? spec.forPlayer : spec.forOpponent;
        for (const spec of requirementSpecs) {
            const requirement = requirementFactory.createForCardAndSpec(card, spec);

            let addedRequirement;
            if (isEmptyCommonWaitingRequirement(requirement)) {
                addedRequirement = requirementService.addEmptyCommonWaitingRequirement(requirement);
            }
            else {
                requirement.card = card; 
                addedRequirement = requirementService.addCardRequirement(requirement);
            }

            if (spec.ifAddedAddAlso && addedRequirement) {
                for (const otherSpec of spec.ifAddedAddAlso) {
                    forCardAndSpec(card, otherSpec);
                }
            }
        }
    }

    function forReasonAndSpec(reason, spec) {
        const playerId = playerStateService.getPlayerId();
        const opponentId = opponentStateService.getPlayerId();
        const order = spec.opponentIsFirst
            ? [opponentId, playerId]
            : [playerId, opponentId];

        for (const id of order) {
            forReasonAndSpecAndPlayer(reason, spec, id);
        }
    }

    function forReasonAndSpecAndPlayer(reason, spec, playerId) {
        const requirementService = playerStateService.getPlayerId() === playerId ? playerRequirementService : opponentRequirementService;

        const requirementSpecs = playerId === playerStateService.getPlayerId() ? spec.forPlayer : spec.forOpponent;
        for (const spec of requirementSpecs) {
            const requirement = { ...spec, reason };

            if (isEmptyCommonWaitingRequirement(requirement)) {
                requirementService.addEmptyCommonWaitingRequirement(requirement);
            }
            else {
                requirementService.addCardRequirement(requirement);
            }
        }
    }
};

function isEmptyCommonWaitingRequirement(requirement) {
    return requirement.count === 0 && requirement.common && requirement.waiting;
}
