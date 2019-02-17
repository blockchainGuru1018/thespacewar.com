module.exports = function ({
    matchRepository,
    userRepository,
    route
}) {

    return {
        namespaced: true,
        name: 'lobby',
        state: {},
        actions: {
            init,
            startGameWithUser
        }
    }

    async function init() {
        matchRepository.onMatchCreatedForPlayer(joinMatch);
    }

    async function joinMatch({ id: matchId, playerIds }) {
        let ownUserId = userRepository.getOwnUser().id;
        let opponentUserId = playerIds.find(id => id !== ownUserId);
        let users = userRepository.getAllLocal();
        let opponentUser = users.find(u => u.id === opponentUserId);
        route('match', { matchId, opponentUser });
    }

    async function startGameWithUser({ state }, opponentUser) {
        let matchId;
        try {
            const playerId = userRepository.getOwnUser().id;
            const opponentId = opponentUser.id;
            const match = await matchRepository.create({ playerId, opponentId });
            matchId = match.id;
        } catch (error) {
            alert('Could not create match: ' + error.message);
        }

        if (matchId) {
            route('match', { matchId, opponentUser });
        }
    }
};