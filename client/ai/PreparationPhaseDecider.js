const { PHASES } = require("../../shared/phases.js");

module.exports = function ({ matchController }) {
    return {
        decide,
    };

    function decide() {
        matchController.emit("nextPhase", { currentPhase: PHASES.preparation });
    }
};
