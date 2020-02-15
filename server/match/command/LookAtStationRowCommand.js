const CheatError = require('../../../shared/match/card/CheatError.js');

module.exports = function LookAtStationRowCommand({
    lookAtStationRow
}) {
    return ({ cardId }) => {
        if (!lookAtStationRow.cardCanDoIt(cardId)) {
            throw new CheatError('Cannot look at station row');
        }
        if (lookAtStationRow.cardCanDoIt(cardId)) {
            lookAtStationRow.doIt();
        }
    };
};
