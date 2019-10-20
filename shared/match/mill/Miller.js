const Commander = require("../commander/Commander.js");
const _canMill = require('./canMill.js');

module.exports = function ({
    playerRequirementService,
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
            isWaitingOnOpponentFinishingRequirement: playerRequirementService.isWaitingOnOpponentFinishingRequirement(),
            opponentDeckIsEmpty: opponentDeckIsEmpty(),
            playerHasTheMiller: playerCommanders.has(Commander.TheMiller),
            firstRequirementIsDrawCard: playerRequirementService.firstRequirementIsOfType('drawCard'),
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
