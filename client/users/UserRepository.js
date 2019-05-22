const ajax = require('../utils/ajax.js');
const localGameDataFacade = require("../utils/localGameDataFacade.js");

module.exports = function (deps) {

    const socket = deps.socket;

    let ownUser = null;
    let cachedUsers = [];

    if (isAlreadyLoggedIn()) { //TODO Might be unnecessary if we still check this in LoadingStore
        ownUser = localGameDataFacade.getOwnUser();
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
            socket.emit('registerConnection', { secret: ajax.secret(), userId: user.id });
        }
    }

    function getOwnUser() {
        return ownUser;
    }

    async function getAll() {
        let users = await ajax.get('/user');
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
        return !!localGameDataFacade.getOwnUser();
    }
};
