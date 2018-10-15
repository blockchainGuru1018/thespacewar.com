const ajax = require('../utils/ajax.js');

module.exports = function (deps) {

    const socket = deps.socket;

    let ownUser = null;
    let cachedUsers = [];

    return {
        storeOwnUser,
        getOwnUser,
        getAll,
        getAllLocal,
        onUsersChanged
    };

    function storeOwnUser(user) {
        socket.emit('registerConnection', { userId: user.id });
        ownUser = user;
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
};