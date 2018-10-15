const MatchController = require('./MatchController.js');

module.exports = function (deps) {

    const socket = deps.socket;
    const userRepository = deps.userRepository;

    return {
        create
    };

    function create({ matchId, dispatch }) {
        return MatchController({
            socket,
            dispatch,
            matchId,
            ownUserId: userRepository.getOwnUser().id
        });
    }
};