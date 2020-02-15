module.exports = function ({
    cardsThatCanLookAtHandSizeStationRow
}) {
    return cardId => {
        return cardsThatCanLookAtHandSizeStationRow().some(card => card.id === cardId);
    };
};
