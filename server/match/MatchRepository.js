module.exports = function ({
    userRepository,
    socketRepository,
    matchFactory
}) {

    const matchById = new Map();
    const matchByUserId = new Map();

    return {
        create,
        reconnect,
        getById,
        getForUser,
        clearOldMatches
    };

    async function create({ playerId, opponentId }) {
        if (!socketRepository.hasConnectionToUser(opponentId)) {
            throw new Error('Opponent player is not connected');
        }
        if (getForUser(playerId)) {
            throw new Error('Player is already in a match');
        }
        if (getForUser(opponentId)) {
            throw new Error('Opponent is already in a match');
        }

        const users = await getUsers([playerId, opponentId]);
        if (users.some(u => u === null)) throw new Error('Some users for the match does not exist');

        const match = matchFactory.create({ users, endMatch });
        registerMatchWithUsers(match, users);

        emitMatchCreate(match, opponentId);

        return match.toClientModel();
    }

    async function reconnect({ playerId, matchId }) {
        const match = getForUser(playerId);
        if (!match) throw new Error('Cannot find match for player');

        await updatePlayerMatchConnection(playerId, matchId);
        registerUserEnteredMatch(playerId);
    }

    function getById(id) {
        return matchById.get(id) || null;
    }

    function getForUser(userId) {
        return matchByUserId.get(userId);
    }

    function clearOldMatches() {
        const matchIdsToClear = [];
        matchById.forEach((match, matchId) => {
            if (match.timeAlive() > 24 * 60 * 60 * 1000) {
                matchIdsToClear.push(matchId);
            }
        });
        matchIdsToClear.forEach(matchId => endMatch(matchId));
    }

    function endMatch(matchId) {
        let userIdsWithMatchRegistered = getMatchUserIds(matchId);
        for (const userId of userIdsWithMatchRegistered) {
            registerUserExitedMatch(userId);
            matchByUserId.delete(userId);
        }

        matchById.delete(matchId);
    }

    function getMatchUserIds(matchId) {
        let userIds = [];
        matchByUserId.forEach((match, userId) => {
            if (match.id === matchId) {
                userIds.push(userId);
            }
        });

        return userIds;
    }

    async function updatePlayerMatchConnection(playerId, matchId) {
        const match = await getById(matchId);
        const connection = socketRepository.getForUser(playerId);
        match.updatePlayer(playerId, { connection });
    }

    function getUsers(userIds) {
        return Promise.all(userIds.map(id => userRepository.getUser(id)));
    }

    function emitMatchCreate(match, userId) {
        let opponentSocket = socketRepository.getForUser(userId);
        opponentSocket.emit('match/create', match.toClientModel());
    }

    function registerMatchWithUsers(match, users) {
        matchById.set(match.id, match);

        for (const user of users) {
            const userId = user.id;
            matchByUserId.set(userId, match);
            registerUserEnteredMatch(userId);
        }
    }

    function registerUserEnteredMatch(userId) {
        userRepository.updateUser(userId, user => {
            user.enteredMatch();
        });
    }

    function registerUserExitedMatch(userId) {
        userRepository.updateUser(userId, user => {
            user.exitedMatch();
        });
    }
};
