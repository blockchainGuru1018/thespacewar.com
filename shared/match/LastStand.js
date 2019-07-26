const LastStandLength = 30 * 1000 + 499;
const LastStandLengthWithMargin = LastStandLength - 500;

LastStand.LastStandLength = LastStandLength;

function LastStand({
    matchService,
}) {

    return {
        canStart,
        remainingSeconds,
        hasStarted,
        hasEnded,
    };

    function canStart() {
        return !getLastStandInfo();
    }

    function hasEnded() {
        const info = getLastStandInfo();
        if (!info) return false;

        const duration = Date.now() - info.started;
        return duration >= LastStandLengthWithMargin;
    }

    function hasStarted() {
        return !!getLastStandInfo();
    }

    function remainingSeconds() {
        const info = getLastStandInfo();
        const duration = Date.now() - info.started;
        return Math.round((LastStandLength - duration) / 1000);
    }

    function getLastStandInfo() {
        return matchService.getState().lastStandInfo;
    }
}

module.exports = LastStand;
