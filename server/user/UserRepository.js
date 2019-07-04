const User = require("./User.js");

module.exports = function (deps) {

    const socketMaster = deps.socketMaster;

    const secretToUserId = new Map();
    const usersById = new Map();

    return {
        getAll,
        getById,//TODO Rename to getUserDataById
        getUser,
        addUser,
        updateUser,
        userIdFromSecret
    };

    async function getAll() {
        return Array.from(usersById.values());
    }

    async function getById(id) {
        return getUserData(id);
    }

    function addUser(name, secret) {
        let user = createUser(name);
        storeUserData(user);

        secretToUserId.set(secret, user.id);

        emitUserChange();

        return user;
    }

    function updateUser(userId, mutator) {
        const user = getUser(userId);
        mutator(user);
        storeUserData(user);

        emitUserChange();
    }

    function userIdFromSecret(secret) {
        if (secretToUserId.has(secret)) {
            return secretToUserId.get(secret);
        }
        else {
            return null;
        }
    }

    function createUser(name) {
        let id = createId();
        return User.fromData({ name, id });
    }

    function storeUserData(user) {
        usersById.set(user.id, user.toData());
    }

    function getUserData(id) {
        return usersById.get(id);
    }

    function getUser(id) {
        const userData = getUserData(id);
        if (!userData) return null;

        return User.fromData(userData);
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }

    function emitUserChange() {
        let users = Array.from(usersById.values());
        socketMaster.emit('user/change', users);
    }
};
