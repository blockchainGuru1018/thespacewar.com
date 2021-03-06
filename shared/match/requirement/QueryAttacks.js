const ExtraTimeToCounterWhenOpponentEndedTurnQuickly = 3000;

//TODO It is confusing that this is at a higher level with dependencies than QueryEvents... perhaps its just an issue with its name?
module.exports = function ({
  gameConfig,
  playerTurnControl,
  playerEventRepository,
  opponentEventRepository,
  opponentStateService,
  getCurrentTime,
}) {
  return {
    canBeCountered,
    attackEventOnTheTimeIntervalToCounter,
  };

  function canBeCountered() {
    return getCardAttacksSinceLastTookControlWithinTimeFrame(
      gameConfig.timeToCounter()
    );
  }

  function attackEventOnTheTimeIntervalToCounter() {
    //TODO: Repeated logic but we refactor after test dont worries
    return getOpponentEventAttacksNotCountered().some((event) => {
      return (
        timeSinceEvent(event) <=
        gameConfig.timeToCounter() +
          ExtraTimeToCounterWhenOpponentEndedTurnQuickly
      );
    });
  }

  function getCardAttacksSinceLastTookControlWithinTimeFrame(
    millisecondsTimeFrame
  ) {
    return getOpponentEventAttacksNotCountered().filter((event) => {
      if (playerTurnControl.playerHasControlOfOwnTurn()) {
        return (
          timeSinceEvent(event) <=
          millisecondsTimeFrame + ExtraTimeToCounterWhenOpponentEndedTurnQuickly
        );
      } else {
        return playerLastTookControlWithinTimeFrameSinceAttackOnPlayer(
          event,
          millisecondsTimeFrame
        );
      }
    });
  }

  function getOpponentEventAttacksNotCountered() {
    return opponentEventRepository
      .getAll()
      .slice()
      .reverse()
      .filter((event) => {
        return (
          event.type === "attack" &&
          !event.countered &&
          opponentStateService.findCardFromAnySource(event.attackerCardId)
            .type === "spaceShip"
        );
      });
  }

  function playerLastTookControlWithinTimeFrameSinceAttackOnPlayer(
    attackOnPlayer,
    millisecondsTimeFrame
  ) {
    const playerEvents = playerEventRepository.getAll().slice();
    const indexOfLatestTakingOfControl = findLastIndex(
      playerEvents,
      (e) => e.type === "takeControlOfOpponentsTurn"
    );
    const indexOfLatestReleaseOfControl = findLastIndex(
      playerEvents,
      (e) => e.type === "releaseControlOfOpponentsTurn"
    );

    if (indexOfLatestTakingOfControl > indexOfLatestReleaseOfControl) {
      const takeControlOfOpponentsTurnEvent =
        playerEvents[indexOfLatestTakingOfControl];
      const timeDifference =
        takeControlOfOpponentsTurnEvent.created - attackOnPlayer.created;
      return timeDifference >= 0 && timeDifference <= millisecondsTimeFrame;
    }

    return false;
  }

  function timeSinceEvent(event) {
    return getCurrentTime() - event.created;
  }

  function findLastIndex(collection, selector) {
    const indexInReverseCollection = collection
      .slice()
      .reverse()
      .findIndex(selector);
    if (indexInReverseCollection === -1) return -1;
    return collection.length - 1 - indexInReverseCollection;
  }
};
