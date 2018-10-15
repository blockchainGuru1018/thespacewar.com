module.exports = function (deps) {

    const socket = deps.socket;
    const ownUserId = deps.ownUserId;
    const matchId = deps.matchId;
    const dispatch = deps.dispatch;

    socket.on('match', data => {
        console.log('Got match event on client', data);
        if (data.matchId === matchId) {
            dispatch(data.action, data.value);
        }
    });

    return {
        start,
        emit
    }

    function start() {
        emit('start');
    }

    function emit(action, value) {
        socket.emit('match', {
            matchId,
            playerId: ownUserId,
            action,
            value
        });
    }
}