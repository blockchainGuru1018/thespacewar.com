module.exports = function () {

    return {
        name: 'ghost',
        namespaced: true,
        state: {},
        getters: {
            activateEventCardGhostVisible,
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

    function _holdingEventCard(state, getters, rootState) {
        const holdingCardData = rootState.card.holdingCard;
        return holdingCardData && holdingCardData.type === 'event';
    }
};
