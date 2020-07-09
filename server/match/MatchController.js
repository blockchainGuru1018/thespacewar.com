module.exports = function (deps) {

    const matchRepository = deps.matchRepository;
    const socketRepository = deps.socketRepository;
    const userRepository = deps.userRepository;
    const logger = deps.logger;

    return {
        create,
        createWithBot,
        getOwnState,
        onAction,
        _testMatchRestoration
    };

    async function create(req, res) {
        const playerId = req.body.playerId;
        const opponentId = req.body.opponentId;
        if (!playerId || !opponentId) throw new Error('Illegal operation');

        matchRepository.clearOldMatches();
        const match = await matchRepository.create({playerId, opponentId});

        res.json(match);
    }

    async function createWithBot(req, res) {
        const playerId = req.params.playerId;
        if (!playerId) throw new Error('Illegal operation');

        matchRepository.clearOldMatches();
        const match = await matchRepository.createWithBot({playerId});

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
            try {
                match[data.action](userId, data.value);
            } catch (e) {
                console.log(e);
            }
        } else {
            sendMatchIsDeadMessageToUserSocketConnection({userId, matchId});
            userRepository.update(userId, user => {
                user.exitedMatchEndingScreen();
            });

        }
    }

    async function _testMatchRestoration() {
        await matchRepository.storeAll();

        matchRepository._deleteAll();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await matchRepository.restoreAll();
    }

    function matchActionLogMessage({action, value, playerId}) {
        const actionValueJson = JSON.stringify(value, null, 4);
        return `[${new Date().toISOString()}] Match action: ${action} - To player: ${playerId} - With value: ${actionValueJson}`;
    }

    function sendMatchIsDeadMessageToUserSocketConnection({userId, matchId}) {
        const userConnection = socketRepository.getForUser(userId);
        try {
            userConnection.emit('match', {matchId, playerId: userId, action: 'matchIsDead'});
        } catch (error) {
            logger.log(`Disconnected user - Tried to emit to user that has disconnected (matchId:${matchId}, userId:${userId})`, 'match');
        }
    }
};
