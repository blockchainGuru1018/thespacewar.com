const CheatError = require("../../../shared/match/card/CheatError.js");

module.exports = function CancelRequirement({
    createPlayerRequirementUpdater,
}) {
    return () => {
        const firstRequirementUpdater = createPlayerRequirementUpdater({
            cancelable: true,
        });
        if (!firstRequirementUpdater.exists()) {
            throw new CheatError("No cancelable requirement");
        }

        firstRequirementUpdater.resolve();
    };
};
