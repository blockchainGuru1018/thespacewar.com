module.exports = function LookAtStationRowCommand({
    lookAtStationRow
}) {
    return ({ cardId }) => {
        if (lookAtStationRow.cardCanDoIt(cardId)) {
            lookAtStationRow.doIt();
        }
    };
};
