module.exports = function ({
    utils,
    matchController
}) {
    return {
        canMoveSomeCardInHomeZone,
        moveFirstAvailableCardFromHomeZone
    };

    function canMoveSomeCardInHomeZone() {
        return !!getFirstCardThatCanMove();
    }

    function moveFirstAvailableCardFromHomeZone() {
        const card = getFirstCardThatCanMove();
        matchController.emit('move', card.id);
    }

    function getFirstCardThatCanMove() {
        for (const card of utils.getBehaviourCardsInHomeZone()) {
            if (card.canMove()) return card;
        }

        return null;
    }
};
