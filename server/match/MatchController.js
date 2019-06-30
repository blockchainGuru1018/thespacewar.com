module.exports = function (deps) {

    const matchRepository = deps.matchRepository;
    const socketRepository = deps.socketRepository;
    const logger = deps.logger;

    return {
        create,
        getOwnState,
        onAction
    };

    async function create(req, res) {
        const playerId = req.body.playerId;
        const opponentId = req.body.opponentId;
        if (!playerId || !opponentId) throw new Error('Illegal operation');

        const match = await matchRepository.create({ playerId, opponentId });
        res.json(match);
    }

    async function getOwnState(req, res) {
        const matchId = req.params.matchId;
        const playerId = req.params.playerId;
        const match = await matchRepository.getById(matchId);
        const state = match.getOwnState(playerId);
        res.json(state);
    }

    async function onAction(data) {
        const userId = data.playerId;
        const matchId = data.matchId;

        const match = await matchRepository.getById(matchId);
        if (match) {
            logger.log(matchActionLogMessage(data), 'match');
            match[data.action](userId, data.value);
        }
        else {
            sendMatchIsDeadMessageToUserSocketConnection({ userId, matchId });
        }
    }

    function matchActionLogMessage({ action, value, playerId }) {
        const actionValueJson = JSON.stringify(value, null, 4);
        return `[${new Date().toISOString()}] Match action: ${action} - To player: ${playerId} - With value: ${actionValueJson}`;
    }

    function sendMatchIsDeadMessageToUserSocketConnection({ userId, matchId }) {
        const userConnection = socketRepository.getForUser(userId);
        userConnection.emit('match', { matchId, action: 'matchIsDead' });
    }
};
