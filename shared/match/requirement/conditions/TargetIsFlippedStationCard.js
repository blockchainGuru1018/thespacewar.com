module.exports = function TargetIsFlippedStationCard() {

    return {
        is,
        targetIsOpponentCard: () => true,
        check
    };

    function is(name) {
        return name === 'targetIsFlippedStationCard';
    }

    function check({ card, specForPlayer, targetOpponentCard }) {
        return targetOpponentCard.isFlippedStationCard();
    }
};
