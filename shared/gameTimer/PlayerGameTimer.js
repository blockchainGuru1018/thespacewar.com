module.exports = function ({
    opponentClock,
    playerClock
}) {

    return {
        switchTo,
        hasEnded,
        resetAll
    };

    function switchTo() {
        opponentClock.stop();
        playerClock.start();
    }

    function hasEnded() {
        return playerClock.getTime() <= 0;
    }

    function resetAll(timePerPlayerInMinute) {
        const duration = (timePerPlayerInMinute || 15) * 60 * 1000;
        opponentClock.reset(duration);
        playerClock.reset(duration);
    }
};
