module.exports = function ({ matchService, queryEvents, playerStateService }) {
    return () => {
        const currentTurn = matchService.getTurn();
        const cardDrawEvents = queryEvents.getCardDrawsOnTurn(currentTurn);
        const cardsToDrawOnTurnCount = playerStateService.getStationDrawCardsCount();
        return cardsToDrawOnTurnCount - cardDrawEvents.length;
    };
};
