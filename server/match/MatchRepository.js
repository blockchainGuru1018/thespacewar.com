const Match = require('./Match.js');

module.exports = function (deps) {

    const userRepository = deps.userRepository;
    const socketRepository = deps.socketRepository;

    const matchById = new Map();
    const matchByUserId = new Map();

    return {
        create,
        reconnect,
        getById,
        getForUser
    };

    async function create({ playerId, opponentId }) {
        if (!socketRepository.hasConnectionToUser(opponentId)) {
            throw new Error('Opponent player is not connected');
        }

        const playerUsers = await Promise.all([
            userRepository.getById(playerId),
            userRepository.getById(opponentId)
        ]);
        const players = playerUsers.map(user => {
            return {
                id: user.id,
                name: user.name,
                connection: socketRepository.getForUser(user.id)
            };
        });

        let matchId = createId();
        let match = Match({ players, matchId });
        matchById.set(matchId, match);
        matchByUserId.set(playerId, match);
        matchByUserId.set(opponentId, match);

        let matchClientModel = match.toClientModel();
        let opponentSocket = socketRepository.getForUser(opponentId);
        opponentSocket.emit('match/create', matchClientModel);
        return matchClientModel;
    }

    async function reconnect({ playerId, matchId }) {
        console.log(' -- reconnecting user to match', playerId, matchId);
        const match = await getById(matchId);
        const connection = socketRepository.getForUser(playerId);
        match.updatePlayer(playerId, { connection });
    }

    function getById(id) {
        return matchById.get(id) || null;
    }

    function getForUser(userId) {
        return matchByUserId.get(userId);
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
};