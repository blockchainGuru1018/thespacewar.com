const TimeFrameMilliseconds = 5000;

module.exports = function ({
    opponentStateService,
    opponentEventRepository,
    playerEventRepository
}) {

    return {
        canBeCountered
    };

    function canBeCountered() {
        return getCardAttacksSinceLastTookControlWithinTimeFrame(TimeFrameMilliseconds);
    }

    function getCardAttacksSinceLastTookControlWithinTimeFrame(millisecondsTimeFrame) {
        return opponentEventRepository
            .getAll()
            .slice()
            .reverse()
            .filter(event => {
                return event.type === 'attack'
                    && !event.countered
                    && opponentStateService.findCardFromAnySource(event.attackerCardId).type === 'spaceShip'
                    && playerLastTookControlWithinTimeFrameSinceAttackOnPlayer(event, millisecondsTimeFrame);
            });
    }

    function playerLastTookControlWithinTimeFrameSinceAttackOnPlayer(attackOnPlayer, millisecondsTimeFrame) {
        const playerEvents = playerEventRepository.getAll().slice();
        const indexOfLatestTakingOfControl = findLastIndex(playerEvents, e => e.type === 'takeControlOfOpponentsTurn');
        const indexOfLatestReleaseOfControl = findLastIndex(playerEvents, e => e.type === 'releaseControlOfOpponentsTurn');

        if (indexOfLatestTakingOfControl > indexOfLatestReleaseOfControl) {
            const takeControlOfOpponentsTurnEvent = playerEvents[indexOfLatestTakingOfControl];
            const timeDifference = takeControlOfOpponentsTurnEvent.created - attackOnPlayer.created;
            return timeDifference >= 0 && timeDifference <= millisecondsTimeFrame;
        }

        return false;
    }

    function findLastIndex(collection, selector) {
        const indexInReverseCollection = collection.slice().reverse().findIndex(selector);
        if (indexInReverseCollection === -1) return -1;
        return (collection.length - 1) - indexInReverseCollection;
    }
};
