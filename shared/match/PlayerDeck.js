module.exports = function PlayerDeck({
    playerStateService
}) {

    return {
        hasMore
    };

    function hasMore() {
        return deck().getCardCount() > 0;
    }

    function deck() {
        return playerStateService.getDeck();
    }
};
