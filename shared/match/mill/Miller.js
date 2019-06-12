const Commander = require("../commander/Commander.js");

module.exports = function ({
    playerRequirementService,
    playerStateService,
    playerCommanders,
    opponentStateService,
    opponentActionLog
}) {

    return {
        canMill,
        mill
    };

    function canMill() {
        if (playerRequirementService.isWaitingOnOpponentFinishingRequirement()) return false;
        if (opponentDeckIsEmpty()) return false;

        const hasTheMiller = playerCommanders.has(Commander.TheMiller);
        if (!hasTheMiller) return false;

        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });
        return drawCardRequirement || playerStateService.moreCardsCanBeDrawnForDrawPhase();
    }

    function mill() {
        const milledCards = opponentStateService.discardTopTwoCardsInDrawPile();
        playerStateService.registerMill();

        opponentActionLog.opponentMilledCardsFromYourDeck({
            milledCardCommonIds: milledCards.map(cardData => cardData.commonId)
        });
    }

    function opponentDeckIsEmpty() {
        return opponentStateService.deckIsEmpty();
    }
};
