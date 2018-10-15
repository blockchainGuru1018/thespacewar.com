const ajax = require('../utils/ajax.js');

module.exports = function (deps) {

    const socket = deps.socket;
    const userRepository = deps.userRepository;

    return {
        create,
        getOwnState,
        onMatchCreatedForPlayer
    };

    async function create({ playerId, opponentId }) {
        return await ajax.jsonPost('/match', { playerId, opponentId });
    }

    async function getOwnState(matchId) {
        let playerId = userRepository.getOwnUser().id;
        return await ajax.get(`/match/${matchId}/player/${playerId}/state`);
    }

    function onMatchCreatedForPlayer(callback) {
        socket.on('match/create', matchData => {
            let ownUserId = userRepository.getOwnUser().id;
            if (matchData.playerIds.includes(ownUserId)) {
                callback(matchData);
            }
        });
    }
};