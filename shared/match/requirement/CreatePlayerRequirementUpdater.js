const PlayerRequirementUpdater = require('./PlayerRequirementUpdater.js');

module.exports = function CreatePlayerRequirementUpdater({ //TODO This should replace PlayerRequirementUpdaterFactory
    playerStateService,
    playerRequirementService,
    opponentRequirementService,
    addRequirementFromSpec,
    cardFactory
}) {
    return (requirementMatchConditions = {}) => {
        return new PlayerRequirementUpdater({
            requirementMatchConditions,
            playerStateService,
            playerRequirementService,
            opponentRequirementService,
            addRequirementFromSpec,
            cardFactory
        });
    };
};
