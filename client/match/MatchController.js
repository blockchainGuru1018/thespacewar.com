module.exports = function (deps) {

    const socket = deps.socket;
    const ownUserId = deps.ownUserId;
    const matchId = deps.matchId;
    const dispatch = deps.dispatch;

    return {
        start,
        stop,
        emit
    }

    function start() {
        socket.on('match', onSocketMatchEvent);
        emit('start');
    }

    function emit(action, value) {
        console.log(`\n[${new Date().toISOString()}] MatchController.emit(${action}, ${value})`);
        socket.emit('match', {
            matchId,
            playerId: ownUserId,
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
}