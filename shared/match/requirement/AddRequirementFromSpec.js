const infoByCardCommonId = require('../../card/info/infoByCardCommonId.js');

module.exports = function ({ //TODO Is there a better name for this class? Perhaps "AddRequirementSpec"/"RequirementSpecAdder"
    playerStateService,
    playerRequirementService,
    playerRequirementFactory,
    opponentRequirementService,
    opponentRequirementFactory
}) {
    return {
        forCardAndChoiceOfRequirement,
        forCardPutDownInHomeZone,
        forCardAndSpec
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
        forCardAndSpec(card, spec);
    }

    function forCardAndSpec(card, spec) {
        spec.forPlayer.forEach(spec => {
            const requirement = playerRequirementFactory.create(card, spec);
            playerRequirementService.addCardRequirement(requirement);
        });

        spec.forOpponent.forEach(spec => {
            const requirement = opponentRequirementFactory.create(card, spec);
            opponentRequirementService.addCardRequirement(requirement);
        });
    }
};
