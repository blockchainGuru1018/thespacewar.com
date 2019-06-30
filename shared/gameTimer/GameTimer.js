module.exports = function ({ //TODO Rename => PlayerGameTimer
    opponentClock,
    playerClock
}) {

    return {
        switchTo,
        hasEnded,
        isAllSet,
        resetAll
    };

    function switchTo() {
        opponentClock.stop();
        playerClock.start();
    }

    function hasEnded() {
        return playerClock.getTime() <= 0;
    }

    function isAllSet() {
        return opponentClock.isSet()
            && playerClock.isSet();
    }

    function resetAll() {
        const duration = 15 * 60 * 1000;
        opponentClock.reset(duration);
        playerClock.reset(duration);
    }
};
