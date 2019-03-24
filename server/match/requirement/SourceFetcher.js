module.exports = function ({
    playerStateService
}) {

    return {
        deck: specFilter => playerStateService.getCardsInDeck().filter(cardFilter(specFilter)),
        discardPile: specFilter => playerStateService.getDiscardedCards().filter(cardFilter(specFilter)),
        stationCards: specFilter => playerStateService.getStationCards().map(s => s.card).filter(cardFilter(specFilter)),
        hand: () => [],
        opponentDeck: () => [],
        opponentDiscardPile: () => [],
        opponentStationCards: () => [],
        opponnetHand: () => []
    };

    function cardFilter(filter = {}) {
        return card => {
            if ('type' in filter && !filter.type.includes(card.type)) {
                return false;
            }
            return true;
        };
    }
};