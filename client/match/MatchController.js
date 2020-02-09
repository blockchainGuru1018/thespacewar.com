const ajax = require('../utils/ajax.js');

module.exports = function (deps) { //TODO Rename MatchConnectionController or something better

    const socket = deps.socket;
    const ownUserId = deps.ownUserId;
    const matchId = deps.matchId;
    const dispatch = deps.dispatch;
    const playerIdControllerBot = deps.playerIdControllerBot || '';

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
        console.info(`\n[${new Date().toISOString()}] MatchController.emit(${action}, ${JSON.stringify(value, null, 4)})`);
        const data = {
            matchId,
            playerId: ownUserId,
            secret: ajax.secret(),
            action,
            value
        };
        if (playerIdControllerBot) {
            data.playerIdControllerBot = playerIdControllerBot;
        }
        socket.emit('match', data);
    }

    function stop() {
        socket.off('match', onSocketMatchEvent);

        document.removeEventListener('visibilitychange', onVisibilityChange);
    }

    function onSocketMatchEvent(data) {
        console.info('Got match event on client', data);

        const isMatchEvent = data.matchId === matchId;
        const shouldReactToPlayerEvent = data.playerId === ownUserId;

        if (isMatchEvent && shouldReactToPlayerEvent) {
            dispatch(data.action, data.value);
        }
    }

    function onVisibilityChange() {
        if (!document.hidden) {
            emit('refresh');
        }
    }
};
