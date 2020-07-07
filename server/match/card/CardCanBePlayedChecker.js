const Checkers = [require("./putDown/PutDownFatalError.js")];

module.exports = function CardCanBePlayedChecker(deps) {
    const checkerByCommonId = {};

    for (const Command of Checkers) {
        checkerByCommonId[Command.CommonId] = Command(deps);
    }

    return {
        hasCheckerForCard,
        canBePlayed,
    };

    function hasCheckerForCard({ commonId }) {
        return getCheckerForCard({ commonId });
    }

    function canBePlayed(playerId, cardData, { choice = "" } = {}) {
        const checker = getCheckerForCard(cardData);
        return checker.canBePlayed(playerId, cardData, { choice });
    }

    function getCheckerForCard({ commonId }) {
        return checkerByCommonId[commonId];
    }
};
