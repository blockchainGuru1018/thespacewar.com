module.exports = function ({
    playerStateService,
    opponentStateService,
    canThePlayer
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
        opponentDrawStationCards,
        opponentActionStationCards,
        opponentHandSizeStationCards,
        opponentHand,
        opponentAny
    };

    function deck(specFilter) {
        return playerStateService
            .getCardsInDeck()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function discardPile(specFilter) {
        return playerStateService
            .getDiscardedCards()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function drawStationCards(specFilter) {
        return playerStateService
            .getDrawStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function actionStationCards(specFilter) {
        return playerStateService
            .getActionStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function handSizeStationCards(specFilter) {
        return playerStateService
            .getHandSizeStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function opponentAny(specFilter, { triggerCard } = { triggerCard: null }) {
        return opponentStateService
            .getMatchingBehaviourCardsPutDownAnywhere(cardFilter(specFilter, triggerCard))
            .map(card => card.getCardData());
    }

    function opponentDrawStationCards(specFilter) {
        return opponentStateService
            .getDrawStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function opponentActionStationCards(specFilter) {
        return opponentStateService
            .getActionStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function opponentHandSizeStationCards(specFilter) {
        return opponentStateService
            .getHandSizeStationCards()
            .filter(stationCardFilter(specFilter))
            .map(cardFromStationCard)
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function opponentHand(specFilter) {
        return opponentStateService
            .getCardsOnHand()
            .map(cardData => playerStateService.createBehaviourCard(cardData))
            .filter(cardFilter(specFilter))
            .map(card => card.getCardData());
    }

    function cardFilter(filter = {}, triggerCard = null) {
        return card => {
            if (!cardFulfillsTypeFilter(card, filter)) return false;
            if (!cardFulfillsCanBeCounteredFilter(triggerCard, card, filter)) return false;

            return true;
        };
    }

    function stationCardFilter(filter = {}) {
        return stationCard => {
            if ('onlyFlippedStationCards' in filter) {
                return filter.onlyFlippedStationCards
                    ? stationCard.flipped
                    : !stationCard.flipped;
            }
            return true;
        };
    }

    function cardFulfillsCanBeCounteredFilter(triggerCard, card, filter) {
        if (filter.canBeCountered !== true) return true;

        return canThePlayer.counterCard(card)
            && triggerCard.canCounterCard(card);
    }

    function cardFulfillsTypeFilter(card, filter) {
        const hasTypeFilter = 'type' in filter;
        return !hasTypeFilter || filter.type.includes(card.type);
    }

    function cardFromStationCard(stationCard) {
        return stationCard.card;
    }
};
