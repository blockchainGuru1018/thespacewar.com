module.exports = function ({
    miller,
    playerPhase,
    playerStateService
}) {

    return {
        canPass
    };

    function canPass() {
        return !miller.canMill()
            && playerPhase.isDraw()
            && playerStateService.deckIsEmpty();
    }
};
