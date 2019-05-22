module.exports = function (deps) {

    const socketMaster = deps.socketMaster;

    const secretToUserId = new Map();
    const usersById = new Map();

    return {
        getAll,
        getById,
        addUser,
        userIdFromSecret
    };

    async function getAll() {
        return Array.from(usersById.values());
    }

    async function getById(id) {
        return usersById.get(id);
    }

    function addUser(name, secret) {
        let id = createId();
        let user = { name, id };
        usersById.set(id, user);
        secretToUserId.set(secret, id);

        let users = Array.from(usersById.values());
        socketMaster.emit('user/change', users);

        return user;
    }

    function userIdFromSecret(secret) {
        if (secretToUserId.has(secret)) {
            return secretToUserId.get(secret);
        }
        else {
            return null;
        }
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
};
