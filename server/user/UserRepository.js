module.exports = function (deps) {

    const socketMaster = deps.socketMaster;

    const usersById = new Map();

    return {
        getAll,
        getById,
        addUser
    };

    async function getAll() {
        return Array.from(usersById.values());
    }

    async function getById(id) {
        return usersById.get(id);
    }

    function addUser(name) {
        let id = createId();
        let user = { name, id };
        usersById.set(id, user);

        let users = Array.from(usersById.values());
        socketMaster.emit('user/change', users);

        return user;
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
};