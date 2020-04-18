const User = require("../../shared/user/User.js");
const GuestUser = require("../../shared/user/GuestUser.js");

module.exports = function (deps) {

    const socketMaster = deps.socketMaster;

    const secretToUserId = new Map();
    const rawCookieToUserId = new Map();
    const usersById = new Map();

    return {
        getAll,
        getById,//TODO Rename to getUserDataById
        getUser,
        addUserAndClearOldUsers,
        addGuestUser,
        updateUser,
        authorizeWithSecret
    };

    async function getAll() {
        return Array.from(usersById.values());
    }

    async function getById(id) {
        return getUserData(id);
    }

    function addUserAndClearOldUsers(name, secret, rawCookie) {
        clearOldUsers();

        const user = createUser(name);
        addUser(user, secret);
        rawCookieToUserId.set(rawCookie, user.id);

        return user;
    }

    function addGuestUser(name, secret) {
        const user = createGuestUser(name);
        addUser(user, secret);

        return user;
    }

    function addUser(user, secret) {
        storeUserData(user);
        secretToUserId.set(secret, user.id);
        emitUserChange();
    }

    function updateUser(userId, mutator) {
        const user = getUser(userId);
        if (!user) return;

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

    function authorizeWithSecret(userId, secret) {
        return userId === userIdFromSecret(secret);
    }

    function createUser(name) {
        const id = createId();
        return User.fromData({ name, id });
    }

    function createGuestUser(name) {
        const id = createId();
        return GuestUser.fromData({ name, id });
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
        socketMaster.emit('user/change', getUserDatas());
    }

    function getUserDatas() {
        return Array.from(usersById.values());
    }

    function clearOldUsers() {
        const users = getUserDatas();
        const usersToRemove = users
            .map(userData => User.fromData(userData))
            .filter(user => {
                return user.timeAlive() > 24 * 60 * 60 * 1000;
            });
        usersToRemove.forEach(user => {
            usersById.delete(user.id);
        });
    }
};
