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

    function resetAll(timePerPlayerInMinutes) {
        const duration = (timePerPlayerInMinutes || 15) * 60 * 1000;
        opponentClock.reset(duration);
        playerClock.reset(duration);
    }
};
