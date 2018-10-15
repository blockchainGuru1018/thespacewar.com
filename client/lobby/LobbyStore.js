module.exports = function (deps) {

    const matchRepository = deps.matchRepository;
    const userRepository = deps.userRepository;
    const route = deps.route;

    return {
        namespaced: true,
        state: {
            users: [],
            ownUser: userRepository.getOwnUser()
        },
        mutations: {
            SET_USERS
        },
        actions: {
            init,
            startGameWithUser
        }
    }

    function SET_USERS(state, users) {
        state.users = users
            .filter(u => u.id !== state.ownUser.id)
            .map(toUserModel);
    }

    async function init({ commit }) {
        userRepository.onUsersChanged(users => {
            commit('SET_USERS', users);
        });

        let users = await userRepository.getAll();
        commit('SET_USERS', users);

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
            const match = await matchRepository.create({
                playerId: state.ownUser.id,
                opponentId: opponentUser.id
            });
            matchId = match.id;
        }
        catch (error) {
            alert('Could not create match: ' + error.message);
        }

        if (matchId) {
            route('match', { matchId, opponentUser });
        }
    }

    function toUserModel(user) {
        return {
            id: user.id,
            name: user.name
        }
    }
};