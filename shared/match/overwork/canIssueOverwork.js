module.exports = function ({ playerId, currentPlayer, phase, unflippedStationCardCount, hasRequirements }) {
    return playerId === currentPlayer
        && unflippedStationCardCount > 1
        && phase === 'action'
        && !hasRequirements;
};
