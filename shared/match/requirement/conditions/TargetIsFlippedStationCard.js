module.exports = function TargetIsFlippedStationCard() {
    return {
        is,
        check
    };

    function is(name) {
        return name === 'targetIsFlippedStationCard';
    }

    function check({ card, specForPlayer, target }) {
        return true;
    }
};
