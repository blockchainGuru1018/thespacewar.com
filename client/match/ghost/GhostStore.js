module.exports = function () {

    return {
        name: 'ghost',
        namespaced: true,
        state: {},
        getters: {
            activateEventCardGhostVisible,
            _canPutDownHoldingCard,
            _canAffordHoldingCard,
            _canAffordCard,
            _holdingEventCard
        }
    };

    function activateEventCardGhostVisible(state, getters, rootState, rootGetters) {
        const gameOn = rootGetters['match/gameOn'];
        if (!gameOn) return false;

        if (!getters._holdingEventCard) return false;

        const showOnlyCardGhostsFor = rootState.card.showOnlyCardGhostsFor;
        if (showOnlyCardGhostsFor && !showOnlyCardGhostsFor.includes('homeZone')) return false;

        return true;
    }

    function _canPutDownHoldingCard(state, getters, rootState, rootGetters) {
        if (!getters._canAffordHoldingCard) return false;
        const gameOn = rootGetters['match/gameOn'];
        if (!gameOn) return false;

        const createCard = rootGetters['match/createCard'];
        const holdingCardData = rootState.card.holdingCard;
        const holdingCard = createCard(holdingCardData);
        if (holdingCard.canBePutDownAnyTime()) return true;

        const canPutDownCards = rootGetters['permission/canPutDownCards'];
        const canPutDownHoldingCard = rootGetters['match/canPutDownCard'](holdingCardData);
        return canPutDownCards
            && canPutDownHoldingCard;
    }

    function _canAffordHoldingCard(state, getters, rootState) {
        return getters._canAffordCard(rootState.card.holdingCard);
    }

    function _canAffordCard(state, getters, rootState, rootGetters) {
        return card => rootGetters['match/actionPoints2'] >= card.cost;
    }

    function _holdingEventCard(state, getters, rootState) {
        const holdingCardData = rootState.card.holdingCard;
        return holdingCardData && holdingCardData.type === 'event';
    }
};
