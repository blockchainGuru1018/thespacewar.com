module.exports = function ({
    matchController
}) {

    return {
        toggleControlOfTurn
    };

    function toggleControlOfTurn() {
        matchController.emit('toggleControlOfTurn');
    }
};
