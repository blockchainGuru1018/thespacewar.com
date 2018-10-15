module.exports = function (deps) {

    const connection = deps.socket;

    const listenersByEventName = {};

    connection.on('command', async data => {
        let eventName = data.command;
        let listenersForEvent = listenersByEventName[eventName];
        if (listenersForEvent) {
            for (let listener of listenersForEvent) {
                await listener(data.value);
            }
        }
    });

    return {
        on(eventName, listener) {
            listenersByEventName[eventName] = listenersByEventName[eventName] || [];
            listenersByEventName[eventName].push(listener);
        },
        onAll(eventNameToCallback) {
            for (let eventName of Object.keys(eventNameToCallback)) {
                listenersByEventName[eventName] = listenersByEventName[eventName] || [];
                listenersByEventName[eventName].push(eventNameToCallback[eventName]);
            }
        },
        off(eventName, listener) {
            let listenersForEvent = listenersByEventName[eventName];
            if (listenersForEvent) {
                listenersByEventName[eventName] = listenersForEvent.filter(l => l !== listener);
            }
        },
        async emit(eventName, value) {
            connection.emit('command', { command: eventName, value });
        }
    };
};