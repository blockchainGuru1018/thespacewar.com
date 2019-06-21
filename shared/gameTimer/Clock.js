const NullState = {
    startTime: 0,
    duration: 0,
    events: []
};

function Clock({ playerStateService }) {

    return {
        reset,
        start,
        stop,
        getTime
    };

    function reset(duration) {
        const startTime = Date.now();

        playerStateService.update(playerState => {
            playerState.clock.events = [];
            playerState.clock.duration = duration;
            playerState.clock.startTime = startTime;
        });

        stop();
    }

    function start() {
        if (latestEventType() === 'start') return;

        pushEvent({
            type: 'start',
            time: Date.now()
        });
    }

    function stop() {
        if (latestEventType() === 'stop') return;

        pushEvent({
            type: 'stop',
            time: Date.now()
        });
    }

    function latestEventType() {
        const events = state().events;
        if (events.length === 0) {
            return 'start';
        }

        return events[events.length - 1].type;
    }

    function getTime() {
        const { startTime, duration } = state();
        if (startTime === 0) return duration;

        const now = Date.now();
        const elapsedTimeIfNotInterrupted = now - startTime;
        return duration - (elapsedTimeIfNotInterrupted - totalElapsedInterruptionTime(now));
    }

    function pushEvent(event) {
        playerStateService.update(playerState => {
            playerState.clock.events.push(event);
        });
    }

    function totalElapsedInterruptionTime(now) {
        const events = state().events;

        let interruptionTime = 0;
        let lastStop = null;
        for (const event of events) {
            if (lastStop === null && event.type === 'stop') {
                lastStop = event;
            }
            else if (event.type === 'start') {
                interruptionTime += event.time - lastStop.time;
                lastStop = null;
            }
        }

        if (lastStop !== null) {
            interruptionTime += now - lastStop.time;
        }

        return interruptionTime;
    }

    function state() {
        if (clockInitialized()) {
            return playerStateService.getPlayerState().clock;
        }
        return NullState;
    }

    function clockInitialized() {
        const playerState = playerStateService.getPlayerState();
        return !!playerState.clock.events;

    }
}

module.exports = Clock;
