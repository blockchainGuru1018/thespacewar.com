module.exports = function ({
    playerStateService
}) {

    return {
        deck,
        discardPile,
        actionStationCards,
        drawStationCards,
        handSizeStationCards,
        hand: () => [],
        opponentDeck: () => [],
        opponentDiscardPile: () => [],
        opponentStationCards: () => [],
        opponnetHand: () => []
    };

    function deck(specFilter) {
        return playerStateService.getCardsInDeck().filter(cardFilter(specFilter));
    }

    function discardPile(specFilter) {
        return playerStateService.getDiscardedCards().filter(cardFilter(specFilter));
    }

    function drawStationCards(specFilter) {
        return playerStateService.getDrawStationCards()
            .map(cardFromStationCard)
            .filter(cardFilter(specFilter));
    }

    function actionStationCards(specFilter) {
        return playerStateService.getActionStationCards()
            .map(cardFromStationCard)
            .filter(cardFilter(specFilter));
    }

    function handSizeStationCards(specFilter) {
        return playerStateService.getHandSizeStationCards()
            .map(cardFromStationCard)
            .filter(cardFilter(specFilter));
    }

    function cardFilter(filter = {}) {
        return card => {
            if (!cardFulfillsTypeFilter(card, filter)) {
                return false;
            }
            return true;
        };
    }

    function cardFulfillsTypeFilter(card, filter) {
        const hasTypeFilter = 'type' in filter;
        return !hasTypeFilter || filter.type.includes(card.type);
    }

    function cardFromStationCard(stationCard) {
        return stationCard.card;
    }
};