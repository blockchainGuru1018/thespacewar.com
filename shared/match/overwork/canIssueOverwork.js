module.exports = function ({ phase, unflippedStationCardCount, hasRequirements }) {
    return unflippedStationCardCount > 1
        && phase === 'action'
        && !hasRequirements;
};