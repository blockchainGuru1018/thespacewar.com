const ajax = require('../utils/ajax.js');

module.exports = function (deps) { //TODO Rename MatchConnectionController or something better

    const socket = deps.socket;
    const ownUserId = deps.ownUserId;
    const matchId = deps.matchId;
    const dispatch = deps.dispatch;

    return {
        start,
        stop,
        emit
    };

    function start() {
        socket.on('match', onSocketMatchEvent);
        emit('start');

        document.addEventListener('visibilitychange', onVisibilityChange);
    }

    function emit(action, value) {
        console.log(`\n[${new Date().toISOString()}] MatchController.emit(${action}, ${JSON.stringify(value, null, 4)})`);
        socket.emit('match', {
            matchId,
            playerId: ownUserId,
            secret: ajax.secret(),
            action,
            value
        });
    }

    function stop() {
        socket.off('match', onSocketMatchEvent);
    }

    function onSocketMatchEvent(data) {
        console.log('Got match event on client', data);
        if (data.matchId === matchId) {
            dispatch(data.action, data.value);
        }
    }

    function onVisibilityChange() {
        if (!document.hidden) {
            emit('refresh');
        }
    }
};
