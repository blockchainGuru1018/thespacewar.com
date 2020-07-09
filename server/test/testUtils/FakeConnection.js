const {stub} = require('./bocha-jest/bocha-jest.js');

module.exports = function FakeConnection(namesOfActionsToStub = [], stubFn = stub) {
    const stubMap = {};
    for (const name of namesOfActionsToStub) {
        stubMap[name] = stubFn();
    }
    const listenersByActionName = {};

    return {
        connected: true,
        disconnected: false,
        emit(_, {action, value}) {
            if (stubMap[action]) {
                stubMap[action](value);
            }
            if (listenersByActionName[action]) {
                listenersByActionName[action].forEach(listener => listener(value));
            }
        },
        on(action, callback) {
            listenersByActionName[action] = listenersByActionName[action] || [];
            listenersByActionName[action].push(callback);
        },
        ...stubMap
    };
};
