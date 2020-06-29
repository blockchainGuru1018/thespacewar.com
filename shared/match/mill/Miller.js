const Commander = require("../commander/Commander.js");
const _canMill = require('./canMill.js');

module.exports = function ({
    queryPlayerRequirements,
    playerStateService,
    playerCommanders,
    playerRuleService,
    opponentStateService,
    opponentActionLog
}) {

    return {
        canMill,
        mill
    };

    function canMill() {
        return _canMill({
            isWaitingOnOpponentFinishingRequirement: queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement(),
            opponentDeckIsEmpty: opponentDeckIsEmpty(),
            playerHasTheMiller: playerCommanders.has(Commander.TheMiller),
            firstRequirementIsDrawCard: queryPlayerRequirements.firstRequirementIsOfType('drawCard'),
            moreCardsCanBeDrawnForDrawPhase: playerRuleService.moreCardsCanBeDrawnForDrawPhase()
        });
    }

    function mill({ byEvent = false } = {}) {
        const milledCards = opponentStateService.discardTopTwoCardsInDrawPile();
        playerStateService.registerMill({ byEvent });

        opponentActionLog.opponentMilledCardsFromYourDeck({
            milledCardCommonIds: milledCards.map(cardData => cardData.commonId)
        });
    }

    function opponentDeckIsEmpty() {
        return opponentStateService.deckIsEmpty();
    }
};
