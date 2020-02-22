module.exports = function ({
    miller,
    moreCardsCanBeDrawnForDrawPhase,
    playerDeck,
    playerPhase
}) {

    return {
        moreCardsCanBeDrawn,
        canPass
    };

    function moreCardsCanBeDrawn() {
        return moreCardsCanBeDrawnForDrawPhase()
            && playerDeck.hasMore();
    }

    function canPass() {
        return playerPhase.isDraw()
            && !miller.canMill()
            && !moreCardsCanBeDrawn();
    }
};
