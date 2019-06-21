module.exports = function ({
    opponentClock,
    playerClock
}) {

    return {
        switchTo,
        resetAll
    };

    function switchTo() {
        opponentClock.stop();
        playerClock.start();
    }

    function resetAll() {
        const duration = 15 * 60 * 1000;
        opponentClock.reset(duration);
        playerClock.reset(duration);
    }
};
