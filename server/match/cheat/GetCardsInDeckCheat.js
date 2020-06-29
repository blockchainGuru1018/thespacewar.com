module.exports = function ({
    playerServiceProvider
}) {

    return {
        getType: () => 'getCardsInDeck',
        forPlayerWithData
    };

    function forPlayerWithData(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const deck = playerStateService.getDeck();
        return deck.getAll();
    }
};