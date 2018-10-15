module.exports = function (deps) {

    const socketMaster = deps.socketMaster;

    const connectionByUserId = new Map();

    return {
        getSocketMaster,
        setForUser,
        getForUser,
        hasConnectionToUser
    };

    function getSocketMaster() {
        return socketMaster;
    }

    function setForUser(userId, socket) {
        connectionByUserId.set(userId, socket);
    }

    function getForUser(userId) {
        return connectionByUserId.get(userId);
    }

    function hasConnectionToUser(userId) {
        return connectionByUserId.has(userId);
    }
};