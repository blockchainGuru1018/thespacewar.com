const ajax = require('../utils/ajax.js');

module.exports = function (deps) {

    const socket = deps.socket;

    let ownUser = null;
    let cachedUsers = [];

    if (isAlreadyLoggedIn()) { //TODO Might be unnecessary if we still check this in LoadingStore
        const ownUserJson = localStorage.getItem('own-user');
        ownUser = JSON.parse(ownUserJson);
    }

    return {
        storeOwnUser,
        getOwnUser,
        getAll,
        getAllLocal,
        onUsersChanged
    };

    function storeOwnUser(user) {
        ownUser = user;

        if (!!user) {
            socket.emit('registerConnection', { userId: user.id });
        }
    }

    function getOwnUser() {
        return ownUser;
    }

    async function getAll() {
        let users = await ajax.get('/user')
        cachedUsers = [...users];
        return users;
    }

    function getAllLocal() {
        return [...cachedUsers];
    }

    function onUsersChanged(callback) {
        socket.on('user/change', users => {
            cachedUsers = [...users];
            callback(users);
        });
    }

    function isAlreadyLoggedIn() {
        return !!localStorage.getItem('own-user');
    }
};