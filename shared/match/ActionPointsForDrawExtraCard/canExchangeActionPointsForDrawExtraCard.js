module.exports = function ({
    playerId,
    currentPlayer,
    phase,
    actionPoints,
    hasRequirements,
  }) {
    return (
      playerId === currentPlayer &&
      actionPoints > 1 &&
      phase === "action" &&
      !hasRequirements
    );
  };
  