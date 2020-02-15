module.exports = function ({ cardsThatCanLookAtHandSizeStationRow }) {
    return ({ cardId }) => {
        const card = findCardWithAction(cardId);
        if (card) {
            card.lookAtHandSizeStationRow();
        }
    };

    function findCardWithAction(cardId) {
        return cardsThatCanLookAtHandSizeStationRow().find(card => card.id === cardId);
    }
};
