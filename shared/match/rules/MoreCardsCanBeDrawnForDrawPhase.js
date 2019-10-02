module.exports = function MoreCardsCanBeDrawnForDrawPhase({
    playerPhase,
    countCardsLeftToDrawForDrawPhase
}) {
    return () => {
        return playerPhase.isDraw()
            && countCardsLeftToDrawForDrawPhase() > 0
    };
};
