const { PHASES } = require("../../../shared/phases.js");

module.exports = function PlayerInactivityService({
  gameConfig,
  matchService,
  matchComService,
  retreat,
  logger,
}) {
  const maxMinuteOfInactivity = matchComService.getPlayerIds().includes("BOT")
    ? gameConfig.minutesOfInactivityResultInAutoLossVsBot()
    : gameConfig.minutesOfInactivityResultInAutoLoss();

  return {
    checkLastTimeOfInactivityForPlayer,
  };

  function checkLastTimeOfInactivityForPlayer(playerId) {
    const playerState = matchService.getPlayerState(playerId);
    const gameStartTime = matchService.getState().gameStartTime;

    if (matchService.getCurrentPlayer() === playerId) {
      validateTimestampsForPlayer(playerId, playerState, gameStartTime);
    }

    if (isOpponentDisconnected()) {
      const opponentId = matchService.getOpponentId();
      const opponentState = matchService.getPlayerState(opponentId);
      validateTimestampsForPlayer(opponentId, opponentState, gameStartTime);
    }
  }

  function validateTimestampsForPlayer(playerId, playerState, gameStartTime) {
    if (playerState) {
      if (playerAsBeenInactiveForMaxPeriod(playerState.events, gameStartTime)) {
        logger.log(
          `player ${playerId} was forced to retreat because of inactivity`
        );
        retreat(playerId);
      }
    }
  }

  function playerAsBeenInactiveForMaxPeriod(events, gameStartTime) {
    const currentTimestamp = new Date();
    const lastEventOrGameStartTimeStamp =
      events.length > 0 ? events[events.length - 1].created : gameStartTime;
    return (
      maxMinuteOfInactivity <= currentTimestamp - lastEventOrGameStartTimeStamp
    );
  }

  function isOpponentDisconnected() {
    return matchComService.getPlayerConnection(matchService.getOpponentId())
      .disconnected;
  }
};
