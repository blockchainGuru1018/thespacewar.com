const MatchController = require('./MatchController.js');

module.exports = function ({
    socket,
    userRepository
}) {

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