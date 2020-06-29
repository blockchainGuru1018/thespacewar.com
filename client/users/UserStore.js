module.exports = function ({
    userRepository
}) {

    return {
        namespaced: true,
        name: 'user',
        state: {
            ownUser: userRepository.getOwnUser(),
            users: []
        },
        getters: {
            allowedInLobby
        },
        actions: {
            init,
            storeOwnUser
        }
    };

    function allowedInLobby(state) {
        return state.ownUser && state.ownUser.allowedInLobby;
    }

    async function init({ state }) {
        userRepository.onUsersChanged(users => {
            state.users = users;
        });

        state.users = await userRepository.getAll();
    }

    function storeOwnUser({ state }, ownUser) {
        state.ownUser = ownUser;
        userRepository.storeOwnUser(ownUser);
    }
};