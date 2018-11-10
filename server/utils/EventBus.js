module.exports = function () {

    const listenersByEvent = {};

    return {
        on,
        emit
    }

    function on(event, listener) {
        listenersByEvent[event] = listenersByEvent[event] || [];
        listenersByEvent[event].push(listener);
    }

    function emit(event, data) {
        const listeners = listenersByEvent[event] || [];
        listeners.forEach(l => l(data));
    }
};