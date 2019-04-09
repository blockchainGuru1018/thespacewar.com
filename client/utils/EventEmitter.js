module.exports = function (events) {

    const listenerByEvent = {};

    return {
        on,
        emit
    };

    function on(event, callback) {
        if (!events.includes(event)) throw new Error(`Event "${event}" is not permitted in emitter`);

        listenerByEvent[event] = listenerByEvent[event] || [];
        listenerByEvent[event].push(callback);
    }

    function emit(event) {
        for (const listener of getListenersForEvent(event)) {
            listener(event);
        }
    }

    function getListenersForEvent(event) {
        return listenerByEvent[event] || [];
    }
};