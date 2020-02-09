const { stub } = require('./bocha-jest/bocha-jest.js');

module.exports = function FakeConnection(namesOfActionsToStub = []) {
    const stubMap = {};
    for (const name of namesOfActionsToStub) {
        stubMap[name] = stub();
    }
    const listenersByActionName = {};

    return {
        emit(_, { action, value }) {
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
